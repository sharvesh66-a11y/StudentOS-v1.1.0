/**
 * StudentOS Junova AI — AI Provider
 *
 * Wraps the z-ai-web-dev-sdk into a clean interface. This is the ONLY file
 * that imports the SDK directly — all other code calls these functions.
 *
 * SERVER-ONLY. Must never be imported from client code.
 *
 * @see src/features/junova/services/prompt-builder.ts
 */

import 'server-only';
import ZAI from 'z-ai-web-dev-sdk';
import type { AITeacher, StudentMemory, AIRecommendations } from '../types';
import type { ScheduleTopic } from '../../planner/types';
import { buildSystemPrompt, buildSuggestionsPrompt } from './prompt-builder';

// ---------------------------------------------------------------------------
// SDK singleton
// ---------------------------------------------------------------------------

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface GenerateResponseParams {
  teacher: AITeacher;
  userMessage: string;
  history: ChatMessage[];
  /** Optional student memory for personalization (Phase 2). */
  memory?: StudentMemory | null;
}

export interface GenerateSuggestionsParams {
  teacher: AITeacher;
  lastUserMessage: string;
  lastAssistantResponse: string;
}

// ---------------------------------------------------------------------------
// Generate a complete response (non-streaming)
// ---------------------------------------------------------------------------

export async function generateResponse({
  teacher,
  userMessage,
  history,
  memory,
}: GenerateResponseParams): Promise<string> {
  const zai = await getZAI();
  const systemPrompt = buildSystemPrompt(teacher, memory);

  const messages: ChatMessage[] = [
    { role: 'assistant', content: systemPrompt },
    ...history.slice(-20), // Keep last 20 messages for context
    { role: 'user', content: userMessage },
  ];

  const completion = await zai.chat.completions.create({
    messages,
    thinking: { type: 'disabled' },
  });

  return completion.choices[0]?.message?.content ?? '';
}

// ---------------------------------------------------------------------------
// Generate a streaming response (async generator)
// ---------------------------------------------------------------------------

/**
 * Generate a streaming response. Yields text chunks as they arrive.
 *
 * Since z-ai-web-dev-sdk may not support native streaming, this simulates
 * streaming by chunking the complete response into word groups with small
 * delays. This gives the UX of streaming while using the non-streaming API.
 *
 * When the SDK adds native streaming support, this function can be updated
 * to use it without changing the caller interface.
 */
export async function* generateStreamingResponse({
  teacher,
  userMessage,
  history,
  memory,
}: GenerateResponseParams): AsyncGenerator<string, void, unknown> {
  const fullResponse = await generateResponse({ teacher, userMessage, history, memory });

  // Simulate streaming by yielding chunks
  const words = fullResponse.split(/(\s+)/);
  const chunkSize = 3; // words per chunk

  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize).join('');
    yield chunk;
    // Small delay to simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 30));
  }
}

// ---------------------------------------------------------------------------
// Generate suggested follow-up questions
// ---------------------------------------------------------------------------

export async function generateSuggestions({
  teacher,
  lastUserMessage,
  lastAssistantResponse,
}: GenerateSuggestionsParams): Promise<string[]> {
  try {
    const zai = await getZAI();
    const prompt = buildSuggestionsPrompt(teacher, lastUserMessage, lastAssistantResponse);

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: `You are a helpful assistant that generates follow-up study questions for ${teacher.subject}. Return exactly 3 questions, one per line, no numbering or bullets.`,
        },
        { role: 'user', content: prompt },
      ],
      thinking: { type: 'disabled' },
    });

    const text = completion.choices[0]?.message?.content ?? '';
    return text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.match(/^\d+\./))
      .slice(0, 3);
  } catch {
    // Silently fail — suggestions are non-critical
    return [];
  }
}

// ---------------------------------------------------------------------------
// Generate personalized recommendations (Phase 2)
// ---------------------------------------------------------------------------

export interface GenerateRecommendationsParams {
  memory: StudentMemory;
  teachers: AITeacher[];
}

/**
 * Generate personalized study recommendations based on the student's memory.
 * Returns a structured AIRecommendations object (without uid/timestamps —
 * the caller sets those).
 *
 * SERVER-ONLY. Never call from client code.
 */
export async function generateRecommendations({
  memory,
  teachers,
}: GenerateRecommendationsParams): Promise<
  Omit<AIRecommendations, 'uid' | 'createdAt' | 'updatedAt' | 'generatedAt'>
