/**
 * StudentOS Planner — Session Service
 *
 * CRUD operations for study sessions. Collection: `study_sessions/{sessionId}`.
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
import type { StudySession, SessionStatus } from '../types';

export interface SessionServiceResult<T> {
  success: boolean;
  data?: T;
  error?: StudentOSFirebaseError;
}

export interface CreateSessionInput {
  planId: string | null;
  title: string;
  subject: string;
  topic: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  isRevision: boolean;
  isBreak: boolean;
  notes?: string | null;
}

// ---------------------------------------------------------------------------
// Create (batch)
// ---------------------------------------------------------------------------

export async function createSessions(
  uid: string,
  sessions: CreateSessionInput[],
): Promise<SessionServiceResult<string[]>> {
  try {
    const now = Date.now();
    // Pre-allocate doc refs + payloads, then issue all setDoc calls in
    // parallel. Was a sequential `for ... await` (N round-trips); now a
    // single concurrent fan-out (still N writes, but parallelised).
    const items = sessions.map((input) => {
      const ref = doc(collection(db, COLLECTIONS.STUDY_SESSIONS));
      const data = {
        uid,
        ...input,
        status: 'scheduled' as SessionStatus,
        focusModeUsed: false,
        notes: input.notes ?? null,
        createdAt: now,
        updatedAt: now,
      };
      return { ref, data, id: ref.id };
    });
    await Promise.all(
      items.map(({ ref, data }) =>
        setDoc(ref, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }),
      ),
    );
    return { success: true, data: items.map((i) => i.id) };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export function subscribeToSessions(
  uid: string,
  onNext: (sessions: StudySession[]) => void,
  onError?: (error: StudentOSFirebaseError) => void,
): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.STUDY_SESSIONS),
    where('uid', '==', uid),
    orderBy('date', 'asc'),
  );
  return onSnapshot(
    q,
    (snap) => onNext(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as StudySession)),
    (err) => onError?.(normalizeFirebaseError(err)),
  );
}

export async function getSessionsByDate(
  uid: string,
  date: string,
): Promise<SessionServiceResult<StudySession[]>> {
  try {
    const q = query(
      collection(db, COLLECTIONS.STUDY_SESSIONS),
      where('uid', '==', uid),
      where('date', '==', date),
      orderBy('startTime', 'asc'),
    );
    const snap = await getDocs(q);
    return {
      success: true,
      data: snap.docs.map((d) => ({ id: d.id, ...d.data() }) as StudySession),
    };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export async function getSessionsByDateRange(
  uid: string,
  startDate: string,
  endDate: string,
): Promise<SessionServiceResult<StudySession[]>> {
  try {
    const q = query(
      collection(db, COLLECTIONS.STUDY_SESSIONS),
      where('uid', '==', uid),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'asc'),
    );
    const snap = await getDocs(q);
    return {
      success: true,
      data: snap.docs.map((d) => ({ id: d.id, ...d.data() }) as StudySession),
    };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export async function updateSession(
  sessionId: string,
  updates: Partial<Omit<StudySession, 'id' | 'uid' | 'createdAt'>>,
): Promise<SessionServiceResult<void>> {
  try {
    const ref = doc(db, COLLECTIONS.STUDY_SESSIONS, sessionId);
    await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export async function updateSessionStatus(
  sessionId: string,
  status: SessionStatus,
): Promise<SessionServiceResult<void>> {
  return updateSession(sessionId, { status });
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export async function deleteSession(sessionId: string): Promise<SessionServiceResult<void>> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.STUDY_SESSIONS, sessionId));
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export const sessionService = {
  createSessions,
  subscribeToSessions,
  getSessionsByDate,
  getSessionsByDateRange,
  updateSession,
  updateSessionStatus,
  deleteSession,
} as const;
