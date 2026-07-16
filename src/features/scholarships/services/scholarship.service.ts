/**
 * StudentOS Scholarship Finder — Service
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
  Scholarship,
  StudentScholarship,
  ScholarshipProfile,
  ScholarshipRecommendation,
  ScholarshipNotification,
} from '../types';

export interface ScholarshipResult<T> {
  success: boolean;
  data?: T;
  error?: StudentOSFirebaseError;
}

// --- Scholarships ---
export function subscribeToScholarships(
  onNext: (s: Scholarship[]) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<Scholarship>(
    COLLECTIONS.SCHOLARSHIPS,
    onNext,
    onError,
    orderBy('createdAt', 'desc'),
  );
}

// --- Student Scholarships (saved/applied) ---
export async function saveScholarship(
  uid: string,
  s: Scholarship,
): Promise<ScholarshipResult<void>> {
  try {
    await firestoreHelpers.createDocument(COLLECTIONS.STUDENT_SCHOLARSHIPS, {
      uid,
      scholarshipId: s.id,
      scholarshipName: s.name,
      status: 'saved',
      notes: '',
      matchScore: 0,
      deadline: s.deadline,
      appliedAt: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}
export function subscribeToStudentScholarships(
  uid: string,
  onNext: (s: StudentScholarship[]) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<StudentScholarship>(
    COLLECTIONS.STUDENT_SCHOLARSHIPS,
    onNext,
    onError,
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
  );
}
export async function updateStudentScholarship(
  id: string,
  updates: Partial<StudentScholarship>,
): Promise<ScholarshipResult<void>> {
  try {
    return firestoreHelpers.updateDocument(COLLECTIONS.STUDENT_SCHOLARSHIPS, id, {
      ...updates,
      updatedAt: Date.now(),
    });
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}
export async function removeStudentScholarship(id: string): Promise<ScholarshipResult<void>> {
  try {
    return firestoreHelpers.deleteDocument(COLLECTIONS.STUDENT_SCHOLARSHIPS, id);
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

// --- Profile ---
export async function getProfile(
  uid: string,
): Promise<ScholarshipResult<ScholarshipProfile | null>> {
  try {
    const ref = doc(db, COLLECTIONS.SCHOLARSHIP_PROFILES, uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: true, data: null };
    return { success: true, data: snap.data() as ScholarshipProfile };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}
export async function updateProfile(
  uid: string,
  updates: Partial<ScholarshipProfile>,
): Promise<ScholarshipResult<void>> {
  try {
    const ref = doc(db, COLLECTIONS.SCHOLARSHIP_PROFILES, uid);
    await setDoc(ref, { ...updates, uid, updatedAt: Date.now() }, { merge: true });
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

// --- Recommendations ---
export async function getRecommendations(
  uid: string,
): Promise<ScholarshipResult<ScholarshipRecommendation | null>> {
  try {
    const ref = doc(db, COLLECTIONS.SCHOLARSHIP_RECOMMENDATIONS, uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: true, data: null };
    return { success: true, data: snap.data() as ScholarshipRecommendation };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}
export async function saveRecommendations(
  uid: string,
  data: Omit<ScholarshipRecommendation, 'uid' | 'updatedAt'>,
): Promise<ScholarshipResult<void>> {
  try {
    const ref = doc(db, COLLECTIONS.SCHOLARSHIP_RECOMMENDATIONS, uid);
    await setDoc(ref, { ...data, uid, updatedAt: serverTimestamp() }, { merge: true });
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

// --- Notifications ---
export function subscribeToNotifications(
  uid: string,
  onNext: (n: ScholarshipNotification[]) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<ScholarshipNotification>(
    COLLECTIONS.SCHOLARSHIP_NOTIFICATIONS,
    onNext,
    onError,
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
  );
}
export async function markNotificationRead(id: string): Promise<ScholarshipResult<void>> {
  try {
    return firestoreHelpers.updateDocument(COLLECTIONS.SCHOLARSHIP_NOTIFICATIONS, id, {
      read: true,
    });
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export const scholarshipService = {
  subscribeToScholarships,
  saveScholarship,
  subscribeToStudentScholarships,
  updateStudentScholarship,
  removeStudentScholarship,
  getProfile,
  updateProfile,
  getRecommendations,
  saveRecommendations,
  subscribeToNotifications,
  markNotificationRead,
} as const;