> {
  const zai = await getZAI();

  // Build a compact memory summary for the prompt
  const memorySummary = [
    `Name: ${memory.displayName ?? 'Unknown'}`,
    `Grade: ${memory.grade ?? 'Not set'}`,
    `Subjects: ${memory.subjects.join(', ') || 'None'}`,
    `Weak topics: ${memory.weakTopics.join(', ') || 'None'}`,
    `Strong topics: ${memory.strongTopics.join(', ') || 'None'}`,
    `Exam goals: ${memory.examGoals.join(', ') || 'None'}`,
    `Learning style: ${memory.learningStyle ?? 'Not set'}`,
    `Preferred language: ${memory.preferredLanguage}`,
    `Daily routine: ${memory.dailyRoutine ?? 'Not set'}`,
    `Recent topics: ${memory.recentTopics.join(', ') || 'None'}`,
    `Conversation summary: ${memory.conversationSummary ?? 'None'}`,
  ].join('\n');

  const teacherList = teachers
    .map((t) => `- ${t.name} (${t.subject}, preset: ${t.preset}, style: ${t.teachingStyle})`)
    .join('\n');

  const prompt = `You are Junova, the AI core of StudentOS. Based on the student's memory below, generate personalized study recommendations.

STUDENT MEMORY:
${memorySummary}

AVAILABLE TEACHERS:
${teacherList || 'No teachers created yet'}

Generate recommendations as a JSON object with EXACTLY this structure (no markdown, no code fences, just raw JSON):
{
  "nextChapter": "The next chapter or topic the student should study",
  "revisionTopics": ["topic1", "topic2", "topic3"],
  "practiceRecommendations": ["practice item 1", "practice item 2"],
  "dailyGoals": ["goal 1", "goal 2", "goal 3"],
  "studyPath": ["step 1", "step 2", "step 3", "step 4"],
  "examReadinessScore": 65,
  "examReadinessExplanation": "Brief explanation of the score",
  "recommendedTeacherId": "teacher-id-here-or-null",
  "recommendedTeacherReason": "Why this teacher is recommended",
  "motivationalInsight": "A 1-2 sentence motivational message"
}

Rules:
- examReadinessScore must be 0-100
- revisionTopics: 2-5 topics from weakTopics or recentTopics
- dailyGoals: 2-5 specific, actionable goals for today
- studyPath: 3-6 ordered steps
- recommendedTeacherId: pick the best teacher ID from the list above, or null if no teachers exist
- motivationalInsight: encouraging and specific to the student's situation
- All text in preferredLanguage (${memory.preferredLanguage})`;

  try {
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content:
            'You are a JSON-only response generator. Return valid JSON with no markdown, no code fences, no extra text.',
        },
        { role: 'user', content: prompt },
      ],
      thinking: { type: 'disabled' },
    });

    const text = completion.choices[0]?.message?.content ?? '';

    // Extract JSON from the response (handles code-fence-wrapped JSON too)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate + clamp exam readiness score
    const score = Math.max(0, Math.min(100, Number(parsed.examReadinessScore) || 0));

    return {
      nextChapter: typeof parsed.nextChapter === 'string' ? parsed.nextChapter : null,
      revisionTopics: Array.isArray(parsed.revisionTopics) ? parsed.revisionTopics : [],
      practiceRecommendations: Array.isArray(parsed.practiceRecommendations)
        ? parsed.practiceRecommendations
        : [],
      dailyGoals: Array.isArray(parsed.dailyGoals) ? parsed.dailyGoals : [],
      studyPath: Array.isArray(parsed.studyPath) ? parsed.studyPath : [],
      examReadinessScore: score,
      examReadinessExplanation:
        typeof parsed.examReadinessExplanation === 'string'
          ? parsed.examReadinessExplanation
          : null,
      recommendedTeacherId:
        typeof parsed.recommendedTeacherId === 'string' && parsed.recommendedTeacherId !== 'null'
          ? parsed.recommendedTeacherId
          : null,
      recommendedTeacherReason:
        typeof parsed.recommendedTeacherReason === 'string'
          ? parsed.recommendedTeacherReason
          : null,
      motivationalInsight:
        typeof parsed.motivationalInsight === 'string' ? parsed.motivationalInsight : null,
    };
  } catch {
    // Fallback: return minimal recommendations if AI fails
    return {
      nextChapter: memory.weakTopics[0] ?? memory.subjects[0] ?? null,
      revisionTopics: memory.weakTopics.slice(0, 3),
      practiceRecommendations: [],
      dailyGoals: [`Review ${memory.weakTopics[0] ?? 'your notes'}`],
      studyPath: memory.subjects.slice(0, 4),
      examReadinessScore: 0,
      examReadinessExplanation: 'Unable to generate a detailed score at this time.',
      recommendedTeacherId: teachers[0]?.id ?? null,
      recommendedTeacherReason: teachers[0] ? `Your ${teachers[0].subject} teacher` : null,
      motivationalInsight: 'Every study session brings you closer to your goals. Keep going!',
    };
  }
}

