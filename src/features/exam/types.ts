/**
 * StudentOS Exam Center — Domain Types
 *
 * Core types for the Quiz Generator: Quiz, Question, QuizAttempt, QuizResult.
 *
 * @see docs/DATABASE.md for the Firestore schema reference.
 */

// ---------------------------------------------------------------------------
// Question types
// ---------------------------------------------------------------------------

export type QuestionType = 'mcq' | 'true-false' | 'fill-blank' | 'short-answer' | 'long-answer';

export type Difficulty = 'easy' | 'medium' | 'hard';

/**
 * A single quiz question. Supports 5 types:
 * - MCQ: multiple choice with options[]
 * - True/False: binary choice
 * - Fill-in-blank: text input
 * - Short-answer: text input (1-2 sentences)
 * - Long-answer: textarea (paragraph)
 */
export interface Question {
  id: string;
  type: QuestionType;
  /** The question text (supports markdown). */
  text: string;
  /** For MCQ: the answer options. */
  options?: string[];
  /** The correct answer (for MCQ: option index as string; for T/F: "true"/"false"; for text: the answer). */
  correctAnswer: string;
  /** AI-generated explanation shown after answering. */
  explanation: string;
  /** Subject this question belongs to. */
  subject: string;
  /** Chapter or topic. */
  topic: string;
  difficulty: Difficulty;
  /** Points value (default 1). */
  points: number;
}

// ---------------------------------------------------------------------------
// Quiz
// ---------------------------------------------------------------------------

export type QuizStatus = 'generating' | 'ready' | 'in-progress' | 'completed' | 'archived';

/**
 * A quiz — a collection of questions with configuration.
 * Stored at `exam_quizzes/{quizId}`.
 */
export interface Quiz {
  id: string;
  uid: string;
  title: string;
  subject: string;
  chapter: string;
  difficulty: Difficulty;
  /** Number of questions. */
  questionCount: number;
  /** Question types included. */
  questionTypes: QuestionType[];
  /** Time limit in minutes (0 = no limit). */
  timeLimitMinutes: number;
  /** Whether this quiz was AI-generated. */
  aiGenerated: boolean;
  status: QuizStatus;
  /** The actual questions. */
  questions: Question[];
  createdAt: number;
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// Quiz Attempt
// ---------------------------------------------------------------------------

export type AttemptStatus = 'in-progress' | 'submitted' | 'abandoned';

/**
 * A quiz attempt — tracks a student's progress through a quiz.
 * Stored at `quiz_attempts/{attemptId}`.
 */
export interface QuizAttempt {
  id: string;
  uid: string;
  quizId: string;
  status: AttemptStatus;
  /** Student's answers keyed by question ID. */
  answers: Record<string, string>;
  /** Current question index (0-based). */
  currentIndex: number;
  /** Score (0-100, set on submit). */
  score: number | null;
  /** Number of correct answers (set on submit). */
  correctCount: number | null;
  /** Total points earned (set on submit). */
  pointsEarned: number | null;
  /** Total possible points. */
  totalPoints: number;
  /** Time started (millis). */
  startedAt: number;
  /** Time submitted (millis, null if not submitted). */
  submittedAt: number | null;
  /** Time spent in seconds (set on submit). */
  timeSpentSeconds: number | null;
  createdAt: number;
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// Quiz Result (computed on submit)
// ---------------------------------------------------------------------------

/** Full quiz result — computed when a student submits. */
export interface QuizResult {
  attemptId: string;
  quizId: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  pointsEarned: number;
  totalPoints: number;
  timeSpentSeconds: number;
  questionResults: QuestionResult[];
  /** Topics the student got wrong (for memory integration). */
  weakTopics: string[];
  /** Topics the student got right (for memory integration). */
  strongTopics: string[];
}

// ---------------------------------------------------------------------------
// Quiz configuration (for generation)
// ---------------------------------------------------------------------------

export interface QuizConfig {
  subject: string;
  chapter: string;
  topic: string;
  difficulty: Difficulty;
  questionCount: number;
  questionTypes: QuestionType[];
  timeLimitMinutes: number;
  language: string;
  teacherId: string | null;
}

export const DEFAULT_QUIZ_CONFIG: QuizConfig = {
  subject: 'Mathematics',
  chapter: '',
  topic: '',
  difficulty: 'medium',
  questionCount: 10,
  questionTypes: ['mcq'],
  timeLimitMinutes: 0,
  language: 'en',
  teacherId: null,
};

// ---------------------------------------------------------------------------
// Enhanced Question Result (Phase 5 — AI Evaluation)
// ---------------------------------------------------------------------------

export interface QuestionResult {
  questionId: string;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  isSkipped: boolean;
  pointsEarned: number;
  explanation: string;
  /** AI-generated: why the student's answer was incorrect. */
  whyIncorrect?: string;
  /** AI-generated: a better solving method. */
  betterMethod?: string;
  /** AI-generated: exam tips for this type of question. */
  examTips?: string;
}

// ---------------------------------------------------------------------------
// Practice Session (Phase 5 — AI Practice)
// ---------------------------------------------------------------------------

export type PracticeMode =
  | 'daily'
  | 'weak-topics'
  | 'strong-topics'
  | 'timed'
  | 'adaptive'
  | 'retry-incorrect'
  | 'ai-suggested';

export type PracticeStatus = 'in-progress' | 'completed' | 'abandoned';

export interface PracticeSession {
  id: string;
  uid: string;
  mode: PracticeMode;
  subject: string;
  topic: string;
  difficulty: Difficulty;
  questionCount: number;
  status: PracticeStatus;
  score: number | null;
  correctCount: number | null;
  timeSpentSeconds: number | null;
  startedAt: number;
  completedAt: number | null;
  createdAt: number;
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// Mistake Analysis (Phase 5)
// ---------------------------------------------------------------------------

export interface MistakeAnalysis {
  uid: string;
  weakChapters: string[];
  weakConcepts: string[];
  frequentlyIncorrectTopics: string[];
  timeManagementIssues: boolean;
  averageTimePerQuestion: number;
  accuracyRate: number;
  totalQuizzes: number;
  totalQuestions: number;
  totalCorrect: number;
  totalWrong: number;
  totalSkipped: number;
  lastAnalyzedAt: number;
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// Daily Practice (Phase 5)
// ---------------------------------------------------------------------------

export interface DailyPractice {
  uid: string;
  date: string;
  sessionsCompleted: number;
  questionsAnswered: number;
  correctAnswers: number;
  timeSpentSeconds: number;
  streak: number;
  updatedAt: number;
}
