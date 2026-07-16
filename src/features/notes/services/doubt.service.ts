/**
 * StudentOS Notes Hub — Doubt Service
 * CRUD for doubt history at `doubt_history/{doubtId}`.
 */
import { COLLECTIONS, firestoreHelpers, type StudentOSFirebaseError } from '@/firebase';
import { normalizeFirebaseError } from '@/firebase/error-handler';
import { where, orderBy, type Unsubscribe } from 'firebase/firestore';
import { memoryService } from '@/features/junova/services/memory.service';
import type { Doubt } from '../types';

export interface DoubtServiceResult<T> {
  success: boolean;
  data?: T;
  error?: StudentOSFirebaseError;
}

export async function createDoubt(
  uid: string,
  data: Omit<Doubt, 'id' | 'uid' | 'createdAt' | 'updatedAt'>,
): Promise<DoubtServiceResult<Doubt>> {
  try {
    const now = Date.now();
    const payload = { ...data, uid, createdAt: now, updatedAt: now };
    const result = await firestoreHelpers.createDocument(COLLECTIONS.DOUBT_HISTORY, payload);
    if (!result.success || !result.data) return { success: false, error: result.error };

    // Update memory with the doubt topic as a recent topic + weak topic
    if (data.topic) {
      void memoryService.addRecentTopic(uid, data.topic);
      void memoryService.addWeakTopic(uid, data.topic);
    }

    return { success: true, data: { id: result.data, ...payload } as Doubt };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export function subscribeToDoubts(
  uid: string,
  onNext: (doubts: Doubt[]) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<Doubt>(
    COLLECTIONS.DOUBT_HISTORY,
    onNext,
    onError,
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
  );
}

export async function deleteDoubt(doubtId: string): Promise<DoubtServiceResult<void>> {
  try {
    return firestoreHelpers.deleteDocument(COLLECTIONS.DOUBT_HISTORY, doubtId);
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export const doubtService = { createDoubt, subscribeToDoubts, deleteDoubt } as const;