// ---------------------------------------------------------------------------
// Generate study plan (Phase 4 — Smart Study Planner)
// ---------------------------------------------------------------------------

export interface GenerateStudyPlanParams {
  memory: StudentMemory;
  startDate: string;
  endDate: string;
  dailyAvailableMinutes: number;
  preferredStartTime: string;
  preferredEndTime: string;
  examDates?: { subject: string; date: string }[];
}

/**
 * Generate a personalized study plan with topics to study.
 * Returns a list of ScheduleTopic items that the schedule engine converts
 * into time-tabled sessions.
 *
 * SERVER-ONLY. Never call from client code.
 */
export async function generateStudyPlan({
  memory,
  startDate,
  endDate,
  dailyAvailableMinutes,
  preferredStartTime,
  preferredEndTime,
  examDates = [],
}: GenerateStudyPlanParams): Promise<{
  topics: ScheduleTopic[];
  goals: { title: string; type: 'daily' | 'weekly' | 'monthly'; target: string }[];
}> {
  const zai = await getZAI();

  const memorySummary = [
    `Subjects: ${memory.subjects.join(', ') || 'None'}`,
    `Weak topics: ${memory.weakTopics.join(', ') || 'None'}`,
    `Strong topics: ${memory.strongTopics.join(', ') || 'None'}`,
    `Exam goals: ${memory.examGoals.join(', ') || 'None'}`,
    `Learning style: ${memory.learningStyle ?? 'Not set'}`,
    `Recent topics: ${memory.recentTopics.join(', ') || 'None'}`,
  ].join('\n');

  const examInfo =
    examDates.length > 0
      ? examDates.map((e) => `${e.subject}: ${e.date}`).join(', ')
      : 'No specific exam dates provided';

  const prompt = `You are Junova, the AI core of StudentOS. Generate a personalized study plan as JSON.

STUDENT MEMORY:
${memorySummary}

PLAN PERIOD: ${startDate} to ${endDate}
DAILY AVAILABLE TIME: ${dailyAvailableMinutes} minutes
PREFERRED TIME: ${preferredStartTime} to ${preferredEndTime}
EXAM DATES: ${examInfo}

Generate a JSON object with this structure (raw JSON, no markdown, no code fences):
{
  "topics": [
    { "topic": "Topic name", "subject": "Subject", "estimatedMinutes": 60, "difficulty": "medium", "isRevision": false, "priority": 1 }
  ],
  "goals": [
    { "title": "Goal title", "type": "weekly", "target": "Complete 5 chapters" }
  ]
}

Rules:
- topics: 5-15 items covering the student's subjects
- Prioritize weak topics (priority 1-2)
- Include 2-4 revision sessions for recent topics
- Balance subjects (don't overload one subject)
- estimatedMinutes: 30-120 per topic
- difficulty: "easy", "medium", or "hard"
- priority: 1 (highest) to 5 (lowest)
- goals: 2-5 specific, measurable goals
- Consider exam dates — schedule exam subjects earlier
- Prevent study overload — respect dailyAvailableMinutes
- All text in preferredLanguage (${memory.preferredLanguage})`;

  try {
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content:
            'You are a JSON-only response generator. Return valid JSON with no markdown, no code fences, no extra text.',
        },
        { role: 'user', content: prompt },
      ],
      thinking: { type: 'disabled' },
    });

    const text = completion.choices[0]?.message?.content ?? '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');

    const parsed = JSON.parse(jsonMatch[0]);

    const topics: ScheduleTopic[] = Array.isArray(parsed.topics)
      ? parsed.topics.map((t: Record<string, unknown>) => ({
          topic: String(t.topic ?? ''),
          subject: String(t.subject ?? ''),
          estimatedMinutes: Math.max(15, Math.min(180, Number(t.estimatedMinutes) || 60)),
          difficulty: (['easy', 'medium', 'hard'].includes(String(t.difficulty))
            ? t.difficulty
            : 'medium') as ScheduleTopic['difficulty'],
          isRevision: Boolean(t.isRevision),
          priority: Math.max(1, Math.min(5, Number(t.priority) || 3)),
        }))
      : [];

    const goals = Array.isArray(parsed.goals)
      ? parsed.goals.map((g: Record<string, unknown>) => ({
          title: String(g.title ?? ''),
          type: (['daily', 'weekly', 'monthly'].includes(String(g.type)) ? g.type : 'weekly') as
            'daily' | 'weekly' | 'monthly',
          target: String(g.target ?? ''),
        }))
      : [];

    return { topics, goals };
  } catch {
    // Fallback: generate topics from memory
    const fallbackTopics: ScheduleTopic[] = [
      ...memory.weakTopics.slice(0, 3).map((topic, i) => ({
        topic,
        subject: memory.subjects[0] ?? 'General',
        estimatedMinutes: 60,
        difficulty: 'hard' as const,
        isRevision: false,
        priority: i + 1,
      })),
      ...memory.strongTopics.slice(0, 2).map((topic, i) => ({
        topic,
        subject: memory.subjects[0] ?? 'General',
        estimatedMinutes: 30,
        difficulty: 'easy' as const,
        isRevision: true,
        priority: i + 3,
      })),
    ];

    return {
      topics:
        fallbackTopics.length > 0
          ? fallbackTopics
          : [
              {
                topic: 'Review your notes',
                subject: memory.subjects[0] ?? 'General',
                estimatedMinutes: 45,
                difficulty: 'medium' as const,
                isRevision: false,
                priority: 1,
              },
            ],
      goals: [
        { title: 'Complete study plan', type: 'weekly' as const, target: 'Follow the schedule' },
      ],
    };
  }
}

