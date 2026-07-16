/**
 * StudentOS Junova AI — Live Teacher Service
 *
 * CRUD operations for live session settings. Single document per user at
 * `junova_live_sessions/{uid}`.
 *
 * @see src/firebase/constants.ts — COLLECTIONS.JUNOVA_LIVE_SESSIONS
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
import type { LiveSessionSettings } from '../types';
import { DEFAULT_LIVE_SESSION_SETTINGS } from '../types';

export interface LiveTeacherServiceResult<T> {
  success: boolean;
  data?: T;
  error?: StudentOSFirebaseError;
}

export type LiveSessionUpdate = Partial<Omit<LiveSessionSettings, 'uid' | 'createdAt'>>;

/** Get live session settings. Returns null if not yet created. */
export async function getLiveSessionSettings(
  uid: string,
): Promise<LiveTeacherServiceResult<LiveSessionSettings | null>> {
  try {
    const ref = doc(db, COLLECTIONS.JUNOVA_LIVE_SESSIONS, uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: true, data: null };
    return { success: true, data: snap.data() as LiveSessionSettings };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

/** Subscribe to live session settings in real-time. */
export function subscribeToLiveSessionSettings(
  uid: string,
  onNext: (settings: LiveSessionSettings | null) => void,
  onError?: (error: StudentOSFirebaseError) => void,
): Unsubscribe {
  const ref = doc(db, COLLECTIONS.JUNOVA_LIVE_SESSIONS, uid);
  return onSnapshot(
    ref,
    (snap) => onNext(snap.exists() ? (snap.data() as LiveSessionSettings) : null),
    (err) => onError?.(normalizeFirebaseError(err)),
  );
}

/** Create settings doc if it doesn't exist. Idempotent. */
export async function ensureLiveSessionExists(
  uid: string,
  overrides?: Partial<LiveSessionUpdate>,
): Promise<LiveTeacherServiceResult<LiveSessionSettings>> {
  try {
    const ref = doc(db, COLLECTIONS.JUNOVA_LIVE_SESSIONS, uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const now = Date.now();
      const settings: LiveSessionSettings = {
        ...DEFAULT_LIVE_SESSION_SETTINGS,
        uid,
        ...overrides,
        createdAt: now,
        updatedAt: now,
      } as LiveSessionSettings;
      await setDoc(ref, {
        ...settings,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { success: true, data: settings };
    }
    return { success: true, data: snap.data() as LiveSessionSettings };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

/** Update specific fields. Creates the doc if it doesn't exist. */
export async function updateLiveSessionSettings(
  uid: string,
  updates: LiveSessionUpdate,
): Promise<LiveTeacherServiceResult<void>> {
  try {
    await ensureLiveSessionExists(uid);
    const ref = doc(db, COLLECTIONS.JUNOVA_LIVE_SESSIONS, uid);
    await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export const liveTeacherService = {
  getLiveSessionSettings,
  subscribeToLiveSessionSettings,
  ensureLiveSessionExists,
  updateLiveSessionSettings,
} as const;
