/**
 * StudentOS Freelancing — Service
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
  FreelanceProfile,
  FreelanceJob,
  JobApplication,
  Project,
  FreelanceMessage,
  PortfolioItem,
  Review,
  Earning,
} from '../types';

export interface FreelanceResult<T> {
  success: boolean;
  data?: T;
  error?: StudentOSFirebaseError;
}

// --- Profile ---
export async function getProfile(uid: string): Promise<FreelanceResult<FreelanceProfile | null>> {
  try {
    const ref = doc(db, COLLECTIONS.FREELANCE_PROFILES, uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: true, data: null };
    return { success: true, data: snap.data() as FreelanceProfile };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}
export async function updateProfile(
  uid: string,
  data: Partial<FreelanceProfile>,
): Promise<FreelanceResult<void>> {
  try {
    const ref = doc(db, COLLECTIONS.FREELANCE_PROFILES, uid);
    await setDoc(ref, { ...data, uid, updatedAt: serverTimestamp() }, { merge: true });
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

// --- Jobs ---
export async function createJob(
  data: Omit<FreelanceJob, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<FreelanceResult<FreelanceJob>> {
  try {
    const now = Date.now();
    const payload = { ...data, createdAt: now, updatedAt: now };
    const result = await firestoreHelpers.createDocument(COLLECTIONS.FREELANCE_JOBS, payload);
    if (!result.success || !result.data) return { success: false, error: result.error };
    return { success: true, data: { id: result.data, ...payload } as FreelanceJob };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}
export function subscribeToJobs(
  onNext: (j: FreelanceJob[]) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<FreelanceJob>(
    COLLECTIONS.FREELANCE_JOBS,
    onNext,
    onError,
    orderBy('createdAt', 'desc'),
  );
}
export function subscribeToMyJobs(
  uid: string,
  onNext: (j: FreelanceJob[]) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<FreelanceJob>(
    COLLECTIONS.FREELANCE_JOBS,
    onNext,
    onError,
    where('clientUid', '==', uid),
    orderBy('createdAt', 'desc'),
  );
}

// --- Applications ---
export async function applyForJob(
  data: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<FreelanceResult<void>> {
  try {
    const now = Date.now();
    await firestoreHelpers.createDocument(COLLECTIONS.JOB_APPLICATIONS, {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}
export function subscribeToMyApplications(
  uid: string,
  onNext: (a: JobApplication[]) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<JobApplication>(
    COLLECTIONS.JOB_APPLICATIONS,
    onNext,
    onError,
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
  );
}
export async function updateApplication(
  id: string,
  updates: Partial<JobApplication>,
): Promise<FreelanceResult<void>> {
  try {
    return firestoreHelpers.updateDocument(COLLECTIONS.JOB_APPLICATIONS, id, {
      ...updates,
      updatedAt: Date.now(),
    });
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

// --- Projects ---
export async function createProject(
  data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<FreelanceResult<Project>> {
  try {
    const now = Date.now();
    const payload = { ...data, createdAt: now, updatedAt: now };
    const result = await firestoreHelpers.createDocument(COLLECTIONS.FREELANCE_PROJECTS, payload);
    if (!result.success || !result.data) return { success: false, error: result.error };
    return { success: true, data: { id: result.data, ...payload } as Project };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}
export function subscribeToMyProjects(
  uid: string,
  onNext: (p: Project[]) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<Project>(
    COLLECTIONS.FREELANCE_PROJECTS,
    onNext,
    onError,
    where('studentUid', '==', uid),
    orderBy('updatedAt', 'desc'),
  );
}
export async function updateProject(
  id: string,
  updates: Partial<Project>,
): Promise<FreelanceResult<void>> {
  try {
    return firestoreHelpers.updateDocument(COLLECTIONS.FREELANCE_PROJECTS, id, {
      ...updates,
      updatedAt: Date.now(),
    });
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

// --- Messages ---
export async function sendMessage(
  projectId: string,
  data: { uid: string; displayName: string; content: string },
): Promise<FreelanceResult<void>> {
  try {
    await firestoreHelpers.createDocument(COLLECTIONS.FREELANCE_MESSAGES, {
      projectId,
      ...data,
      attachments: [],
      readBy: [data.uid],
      createdAt: Date.now(),
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}
export function subscribeToMessages(
  projectId: string,
  onNext: (m: FreelanceMessage[]) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<FreelanceMessage>(
    COLLECTIONS.FREELANCE_MESSAGES,
    onNext,
    onError,
    where('projectId', '==', projectId),
    orderBy('createdAt', 'asc'),
  );
}

// --- Portfolio ---
export async function createPortfolioItem(
  uid: string,
  data: Partial<PortfolioItem>,
): Promise<FreelanceResult<void>> {
  try {
    await firestoreHelpers.createDocument(COLLECTIONS.PORTFOLIOS, {
      uid,
      ...data,
      createdAt: Date.now(),
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}
export function subscribeToPortfolio(
  uid: string,
  onNext: (p: PortfolioItem[]) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<PortfolioItem>(
    COLLECTIONS.PORTFOLIOS,
    onNext,
    onError,
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
  );
}
export async function deletePortfolioItem(id: string): Promise<FreelanceResult<void>> {
  try {
    return firestoreHelpers.deleteDocument(COLLECTIONS.PORTFOLIOS, id);
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

// --- Reviews ---
export async function createReview(
  data: Omit<Review, 'id' | 'createdAt'>,
): Promise<FreelanceResult<void>> {
  try {
    await firestoreHelpers.createDocument(COLLECTIONS.REVIEWS, { ...data, createdAt: Date.now() });
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}
export function subscribeToReviews(
  uid: string,
  onNext: (r: Review[]) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<Review>(
    COLLECTIONS.REVIEWS,
    onNext,
    onError,
    where('reviewedUid', '==', uid),
    orderBy('createdAt', 'desc'),
  );
}

// --- Earnings ---
export function subscribeToEarnings(
  uid: string,
  onNext: (e: Earning[]) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<Earning>(
    COLLECTIONS.EARNINGS,
    onNext,
    onError,
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
  );
}

export const freelanceService = {
  getProfile,
  updateProfile,
  createJob,
  subscribeToJobs,
  subscribeToMyJobs,
  applyForJob,
  subscribeToMyApplications,
  updateApplication,
  createProject,
  subscribeToMyProjects,
  updateProject,
  sendMessage,
  subscribeToMessages,
  createPortfolioItem,
  subscribeToPortfolio,
  deletePortfolioItem,
  createReview,
  subscribeToReviews,
  subscribeToEarnings,
} as const;
