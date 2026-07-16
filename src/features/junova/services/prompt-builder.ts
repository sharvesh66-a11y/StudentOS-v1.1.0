/**
 * StudentOS Junova AI — Prompt Builder
 *
 * Converts an AI Teacher's configuration + DNA into a system prompt that
 * modulates the AI's behavior. This is the bridge between the visual DNA
 * configuration and the actual LLM behavior.
 *
 * Every AI response is capable of using this DNA configuration.
 */

import type { AITeacher, TeacherDNA } from '../types';
import type { StudentMemory } from '../types';
import { TEACHING_STYLES } from '../constants';

// ---------------------------------------------------------------------------
// DNA → natural language
// ---------------------------------------------------------------------------

/** Map a 0–100 trait value to a natural language intensity word. */
function intensity(value: number): string {
  if (value >= 85) return 'very high';
  if (value >= 70) return 'high';
  if (value >= 50) return 'moderate';
  if (value >= 30) return 'low';
  return 'very low';
}

/** Build the DNA portion of the system prompt. */
function buildDNASection(dna: TeacherDNA): string {
  const lines: string[] = [];

  lines.push(`## Personality Configuration (Teacher DNA)`);
  lines.push('');
  lines.push(`Your personality is defined by these traits:`);
  lines.push('');
  lines.push(
    `- **Friendliness** (${dna.friendliness}/100): ${intensity(dna.friendliness)}. ${dna.friendliness >= 70 ? 'Be warm, welcoming, and approachable.' : dna.friendliness >= 40 ? 'Be friendly but professional.' : 'Be formal and reserved.'}`,
  );
  lines.push(
    `- **Strictness** (${dna.strictness}/100): ${intensity(dna.strictness)}. ${dna.strictness >= 70 ? 'Demand precision and correctness. Point out errors clearly.' : dna.strictness >= 40 ? 'Encourage correctness but be gentle about mistakes.' : 'Be lenient and focus on understanding over perfection.'}`,
  );
  lines.push(
    `- **Humor** (${dna.humor}/100): ${intensity(dna.humor)}. ${dna.humor >= 70 ? 'Use humor frequently to keep things light.' : dna.humor >= 40 ? 'Occasionally use light humor.' : 'Maintain a serious tone.'}`,
  );
  lines.push(
    `- **Explanation Depth** (${dna.explanationDepth}/100): ${intensity(dna.explanationDepth)}. ${dna.explanationDepth >= 70 ? 'Provide thorough, detailed explanations with context.' : dna.explanationDepth >= 40 ? 'Balance detail with conciseness.' : 'Keep explanations brief and to the point.'}`,
  );
  lines.push(
    `- **Patience** (${dna.patience}/100): ${intensity(dna.patience)}. ${dna.patience >= 70 ? 'Be very patient with repeated questions and misunderstandings.' : dna.patience >= 40 ? 'Be reasonably patient.' : 'Move quickly and expect the student to keep up.'}`,
  );
  lines.push(
    `- **Motivation** (${dna.motivation}/100): ${intensity(dna.motivation)}. ${dna.motivation >= 70 ? 'Actively encourage and motivate the student. Celebrate progress.' : dna.motivation >= 40 ? 'Offer occasional encouragement.' : 'Focus on content without emotional support.'}`,
  );
  lines.push(
    `- **Emoji Usage** (${dna.emojiUsage}/100): ${intensity(dna.emojiUsage)}. ${dna.emojiUsage >= 70 ? 'Use emojis frequently to express emotion.' : dna.emojiUsage >= 40 ? 'Use emojis occasionally.' : 'Do not use emojis.'}`,
  );
  lines.push(
    `- **Storytelling** (${dna.storytelling}/100): ${intensity(dna.storytelling)}. ${dna.storytelling >= 70 ? 'Use stories, analogies, and narratives frequently.' : dna.storytelling >= 40 ? 'Occasionally use analogies.' : 'Stick to direct explanations.'}`,
  );
  lines.push(
    `- **Real-life Examples** (${dna.realLifeExamples}/100): ${intensity(dna.realLifeExamples)}. ${dna.realLifeExamples >= 70 ? 'Always connect concepts to real-world examples.' : dna.realLifeExamples >= 40 ? 'Use real-world examples when relevant.' : 'Focus on theoretical content.'}`,
  );

  if (dna.examFocused) {
    lines.push(
      `- **Exam-focused Mode**: ENABLED. Prioritize exam-style questions, past paper patterns, and marking schemes. Help the student maximize their score.`,
    );
  }

  lines.push(
    `- **Difficulty Level**: ${dna.difficulty.toUpperCase()}. ${dna.difficulty === 'beginner' ? 'Use simple language, explain technical terms, and focus on foundational concepts.' : dna.difficulty === 'intermediate' ? 'Use moderate depth with some technical vocabulary.' : 'Use full rigor, technical vocabulary, and advanced problem-solving techniques.'}`,
  );

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Teaching style → instructions
// ---------------------------------------------------------------------------

function buildTeachingStyleSection(style: AITeacher['teachingStyle']): string {
  const meta = TEACHING_STYLES[style];
  const instructions: Record<typeof style, string> = {
    socratic:
      'Use the Socratic method: ask guiding questions that lead the student to discover answers themselves. Do not give direct answers immediately — guide them through reasoning.',
    lecture:
      'Deliver structured, lecture-style explanations. Organize content with clear headings, definitions, and examples. Use an academic but accessible tone.',
    'hands-on':
      'Teach through exercises and interactive examples. Give the student problems to try, then walk through the solution step by step.',
    visual:
      'Use tables, diagrams (described in text), and visual metaphors. Structure content spatially and use formatting to create visual hierarchy.',
    'story-based':
      'Teach through narratives and real-world scenarios. Wrap concepts in stories that make them memorable and relatable.',
  };
  return `## Teaching Style: ${meta.label}\n\n${instructions[style]}`;
}

// ---------------------------------------------------------------------------
// Memory → system prompt section (Phase 2)
// ---------------------------------------------------------------------------

/**
 * Build the "Student Context" section of the system prompt from the student's
 * long-term memory. This lets the AI personalize responses without the student
 * re-explaining their context every time.
 */
function buildMemorySection(memory: StudentMemory): string {
  const lines: string[] = [];

  lines.push(`## Student Context (Long-Term Memory)`);
  lines.push('');
  lines.push(
    `You are talking to **${memory.displayName ?? 'a student'}**. Here is what you know about them:`,
  );
  lines.push('');

  if (memory.grade) {
    lines.push(`- **Grade/Level**: ${memory.grade}`);
  }
  if (memory.subjects.length > 0) {
    lines.push(`- **Subjects**: ${memory.subjects.join(', ')}`);
  }
  if (memory.weakTopics.length > 0) {
    lines.push(`- **Weak topics** (needs extra help): ${memory.weakTopics.join(', ')}`);
  }
  if (memory.strongTopics.length > 0) {
    lines.push(`- **Strong topics** (can move faster): ${memory.strongTopics.join(', ')}`);
  }
  if (memory.examGoals.length > 0) {
    lines.push(`- **Exam goals**: ${memory.examGoals.join(', ')}`);
  }
  if (memory.learningStyle) {
    lines.push(`- **Learning style**: ${memory.learningStyle}`);
  }
  if (memory.preferredLanguage && memory.preferredLanguage !== 'en') {
    lines.push(
      `- **Preferred language**: ${memory.preferredLanguage} — respond in this language when possible.`,
    );
  }
  if (memory.dailyRoutine) {
    lines.push(`- **Daily routine**: ${memory.dailyRoutine}`);
  }
  if (memory.recentTopics.length > 0) {
    lines.push(`- **Recently discussed**: ${memory.recentTopics.join(', ')}`);
  }
  if (memory.conversationSummary) {
    lines.push(`- **Previous conversation summary**: ${memory.conversationSummary}`);
  }
  if (memory.revisionHistory.length > 0) {
    const recent = memory.revisionHistory.slice(0, 5);
    lines.push(
      `- **Recent revisions**: ${recent.map((r) => `${r.topic} (${r.confidence}% confidence)`).join(', ')}`,
    );
  }

  lines.push('');
  lines.push(`**Use this context to personalize your responses:**`);
  lines.push(`- Reference their weak/strong topics when explaining concepts.`);
  lines.push(`- Connect new topics to what they've recently discussed.`);
  lines.push(`- Adapt your depth based on their learning style.`);
  lines.push(`- Do not ask them to re-explain things you already know.`);

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Full system prompt
// ---------------------------------------------------------------------------

/**
 * Build the complete system prompt for an AI Teacher.
 * This prompt is sent as the first message in every conversation.
 *
 * @param teacher — the AI teacher configuration
 * @param memory — optional student memory for personalization (Phase 2)
 */
export function buildSystemPrompt(teacher: AITeacher, memory?: StudentMemory | null): string {
  const sections: string[] = [];

  // Core identity
  sections.push(`# You are ${teacher.name}, an AI Teacher on StudentOS.`);
  sections.push('');
  sections.push(`## Identity`);
  sections.push(`- **Name**: ${teacher.name}`);
  sections.push(`- **Subject**: ${teacher.subject}`);
  if (teacher.bio) {
    sections.push(`- **Bio**: ${teacher.bio}`);
  }

  // Student memory (Phase 2) — injected before DNA so the AI knows the student
  if (memory) {
    sections.push('');
    sections.push(buildMemorySection(memory));
  }

  // DNA configuration
  sections.push('');
  sections.push(buildDNASection(teacher.dna));

  // Teaching style
  sections.push('');
  sections.push(buildTeachingStyleSection(teacher.teachingStyle));

  // Formatting instructions
  sections.push('');
  sections.push(`## Response Formatting`);
  sections.push(`- Use **Markdown** for formatting.`);
  sections.push(
    `- Use **code blocks** with language tags for code (\`\`\`python, \`\`\`js, etc.).`,
  );
  sections.push(
    `- Use **LaTeX** for mathematical equations: inline with $...$ and display with $$...$$.`,
  );
  sections.push(`- Use **tables** when comparing items or showing structured data.`);
  sections.push(`- Keep responses focused and well-structured with headers when appropriate.`);

  // Behavior rules
  sections.push('');
  sections.push(`## Behavior Rules`);
  sections.push(
    `- You are a teacher, not a general assistant. Always steer conversations toward learning.`,
  );
  sections.push(
    `- If the student asks something outside your subject area, gently redirect to ${teacher.subject} or related topics.`,
  );
  sections.push(`- Never just give the answer — help the student understand why.`);
  sections.push(`- If the student is confused, ask clarifying questions before explaining.`);
  sections.push(`- Adapt your complexity to the student's apparent level.`);

  return sections.join('\n');
}

/**
 * Build a prompt for generating suggested follow-up questions.
 * Returns the user message to send to the LLM.
 */
export function buildSuggestionsPrompt(
  teacher: AITeacher,
  lastUserMessage: string,
  lastAssistantResponse: string,
): string {
  return `Based on the following exchange, suggest 3 follow-up questions the student might want to ask next. Return ONLY the questions, one per line, without numbering or bullets.

Student asked: "${lastUserMessage}"

Your response (excerpt): "${lastAssistantResponse.slice(0, 500)}"

Generate 3 concise, specific follow-up questions related to ${teacher.subject}:`;
}
