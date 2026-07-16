/**
 * StudentOS Planner — Planner Service
 *
 * CRUD operations for study plans. Collection: `study_plans/{planId}`.
 */

import { db, COLLECTIONS, type StudentOSFirebaseError } from '@/firebase';
import {
  doc,
  getDoc,
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
import type { StudyPlan, PlanType, ScheduleDifficulty } from '../types';

export interface PlannerServiceResult<T> {
  success: boolean;
  data?: T;
  error?: StudentOSFirebaseError;
}

export interface CreatePlanInput {
  title: string;
  type: PlanType;
  startDate: string;
  endDate: string;
  subjects: string[];
  difficulty: ScheduleDifficulty;
  aiGenerated?: boolean;
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export async function createPlan(
  uid: string,
  input: CreatePlanInput,
): Promise<PlannerServiceResult<StudyPlan>> {
  try {
    const now = Date.now();
    const data = {
      uid,
      title: input.title,
      type: input.type,
      startDate: input.startDate,
      endDate: input.endDate,
      subjects: input.subjects,
      difficulty: input.difficulty,
      aiGenerated: input.aiGenerated ?? false,
      isActive: true,
      totalMinutes: 0,
      completedMinutes: 0,
      createdAt: now,
      updatedAt: now,
    };
    const ref = doc(collection(db, COLLECTIONS.STUDY_PLANS));
    await setDoc(ref, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    return { success: true, data: { id: ref.id, ...data } as StudyPlan };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function getPlan(planId: string): Promise<PlannerServiceResult<StudyPlan | null>> {
  try {
    const ref = doc(db, COLLECTIONS.STUDY_PLANS, planId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: true, data: null };
    return { success: true, data: { id: snap.id, ...snap.data() } as StudyPlan };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export async function getPlans(uid: string): Promise<PlannerServiceResult<StudyPlan[]>> {
  try {
    const q = query(
      collection(db, COLLECTIONS.STUDY_PLANS),
      where('uid', '==', uid),
      orderBy('createdAt', 'desc'),
    );
    const snap = await getDocs(q);
    return { success: true, data: snap.docs.map((d) => ({ id: d.id, ...d.data() }) as StudyPlan) };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export function subscribeToPlans(
  uid: string,
  onNext: (plans: StudyPlan[]) => void,
  onError?: (error: StudentOSFirebaseError) => void,
): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.STUDY_PLANS),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(
    q,
    (snap) => onNext(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as StudyPlan)),
    (err) => onError?.(normalizeFirebaseError(err)),
  );
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export async function updatePlan(
  planId: string,
  updates: Partial<Omit<StudyPlan, 'id' | 'uid' | 'createdAt'>>,
): Promise<PlannerServiceResult<void>> {
  try {
    const ref = doc(db, COLLECTIONS.STUDY_PLANS, planId);
    await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export async function deletePlan(planId: string): Promise<PlannerServiceResult<void>> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.STUDY_PLANS, planId));
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export const plannerService = {
  createPlan,
  getPlan,
  getPlans,
  subscribeToPlans,
  updatePlan,
  deletePlan,
} as const;
