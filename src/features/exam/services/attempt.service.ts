/**
 * StudentOS Exam Center — Attempt Service
 *
 * CRUD for quiz attempts + auto-save + grading + memory integration.
 */

import { COLLECTIONS, firestoreHelpers, type StudentOSFirebaseError } from '@/firebase';
import { normalizeFirebaseError } from '@/firebase/error-handler';
import { where, orderBy, type Unsubscribe } from 'firebase/firestore';
import { memoryService } from '@/features/junova/services/memory.service';
import { mistakeAnalysisService } from './mistake-analysis.service';
import type { QuizAttempt, Quiz, QuizResult, QuestionResult } from '../types';

export interface AttemptServiceResult<T> {
  success: boolean;
  data?: T;
  error?: StudentOSFirebaseError;
}

export async function createAttempt(
  uid: string,
  quiz: Quiz,
): Promise<AttemptServiceResult<QuizAttempt>> {
  try {
    const now = Date.now();
    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const payload = {
      uid,
      quizId: quiz.id,
      status: 'in-progress' as const,
      answers: {},
      currentIndex: 0,
      score: null,
      correctCount: null,
      pointsEarned: null,
      totalPoints,
      startedAt: now,
      submittedAt: null,
      timeSpentSeconds: null,
      createdAt: now,
      updatedAt: now,
    };
    const result = await firestoreHelpers.createDocument(COLLECTIONS.QUIZ_ATTEMPTS, payload);
    if (!result.success || !result.data) return { success: false, error: result.error };
    return { success: true, data: { id: result.data, ...payload } as QuizAttempt };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export function subscribeToAttempts(
  uid: string,
  onNext: (attempts: QuizAttempt[]) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<QuizAttempt>(
    COLLECTIONS.QUIZ_ATTEMPTS,
    onNext,
    onError,
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
  );
}

export async function getAttempt(
  attemptId: string,
): Promise<AttemptServiceResult<QuizAttempt | null>> {
  try {
    const result = await firestoreHelpers.getDocument<QuizAttempt>(
      COLLECTIONS.QUIZ_ATTEMPTS,
      attemptId,
    );
    if (!result.success) return { success: false, error: result.error };
    return { success: true, data: result.data };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export async function saveAnswer(
  attemptId: string,
  questionId: string,
  answer: string,
  currentIndex: number,
): Promise<AttemptServiceResult<void>> {
  try {
    const attemptResult = await getAttempt(attemptId);
    if (!attemptResult.success || !attemptResult.data)
      return { success: false, error: attemptResult.error };
    const attempt = attemptResult.data;
    const updatedAnswers = { ...attempt.answers, [questionId]: answer };
    return firestoreHelpers.updateDocument(COLLECTIONS.QUIZ_ATTEMPTS, attemptId, {
      answers: updatedAnswers,
      currentIndex,
      updatedAt: Date.now(),
    });
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

/**
 * Grade a quiz attempt and return the full result.
 * Also updates Junova Memory with weak/strong topics.
 */
export async function submitAttempt(
  attemptId: string,
  quiz: Quiz,
  uid: string,
): Promise<AttemptServiceResult<QuizResult>> {
  try {
    const attemptResult = await getAttempt(attemptId);
    if (!attemptResult.success || !attemptResult.data)
      return { success: false, error: attemptResult.error };
    const attempt = attemptResult.data;

    const questionResults: QuestionResult[] = [];
    let correctCount = 0;
    let pointsEarned = 0;
    const weakTopics: string[] = [];
    const strongTopics: string[] = [];

    for (const q of quiz.questions) {
      const studentAnswer = attempt.answers[q.id] ?? '';
      const isCorrect = gradeAnswer(q.type, studentAnswer, q.correctAnswer);
      const points = isCorrect ? q.points : 0;
      if (isCorrect) {
        correctCount++;
        pointsEarned += points;
        strongTopics.push(q.topic);
      } else {
        weakTopics.push(q.topic);
      }
      questionResults.push({
        questionId: q.id,
        studentAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        isSkipped: !studentAnswer,
        pointsEarned: points,
        explanation: q.explanation,
      });
    }

    const totalQuestions = quiz.questions.length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const timeSpentSeconds = Math.round((Date.now() - attempt.startedAt) / 1000);

    // Update attempt in Firestore
    await firestoreHelpers.updateDocument(COLLECTIONS.QUIZ_ATTEMPTS, attemptId, {
      status: 'submitted',
      score,
      correctCount,
      pointsEarned,
      submittedAt: Date.now(),
      timeSpentSeconds,
      updatedAt: Date.now(),
    });

    // Update Junova Memory with weak/strong topics
    for (const topic of [...new Set(weakTopics)]) {
      await memoryService.addWeakTopic(uid, topic);
    }
    for (const topic of [...new Set(strongTopics)]) {
      await memoryService.addStrongTopic(uid, topic);
    }
    // Record revisions for all topics
    for (const q of quiz.questions) {
      await memoryService.recordRevision(uid, {
        topic: q.topic,
        subject: q.subject,
        confidence: attempt.answers[q.id]
          ? gradeAnswer(q.type, attempt.answers[q.id], q.correctAnswer)
            ? 80
            : 30
          : 0,
      });
    }

    const result: QuizResult = {
      attemptId,
      quizId: quiz.id,
      score,
      correctCount,
      totalQuestions,
      pointsEarned,
      totalPoints: attempt.totalPoints,
      timeSpentSeconds,
      questionResults,
      weakTopics: [...new Set(weakTopics)],
      strongTopics: [...new Set(strongTopics)],
    };

    // Run mistake analysis (non-blocking — don't fail the submission if analysis fails)
    void mistakeAnalysisService.analyzeQuizResult(uid, result, quiz.title).catch(() => {});

    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

/** Grade a single answer based on question type. */
function gradeAnswer(type: string, studentAnswer: string, correctAnswer: string): boolean {
  const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
  switch (type) {
    case 'mcq':
    case 'true-false':
      return normalize(studentAnswer) === normalize(correctAnswer);
    case 'fill-blank':
      return normalize(studentAnswer) === normalize(correctAnswer);
    case 'short-answer':
    case 'long-answer':
      // For text answers, check if key words match (simplified — real grading would use AI)
      const studentWords = new Set(normalize(studentAnswer).split(' '));
      const correctWords = normalize(correctAnswer).split(' ');
      const matchCount = correctWords.filter((w) => studentWords.has(w)).length;
      return matchCount / correctWords.length >= 0.5;
    default:
      return false;
  }
}

export const attemptService = {
  createAttempt,
  subscribeToAttempts,
  getAttempt,
  saveAnswer,
  submitAttempt,
} as const;