// ---------------------------------------------------------------------------
// Generate Quiz (Phase 5 — Exam Center)
// ---------------------------------------------------------------------------

import type { QuestionType, Difficulty } from '../../exam/types';

export interface GenerateQuizParams {
  subject: string;
  chapter: string;
  difficulty: Difficulty;
  questionCount: number;
  questionTypes: QuestionType[];
  memory?: StudentMemory | null;
}

/**
 * Generate a quiz with AI. Returns structured questions as JSON.
 * SERVER-ONLY.
 */
export async function generateQuiz({
  subject,
  chapter,
  difficulty,
  questionCount,
  questionTypes,
  memory,
}: GenerateQuizParams) {
  const zai = await getZAI();

  const memoryContext = memory
    ? `\nStudent context: weak topics = [${memory.weakTopics.join(', ')}], strong topics = [${memory.strongTopics.join(', ')}], grade = ${memory.grade ?? 'unknown'}. Focus on weak topics where possible.`
    : '';

  const prompt = `You are Junova, the AI core of StudentOS. Generate a quiz as a JSON array of questions.

Subject: ${subject}
Chapter/Topic: ${chapter}
Difficulty: ${difficulty}
Number of questions: ${questionCount}
Question types: ${questionTypes.join(', ')}${memoryContext}

Generate EXACTLY ${questionCount} questions. Return a JSON array (no markdown, no code fences, just raw JSON array). Each question object must have:
{
  "id": "q1", "q2", etc. (unique string),
  "type": one of ${JSON.stringify(questionTypes)},
  "text": "the question text",
  "options": ["a","b","c","d"] (only for mcq, omit otherwise),
  "correctAnswer": "the correct answer (for mcq: the option text; for true-false: "true" or "false"; for others: the answer text)",
  "explanation": "detailed explanation of why the answer is correct",
  "subject": "${subject}",
  "topic": "${chapter}",
  "difficulty": "${difficulty}",
  "points": 1
}

Distribute question types evenly if multiple types are selected. Make questions challenging but fair for ${difficulty} difficulty. Ensure explanations are educational.`;

  try {
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content:
            'You are a JSON-only response generator. Return a valid JSON array with no markdown, no code fences, no extra text.',
        },
        { role: 'user', content: prompt },
      ],
      thinking: { type: 'disabled' },
    });

    const text = completion.choices[0]?.message?.content ?? '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array found in response');

    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) throw new Error('Response is not an array');

    return parsed.map((q: Record<string, unknown>, i: number) => ({
      id: q.id ?? `q${i + 1}`,
      type: q.type ?? 'mcq',
      text: String(q.text ?? ''),
      options: Array.isArray(q.options) ? q.options.map(String) : undefined,
      correctAnswer: String(q.correctAnswer ?? ''),
      explanation: String(q.explanation ?? ''),
      subject: String(q.subject ?? subject),
      topic: String(q.topic ?? chapter),
      difficulty: q.difficulty ?? difficulty,
      points: Number(q.points ?? 1),
    }));
  } catch {
    // Fallback: generate simple questions if AI fails
    return Array.from({ length: questionCount }, (_, i) => ({
      id: `q${i + 1}`,
      type: questionTypes[i % questionTypes.length],
      text: `Question ${i + 1}: Explain the concept of ${chapter} in ${subject}.`,
      options:
        questionTypes[i % questionTypes.length] === 'mcq'
          ? ['Option A', 'Option B', 'Option C', 'Option D']
          : undefined,
      correctAnswer: 'Option A',
      explanation: `This is a fallback question. The AI was unable to generate a detailed question. Please try regenerating.`,
      subject,
      topic: chapter,
      difficulty,
      points: 1,
    }));
  }
}

