/**
 * StudentOS Junova AI — Recommendation Service
 *
 * CRUD operations for AI-generated recommendations. Uses a single document
 * per user at `junova_recommendations/{uid}`.
 *
 * @see src/firebase/firestore-helpers.ts
 * @see src/firebase/constants.ts — COLLECTIONS.JUNOVA_RECOMMENDATIONS
 */

import { db, COLLECTIONS, type StudentOSFirebaseError } from '@/firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { normalizeFirebaseError } from '@/firebase/error-handler';
import type { AIRecommendations } from '../types';
import { DEFAULT_RECOMMENDATIONS } from '../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RecommendationServiceResult<T> {
  success: boolean;
  data?: T;
  error?: StudentOSFirebaseError;
}

export type RecommendationUpdate = Partial<Omit<AIRecommendations, 'uid' | 'createdAt'>>;

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

/**
 * Get a user's recommendations document. Returns null if it doesn't exist yet.
 */
export async function getRecommendations(
  uid: string,
): Promise<RecommendationServiceResult<AIRecommendations | null>> {
  try {
    const ref = doc(db, COLLECTIONS.JUNOVA_RECOMMENDATIONS, uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: true, data: null };
    return { success: true, data: snap.data() as AIRecommendations };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

/**
 * Subscribe to a user's recommendations in real-time.
 */
export function subscribeToRecommendations(
  uid: string,
  onNext: (recs: AIRecommendations | null) => void,
  onError?: (error: StudentOSFirebaseError) => void,
): Unsubscribe {
  const ref = doc(db, COLLECTIONS.JUNOVA_RECOMMENDATIONS, uid);
  return onSnapshot(
    ref,
    (snap) => {
      onNext(snap.exists() ? (snap.data() as AIRecommendations) : null);
    },
    (err) => onError?.(normalizeFirebaseError(err)),
  );
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

/**
 * Save recommendations for a user. Creates or overwrites the document.
 */
export async function saveRecommendations(
  uid: string,
  recommendations: Omit<AIRecommendations, 'uid' | 'createdAt' | 'updatedAt' | 'generatedAt'>,
): Promise<RecommendationServiceResult<AIRecommendations>> {
  try {
    const ref = doc(db, COLLECTIONS.JUNOVA_RECOMMENDATIONS, uid);
    const snap = await getDoc(ref);
    const now = Date.now();

    const data: AIRecommendations = {
      ...DEFAULT_RECOMMENDATIONS,
      ...recommendations,
      uid,
      createdAt: snap.exists() ? (snap.data() as AIRecommendations).createdAt : now,
      updatedAt: now,
      generatedAt: now,
    } as AIRecommendations;

    await setDoc(
      ref,
      {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        generatedAt: serverTimestamp(),
      },
      { merge: true },
    );
    return { success: true, data };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

/**
 * Update specific fields of the recommendations document.
 */
export async function updateRecommendations(
  uid: string,
  updates: RecommendationUpdate,
): Promise<RecommendationServiceResult<void>> {
  try {
    const ref = doc(db, COLLECTIONS.JUNOVA_RECOMMENDATIONS, uid);
    await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

// ---------------------------------------------------------------------------
// Barrel
// ---------------------------------------------------------------------------

export const recommendationService = {
  getRecommendations,
  subscribeToRecommendations,
  saveRecommendations,
  updateRecommendations,
} as const;
