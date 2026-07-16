/**
 * StudentOS Exam Center — Practice Service
 * CRUD for practice sessions at `practice_sessions/{sessionId}`.
 */
import { COLLECTIONS, firestoreHelpers, type StudentOSFirebaseError } from '@/firebase';
import { normalizeFirebaseError } from '@/firebase/error-handler';
import { where, orderBy, type Unsubscribe } from 'firebase/firestore';
import type { PracticeSession, PracticeMode } from '../types';

export interface PracticeServiceResult<T> {
  success: boolean;
  data?: T;
  error?: StudentOSFirebaseError;
}

export async function createPracticeSession(
  uid: string,
  data: {
    mode: PracticeMode;
    subject: string;
    topic: string;
    difficulty: string;
    questionCount: number;
  },
): Promise<PracticeServiceResult<PracticeSession>> {
  try {
    const now = Date.now();
    const payload = {
      uid,
      ...data,
      status: 'in-progress' as const,
      score: null,
      correctCount: null,
      timeSpentSeconds: null,
      startedAt: now,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    const result = await firestoreHelpers.createDocument(COLLECTIONS.PRACTICE_SESSIONS, payload);
    if (!result.success || !result.data) return { success: false, error: result.error };
    return { success: true, data: { id: result.data, ...payload } as PracticeSession };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export function subscribeToPracticeSessions(
  uid: string,
  onNext: (s: PracticeSession[]) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<PracticeSession>(
    COLLECTIONS.PRACTICE_SESSIONS,
    onNext,
    onError,
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
  );
}

export async function completePracticeSession(
  sessionId: string,
  score: number,
  correctCount: number,
  timeSpentSeconds: number,
): Promise<PracticeServiceResult<void>> {
  try {
    return firestoreHelpers.updateDocument(COLLECTIONS.PRACTICE_SESSIONS, sessionId, {
      status: 'completed',
      score,
      correctCount,
      timeSpentSeconds,
      completedAt: Date.now(),
      updatedAt: Date.now(),
    });
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export const practiceService = {
  createPracticeSession,
  subscribeToPracticeSessions,
  completePracticeSession,
} as const;