// ---------------------------------------------------------------------------
// AI Evaluation — detailed explanations for wrong answers (Phase 5)
// ---------------------------------------------------------------------------

export interface AIExplanationParams {
  questionText: string;
  studentAnswer: string;
  correctAnswer: string;
  subject: string;
  topic: string;
}

export async function generateAIExplanation({
  questionText,
  studentAnswer,
  correctAnswer,
  subject,
  topic,
}: AIExplanationParams) {
  const zai = await getZAI();
  try {
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content:
            "You are an expert tutor. Analyze the student's wrong answer and provide detailed feedback as JSON. Return ONLY raw JSON, no markdown.",
        },
        {
          role: 'user',
          content: `Question: ${questionText}\nStudent's answer: ${studentAnswer}\nCorrect answer: ${correctAnswer}\nSubject: ${subject}\nTopic: ${topic}\n\nReturn JSON: {"whyIncorrect": "why the student's answer is wrong", "betterMethod": "a better approach to solve this", "examTips": "tips for this question type in exams"}`,
        },
      ],
      thinking: { type: 'disabled' },
    });
    const text = completion.choices[0]?.message?.content ?? '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON');
    return JSON.parse(match[0]) as { whyIncorrect: string; betterMethod: string; examTips: string };
  } catch {
    return {
      whyIncorrect: 'Unable to generate detailed analysis at this time.',
      betterMethod: '',
      examTips: '',
    };
  }
}

// ---------------------------------------------------------------------------
// Generate Practice Quiz (Phase 5 — AI Practice)
// ---------------------------------------------------------------------------

export interface GeneratePracticeQuizParams {
  mode: string;
  subject: string;
  topic: string;
  difficulty: Difficulty;
  questionCount: number;
  memory?: StudentMemory | null;
}

export async function generatePracticeQuiz({
  mode,
  subject,
  topic,
  difficulty,
  questionCount,
  memory,
}: GeneratePracticeQuizParams) {
  // For practice, we reuse generateQuiz but customize the prompt based on mode
  let practiceTopic = topic;
  let practiceDifficulty = difficulty;

  if (memory) {
    if (mode === 'weak-topics' && memory.weakTopics.length > 0) {
      practiceTopic = memory.weakTopics[Math.floor(Math.random() * memory.weakTopics.length)];
    } else if (mode === 'strong-topics' && memory.strongTopics.length > 0) {
      practiceTopic = memory.strongTopics[Math.floor(Math.random() * memory.strongTopics.length)];
    } else if (mode === 'adaptive') {
      // Adaptive: increase difficulty if accuracy is high, decrease if low
      const accuracy =
        memory.revisionHistory.length > 0
          ? memory.revisionHistory.reduce((sum, r) => sum + r.confidence, 0) /
            memory.revisionHistory.length
          : 50;
      practiceDifficulty = accuracy > 75 ? 'hard' : accuracy > 50 ? 'medium' : 'easy';
    }
  }

  return generateQuiz({
    subject,
    chapter: practiceTopic || topic || subject,
    difficulty: practiceDifficulty,
    questionCount,
    questionTypes: ['mcq', 'true-false', 'fill-blank'],
    memory,
  });
}

// ---------------------------------------------------------------------------
// Generate Notes (Phase 6 — AI Notes)
// ---------------------------------------------------------------------------

import type { NoteType } from '../../notes/types';

