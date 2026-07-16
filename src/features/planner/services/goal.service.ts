/**
 * StudentOS Planner — Goal + Revision Service
 *
 * CRUD operations for goals (`goals/{goalId}`) and revisions
 * (`revisions/{revisionId}`).
 */

import { db, COLLECTIONS, type StudentOSFirebaseError } from '@/firebase';
import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  type Unsubscribe,
} from 'firebase/firestore';
import { normalizeFirebaseError } from '@/firebase/error-handler';
import type { Goal, Revision, GoalType, GoalStatus } from '../types';

export interface GoalServiceResult<T> {
  success: boolean;
  data?: T;
  error?: StudentOSFirebaseError;
}

export interface CreateGoalInput {
  title: string;
  description: string;
  type: GoalType;
  target: string;
  subject?: string | null;
  targetDate?: string | null;
  aiSuggested?: boolean;
}

// ---------------------------------------------------------------------------
// Goals — Create
// ---------------------------------------------------------------------------

export async function createGoal(
  uid: string,
  input: CreateGoalInput,
): Promise<GoalServiceResult<Goal>> {
  try {
    const now = Date.now();
    const data = {
      uid,
      title: input.title,
      description: input.description,
      type: input.type,
      status: 'active' as GoalStatus,
      progress: 0,
      target: input.target,
      subject: input.subject ?? null,
      targetDate: input.targetDate ?? null,
      aiSuggested: input.aiSuggested ?? false,
      createdAt: now,
      updatedAt: now,
    };
    const ref = doc(collection(db, COLLECTIONS.GOALS));
    await setDoc(ref, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    return { success: true, data: { id: ref.id, ...data } as Goal };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

// ---------------------------------------------------------------------------
// Goals — Read
// ---------------------------------------------------------------------------

export function subscribeToGoals(
  uid: string,
  onNext: (goals: Goal[]) => void,
  onError?: (error: StudentOSFirebaseError) => void,
): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.GOALS),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(
    q,
    (snap) => onNext(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Goal)),
    (err) => onError?.(normalizeFirebaseError(err)),
  );
}

// ---------------------------------------------------------------------------
// Goals — Update
// ---------------------------------------------------------------------------

export async function updateGoal(
  goalId: string,
  updates: Partial<Omit<Goal, 'id' | 'uid' | 'createdAt'>>,
): Promise<GoalServiceResult<void>> {
  try {
    const ref = doc(db, COLLECTIONS.GOALS, goalId);
    await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export async function updateGoalProgress(
  goalId: string,
  progress: number,
): Promise<GoalServiceResult<void>> {
  const clamped = Math.max(0, Math.min(100, progress));
  const status: GoalStatus = clamped >= 100 ? 'achieved' : 'active';
  return updateGoal(goalId, { progress: clamped, status });
}

// ---------------------------------------------------------------------------
// Goals — Delete
// ---------------------------------------------------------------------------

export async function deleteGoal(goalId: string): Promise<GoalServiceResult<void>> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.GOALS, goalId));
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

// ---------------------------------------------------------------------------
// Revisions — Read
// ---------------------------------------------------------------------------

export function subscribeToRevisions(
  uid: string,
  onNext: (revisions: Revision[]) => void,
  onError?: (error: StudentOSFirebaseError) => void,
): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.REVISIONS),
    where('uid', '==', uid),
    orderBy('nextReviewDate', 'asc'),
  );
  return onSnapshot(
    q,
    (snap) => onNext(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Revision)),
    (err) => onError?.(normalizeFirebaseError(err)),
  );
}

// ---------------------------------------------------------------------------
// Revisions — Create / Update
// ---------------------------------------------------------------------------

export async function createRevision(
  uid: string,
  input: { topic: string; subject: string; intervalDays?: number; confidence?: number },
): Promise<GoalServiceResult<Revision>> {
  try {
    const now = Date.now();
    const interval = input.intervalDays ?? 1;
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);
    const data = {
      uid,
      topic: input.topic,
      subject: input.subject,
      lastReviewed: null,
      nextReviewDate: nextDate.toISOString().split('T')[0],
      intervalDays: interval,
      reviewCount: 0,
      confidence: input.confidence ?? 50,
      createdAt: now,
      updatedAt: now,
    };
    const ref = doc(collection(db, COLLECTIONS.REVISIONS));
    await setDoc(ref, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    return { success: true, data: { id: ref.id, ...data } as Revision };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export async function completeRevision(
  revisionId: string,
  confidence: number,
): Promise<GoalServiceResult<void>> {
  try {
    const ref = doc(db, COLLECTIONS.REVISIONS, revisionId);
    const snap = await getDocs(
      query(collection(db, COLLECTIONS.REVISIONS), where('__name__', '==', revisionId)),
    );
    if (snap.empty)
      return { success: false, error: normalizeFirebaseError(new Error('Revision not found')) };
    const existing = snap.docs[0].data() as Revision;
    const today = new Date().toISOString().split('T')[0];
    // Spaced repetition: increase interval if confidence is high
    const newInterval = confidence >= 80 ? existing.intervalDays * 2 : existing.intervalDays;
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + newInterval);
    await updateDoc(ref, {
      lastReviewed: today,
      nextReviewDate: nextDate.toISOString().split('T')[0],
      intervalDays: newInterval,
      reviewCount: existing.reviewCount + 1,
      confidence,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export async function deleteRevision(revisionId: string): Promise<GoalServiceResult<void>> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.REVISIONS, revisionId));
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export const goalService = {
  createGoal,
  subscribeToGoals,
  updateGoal,
  updateGoalProgress,
  deleteGoal,
  subscribeToRevisions,
  createRevision,
  completeRevision,
  deleteRevision,
} as const;
