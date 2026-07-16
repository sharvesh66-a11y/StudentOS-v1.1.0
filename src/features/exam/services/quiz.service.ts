/**
 * StudentOS Exam Center — Quiz Service
 *
 * CRUD for quizzes. Uses existing Firestore helpers.
 */

import { COLLECTIONS, firestoreHelpers, type StudentOSFirebaseError } from '@/firebase';
import { normalizeFirebaseError } from '@/firebase/error-handler';
import { where, orderBy, type Unsubscribe } from 'firebase/firestore';
import type { Quiz } from '../types';

export interface QuizServiceResult<T> {
  success: boolean;
  data?: T;
  error?: StudentOSFirebaseError;
}

export async function createQuiz(
  uid: string,
  data: Omit<Quiz, 'id' | 'uid' | 'createdAt' | 'updatedAt'>,
): Promise<QuizServiceResult<Quiz>> {
  try {
    const now = Date.now();
    const payload = { ...data, uid, createdAt: now, updatedAt: now };
    const result = await firestoreHelpers.createDocument(COLLECTIONS.EXAM_QUIZZES, payload);
    if (!result.success || !result.data) return { success: false, error: result.error };
    return { success: true, data: { id: result.data, ...payload } as Quiz };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export async function getQuiz(quizId: string): Promise<QuizServiceResult<Quiz | null>> {
  try {
    const result = await firestoreHelpers.getDocument<Quiz>(COLLECTIONS.EXAM_QUIZZES, quizId);
    if (!result.success) return { success: false, error: result.error };
    return { success: true, data: result.data };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export function subscribeToQuizzes(
  uid: string,
  onNext: (quizzes: Quiz[]) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<Quiz>(
    COLLECTIONS.EXAM_QUIZZES,
    onNext,
    onError,
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
  );
}

export async function updateQuiz(
  quizId: string,
  updates: Partial<Quiz>,
): Promise<QuizServiceResult<void>> {
  try {
    return firestoreHelpers.updateDocument(COLLECTIONS.EXAM_QUIZZES, quizId, {
      ...updates,
      updatedAt: Date.now(),
    });
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export async function deleteQuiz(quizId: string): Promise<QuizServiceResult<void>> {
  try {
    return firestoreHelpers.deleteDocument(COLLECTIONS.EXAM_QUIZZES, quizId);
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export const quizService = {
  createQuiz,
  getQuiz,
  subscribeToQuizzes,
  updateQuiz,
  deleteQuiz,
} as const;