export interface GenerateNotesParams {
  subject: string;
  chapter: string;
  topic: string;
  type: NoteType;
  memory?: StudentMemory | null;
}

export async function generateNotes({
  subject,
  chapter,
  topic,
  type,
  memory,
}: GenerateNotesParams) {
  const zai = await getZAI();

  const memoryContext = memory
    ? `\nStudent context: weak topics = [${memory.weakTopics.join(', ')}], learning style = ${memory.learningStyle ?? 'unknown'}, preferred language = ${memory.preferredLanguage}.`
    : '';

  const typeInstructions: Record<NoteType, string> = {
    chapter: 'Comprehensive notes covering the entire chapter with all sections.',
    topic: 'Focused notes on the specific topic with depth.',
    short: 'Quick reference notes — key points only, no lengthy explanations.',
    detailed: 'In-depth notes with examples, formulas, definitions, and step-by-step explanations.',
    revision: 'Condensed revision notes for last-minute review — bullet points and summaries.',
  };

  const prompt = `You are Junova, the AI core of StudentOS. Generate study notes as JSON.

Subject: ${subject}
Chapter: ${chapter}
Topic: ${topic}
Note type: ${type} — ${typeInstructions[type]}${memoryContext}

Return ONLY raw JSON (no markdown, no code fences):
{
  "title": "note title",
  "content": "full notes in markdown format",
  "summary": "2-3 sentence summary",
  "keyPoints": [{"text": "key point 1"}, {"text": "key point 2"}],
  "definitions": [{"term": "term", "definition": "definition"}],
  "formulas": [{"name": "formula name", "formula": "the formula", "description": "what it means"}],
  "examples": [{"title": "example title", "content": "example in markdown"}],
  "flashcards": [{"id": "fc1", "front": "question", "back": "answer"}],
  "tags": ["tag1", "tag2"]
}

Generate at least 5 key points, 3 definitions (if applicable), 2 formulas (if applicable), 2 examples, and 5 flashcards. Make content educational and well-structured with markdown headers.`;

  try {
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content:
            'You are a JSON-only response generator. Return valid JSON with no markdown, no code fences.',
        },
        { role: 'user', content: prompt },
      ],
      thinking: { type: 'disabled' },
    });

    const text = completion.choices[0]?.message?.content ?? '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON');
    return JSON.parse(match[0]);
  } catch {
    return {
      title: `${topic || chapter} — ${type} notes`,
      content: `# ${topic || chapter}\n\nUnable to generate AI notes at this time. Please try again.`,
      summary: 'AI generation failed. Please retry.',
      keyPoints: [],
      definitions: [],
      formulas: [],
      examples: [],
      flashcards: [],
      tags: [subject, chapter],
    };
  }
}

// ---------------------------------------------------------------------------
// Solve Doubt (Phase 6 — AI Doubt Solver)
// ---------------------------------------------------------------------------

export interface SolveDoubtParams {
  question: string;
  subject: string;
  topic: string;
  memory?: StudentMemory | null;
}

export async function solveDoubt({ question, subject, topic, memory }: SolveDoubtParams) {
  const zai = await getZAI();

  const memoryContext = memory
    ? `\nStudent context: weak topics = [${memory.weakTopics.join(', ')}], learning style = ${memory.learningStyle ?? 'unknown'}.`
    : '';

  const prompt = `You are Junova, an expert tutor on StudentOS. A student has a doubt. Solve it thoroughly.

Student's doubt: ${question}
Subject: ${subject}
Topic: ${topic}${memoryContext}

Return ONLY raw JSON (no markdown, no code fences):
{
  "solution": "detailed step-by-step solution in markdown format",
  "solutionMethods": ["alternative method 1", "alternative method 2"],
  "commonMistakes": ["common mistake 1", "common mistake 2"],
  "examTips": ["exam tip 1", "exam tip 2"],
  "relatedTopics": ["related topic 1", "related topic 2"],
  "followUpQuestions": ["follow-up question 1", "follow-up question 2"]
}

The solution must be thorough with clear steps. Include formula breakdowns where applicable. Mention common mistakes students make. Provide 2-3 follow-up questions.`;

  try {
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content:
            'You are a JSON-only response generator. Return valid JSON with no markdown, no code fences.',
        },
        { role: 'user', content: prompt },
      ],
      thinking: { type: 'disabled' },
    });

    const text = completion.choices[0]?.message?.content ?? '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON');
    const parsed = JSON.parse(match[0]);
    return {
      solution: String(parsed.solution ?? ''),
      solutionMethods: Array.isArray(parsed.solutionMethods)
        ? parsed.solutionMethods.map(String)
        : [],
      commonMistakes: Array.isArray(parsed.commonMistakes) ? parsed.commonMistakes.map(String) : [],
      examTips: Array.isArray(parsed.examTips) ? parsed.examTips.map(String) : [],
      relatedTopics: Array.isArray(parsed.relatedTopics) ? parsed.relatedTopics.map(String) : [],
      followUpQuestions: Array.isArray(parsed.followUpQuestions)
        ? parsed.followUpQuestions.map(String)
        : [],
    };
  } catch {
    return {
      solution: 'Unable to solve this doubt at this time. Please try rephrasing your question.',
      solutionMethods: [],
      commonMistakes: [],
      examTips: [],
      relatedTopics: [],
      followUpQuestions: [],
    };
  }
}

