/**
 * StudentOS Career Planner — Career Service
 * CRUD for goals, skills, colleges, timeline, recommendations.
 */
import { COLLECTIONS, firestoreHelpers, type StudentOSFirebaseError } from '@/firebase';
import { normalizeFirebaseError } from '@/firebase/error-handler';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  where,
  orderBy,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/firebase';
import type {
  CareerGoal,
  CareerSkill,
  CareerCollege,
  CareerRecommendation,
  CareerTimelineEntry,
} from '../types';

export interface CareerResult<T> {
  success: boolean;
  data?: T;
  error?: StudentOSFirebaseError;
}

// --- Goals ---
export async function createGoal(
  uid: string,
  data: Partial<CareerGoal>,
): Promise<CareerResult<CareerGoal>> {
  try {
    const now = Date.now();
    const payload = {
      uid,
      title: data.title ?? 'Untitled Goal',
      description: data.description ?? '',
      careerId: data.careerId ?? null,
      status: 'active' as const,
      progress: 0,
      milestones: data.milestones ?? [],
      targetDate: data.targetDate ?? null,
      createdAt: now,
      updatedAt: now,
    };
    const result = await firestoreHelpers.createDocument(COLLECTIONS.CAREER_GOALS, payload);
    if (!result.success || !result.data) return { success: false, error: result.error };
    return { success: true, data: { id: result.data, ...payload } as CareerGoal };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}
export function subscribeToGoals(
  uid: string,
  onNext: (g: CareerGoal[]) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<CareerGoal>(
    COLLECTIONS.CAREER_GOALS,
    onNext,
    onError,
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
  );
}
export async function updateGoal(
  goalId: string,
  updates: Partial<CareerGoal>,
): Promise<CareerResult<void>> {
  try {
    return firestoreHelpers.updateDocument(COLLECTIONS.CAREER_GOALS, goalId, {
      ...updates,
      updatedAt: Date.now(),
    });
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}
export async function deleteGoal(goalId: string): Promise<CareerResult<void>> {
  try {
    return firestoreHelpers.deleteDocument(COLLECTIONS.CAREER_GOALS, goalId);
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

// --- Skills ---
export async function createSkill(
  uid: string,
  data: Partial<CareerSkill>,
): Promise<CareerResult<CareerSkill>> {
  try {
    const now = Date.now();
    const payload = {
      uid,
      name: data.name ?? '',
      category: data.category ?? 'General',
      currentLevel: data.currentLevel ?? 'beginner',
      targetLevel: data.targetLevel ?? 'intermediate',
      progress: 0,
      certificates: data.certificates ?? [],
      createdAt: now,
      updatedAt: now,
    };
    const result = await firestoreHelpers.createDocument(COLLECTIONS.CAREER_SKILLS, payload);
    if (!result.success || !result.data) return { success: false, error: result.error };
    return { success: true, data: { id: result.data, ...payload } as CareerSkill };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}
export function subscribeToSkills(
  uid: string,
  onNext: (s: CareerSkill[]) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<CareerSkill>(
    COLLECTIONS.CAREER_SKILLS,
    onNext,
    onError,
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
  );
}
export async function updateSkill(
  skillId: string,
  updates: Partial<CareerSkill>,
): Promise<CareerResult<void>> {
  try {
    return firestoreHelpers.updateDocument(COLLECTIONS.CAREER_SKILLS, skillId, {
      ...updates,
      updatedAt: Date.now(),
    });
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}
export async function deleteSkill(skillId: string): Promise<CareerResult<void>> {
  try {
    return firestoreHelpers.deleteDocument(COLLECTIONS.CAREER_SKILLS, skillId);
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

// --- Colleges ---
export async function createCollege(
  uid: string,
  data: Partial<CareerCollege>,
): Promise<CareerResult<CareerCollege>> {
  try {
    const now = Date.now();
    const payload = {
      uid,
      name: data.name ?? '',
      country: data.country ?? '',
      program: data.program ?? '',
      entranceExams: data.entranceExams ?? [],
      admissionRequirements: data.admissionRequirements ?? [],
      fees: data.fees ?? '',
      scholarships: data.scholarships ?? [],
      deadline: data.deadline ?? null,
      isDream: data.isDream ?? false,
      status: data.status ?? 'considering',
      createdAt: now,
      updatedAt: now,
    };
    const result = await firestoreHelpers.createDocument(COLLECTIONS.CAREER_COLLEGES, payload);
    if (!result.success || !result.data) return { success: false, error: result.error };
    return { success: true, data: { id: result.data, ...payload } as CareerCollege };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}
export function subscribeToColleges(
  uid: string,
  onNext: (c: CareerCollege[]) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<CareerCollege>(
    COLLECTIONS.CAREER_COLLEGES,
    onNext,
    onError,
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
  );
}
export async function updateCollege(
  collegeId: string,
  updates: Partial<CareerCollege>,
): Promise<CareerResult<void>> {
  try {
    return firestoreHelpers.updateDocument(COLLECTIONS.CAREER_COLLEGES, collegeId, {
      ...updates,
      updatedAt: Date.now(),
    });
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}
export async function deleteCollege(collegeId: string): Promise<CareerResult<void>> {
  try {
    return firestoreHelpers.deleteDocument(COLLECTIONS.CAREER_COLLEGES, collegeId);
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

// --- Timeline ---
export async function createTimelineEntry(
  uid: string,
  data: Partial<CareerTimelineEntry>,
): Promise<CareerResult<void>> {
  try {
    await firestoreHelpers.createDocument(COLLECTIONS.CAREER_PROGRESS, {
      uid,
      type: data.type ?? 'school',
      title: data.title ?? '',
      description: data.description ?? '',
      date: data.date ?? '',
      completed: false,
      createdAt: Date.now(),
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}
export function subscribeToTimeline(
  uid: string,
  onNext: (t: CareerTimelineEntry[]) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<CareerTimelineEntry>(
    COLLECTIONS.CAREER_PROGRESS,
    onNext,
    onError,
    where('uid', '==', uid),
    orderBy('date', 'asc'),
  );
}

// --- Recommendations ---
export async function getRecommendations(
  uid: string,
): Promise<CareerResult<CareerRecommendation | null>> {
  try {
    const ref = doc(db, COLLECTIONS.CAREER_RECOMMENDATIONS, uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: true, data: null };
    return { success: true, data: snap.data() as CareerRecommendation };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}
export async function saveRecommendations(
  uid: string,
  data: Omit<CareerRecommendation, 'uid' | 'updatedAt'>,
): Promise<CareerResult<void>> {
  try {
    const ref = doc(db, COLLECTIONS.CAREER_RECOMMENDATIONS, uid);
    await setDoc(ref, { ...data, uid, updatedAt: serverTimestamp() }, { merge: true });
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export const careerService = {
  createGoal,
  subscribeToGoals,
  updateGoal,
  deleteGoal,
  createSkill,
  subscribeToSkills,
  updateSkill,
  deleteSkill,
  createCollege,
  subscribeToColleges,
  updateCollege,
  deleteCollege,
  createTimelineEntry,
  subscribeToTimeline,
  getRecommendations,
  saveRecommendations,
} as const;