// ---------------------------------------------------------------------------
// Career Advisor (Sprint 8 — Career Planner)
// ---------------------------------------------------------------------------

export async function generateCareerRecommendations(
  memory: StudentMemory | null,
  skills: string[],
  goals: string[],
) {
  const zai = await getZAI();
  const memoryContext = memory
    ? `Student: grade=${memory.grade}, subjects=[${memory.subjects.join(',')}], weak=[${memory.weakTopics.join(',')}], strong=[${memory.strongTopics.join(',')}].`
    : 'No student data.';
  try {
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: 'Return ONLY valid JSON. No markdown.' },
        {
          role: 'user',
          content: `You are a career advisor. ${memoryContext} Current skills: [${skills.join(',')}]. Goals: [${goals.join(',')}]. Return JSON: {"bestNextStep":"action","recommendedCourses":["c1"],"recommendedBooks":["b1"],"recommendedCertifications":["cert1"],"practicePlans":["p1"],"skillImprovements":["s1"],"careerSuggestions":["career1"],"learningPath":["step1","step2"]}`,
        },
      ],
      thinking: { type: 'disabled' },
    });
    const text = completion.choices[0]?.message?.content ?? '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON');
    const parsed = JSON.parse(match[0]);
    return {
      bestNextStep: String(parsed.bestNextStep ?? ''),
      recommendedCourses: Array.isArray(parsed.recommendedCourses)
        ? parsed.recommendedCourses.map(String)
        : [],
      recommendedBooks: Array.isArray(parsed.recommendedBooks)
        ? parsed.recommendedBooks.map(String)
        : [],
      recommendedCertifications: Array.isArray(parsed.recommendedCertifications)
        ? parsed.recommendedCertifications.map(String)
        : [],
      practicePlans: Array.isArray(parsed.practicePlans) ? parsed.practicePlans.map(String) : [],
      skillImprovements: Array.isArray(parsed.skillImprovements)
        ? parsed.skillImprovements.map(String)
        : [],
      careerSuggestions: Array.isArray(parsed.careerSuggestions)
        ? parsed.careerSuggestions.map(String)
        : [],
      learningPath: Array.isArray(parsed.learningPath) ? parsed.learningPath.map(String) : [],
      generatedAt: Date.now(),
      updatedAt: Date.now(),
    };
  } catch {
    return {
      bestNextStep: 'Explore careers and set your first goal.',
      recommendedCourses: [],
      recommendedBooks: [],
      recommendedCertifications: [],
      practicePlans: [],
      skillImprovements: [],
      careerSuggestions: [],
      learningPath: [],
      generatedAt: Date.now(),
      updatedAt: Date.now(),
    };
  }
}

// ---------------------------------------------------------------------------
// Scholarship Advisor (Sprint 9 — Scholarship Finder)
// ---------------------------------------------------------------------------

export async function generateScholarshipRecommendations(
  memory: StudentMemory | null,
  profile: {
    preferredCountry: string;
    preferredCourse: string;
    gpa: string;
    incomeCategory: string;
    skills: string[];
    achievements: string[];
  } | null,
) {
  const zai = await getZAI();
  const context = [
    memory
      ? `Grade=${memory.grade}, Subjects=[${memory.subjects.join(',')}], Strong=[${memory.strongTopics.join(',')}], Weak=[${memory.weakTopics.join(',')}].`
      : '',
    profile
      ? `Preferred country=${profile.preferredCountry}, Course=${profile.preferredCourse}, GPA=${profile.gpa}, Income=${profile.incomeCategory}, Skills=[${profile.skills.join(',')}], Achievements=[${profile.achievements.join(',')}].`
      : '',
  ].join(' ');
  try {
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: 'Return ONLY valid JSON. No markdown.' },
        {
          role: 'user',
          content: `You are a scholarship advisor. Student context: ${context}. Return JSON: {"bestScholarships":[{"name":"scholarship name","matchScore":85,"reason":"why it matches"}],"successProbability":75,"missingEligibility":["req1"],"requiredImprovements":["imp1"],"suggestedDocuments":["doc1"],"applicationTips":["tip1","tip2"]}`,
        },
      ],
      thinking: { type: 'disabled' },
    });
    const text = completion.choices[0]?.message?.content ?? '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON');
    const parsed = JSON.parse(match[0]);
    return {
      bestScholarships: Array.isArray(parsed.bestScholarships)
        ? parsed.bestScholarships.map((s: Record<string, unknown>) => ({
            name: String(s.name ?? ''),
            matchScore: Number(s.matchScore ?? 0),
            reason: String(s.reason ?? ''),
          }))
        : [],
      successProbability: Math.max(0, Math.min(100, Number(parsed.successProbability ?? 0))),
      missingEligibility: Array.isArray(parsed.missingEligibility)
        ? parsed.missingEligibility.map(String)
        : [],
      requiredImprovements: Array.isArray(parsed.requiredImprovements)
        ? parsed.requiredImprovements.map(String)
        : [],
      suggestedDocuments: Array.isArray(parsed.suggestedDocuments)
        ? parsed.suggestedDocuments.map(String)
        : [],
      applicationTips: Array.isArray(parsed.applicationTips)
        ? parsed.applicationTips.map(String)
        : [],
      generatedAt: Date.now(),
      updatedAt: Date.now(),
    };
  } catch {
    return {
      bestScholarships: [],
      successProbability: 0,
      missingEligibility: [],
      requiredImprovements: [],
      suggestedDocuments: [],
      applicationTips: [],
      generatedAt: Date.now(),
      updatedAt: Date.now(),
    };
  }
}

// ---------------------------------------------------------------------------
// Freelance AI (Sprint 10 — Student Freelancing)
// ---------------------------------------------------------------------------

export async function generateProposal(
  jobTitle: string,
  jobDescription: string,
  studentSkills: string[],
  studentBio: string,
) {
  const zai = await getZAI();
  try {
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content:
            'You are a professional proposal writer. Return ONLY the proposal text, no JSON.',
        },
        {
          role: 'user',
          content: `Write a compelling freelance proposal for this job.\n\nJob: ${jobTitle}\nDescription: ${jobDescription}\n\nStudent skills: ${studentSkills.join(', ')}\nStudent bio: ${studentBio}\n\nWrite a 150-200 word proposal that highlights relevant skills and experience.`,
        },
      ],
      thinking: { type: 'disabled' },
    });
    return completion.choices[0]?.message?.content ?? '';
  } catch {
    return 'Unable to generate proposal at this time. Please write your own.';
  }
}

export async function generateCoverLetter(
  jobTitle: string,
  studentName: string,
  studentSkills: string[],
  studentBio: string,
) {
  const zai = await getZAI();
  try {
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: 'You are a professional cover letter writer. Return ONLY the cover letter text.',
        },
        {
          role: 'user',
          content: `Write a cover letter for a freelance job.\n\nJob: ${jobTitle}\nStudent: ${studentName}\nSkills: ${studentSkills.join(', ')}\nBio: ${studentBio}\n\nWrite a professional 200-word cover letter.`,
        },
      ],
      thinking: { type: 'disabled' },
    });
    return completion.choices[0]?.message?.content ?? '';
  } catch {
    return 'Unable to generate cover letter at this time.';
  }
}

// ---------------------------------------------------------------------------
// Community AI (Sprint 11 — Student Community)
// ---------------------------------------------------------------------------

export async function generateCommunityPost(topic: string, studentName: string) {
  const zai = await getZAI();
  try {
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: 'You are a student community post writer. Return ONLY the post text.',
        },
        {
          role: 'user',
          content: `Write an engaging community post for a student named ${studentName}. Topic: ${topic}. Keep it 100-150 words, friendly, and educational.`,
        },
      ],
      thinking: { type: 'disabled' },
    });
    return completion.choices[0]?.message?.content ?? '';
  } catch {
    return 'Unable to generate post at this time.';
  }
}
