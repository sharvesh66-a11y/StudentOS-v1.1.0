/**
 * StudentOS Junova AI — Voice Preferences Service
 *
 * CRUD operations for the user's voice preferences. Single document per
 * user at `junova_voice_preferences/{uid}`.
 *
 * @see src/firebase/constants.ts — COLLECTIONS.JUNOVA_VOICE_PREFERENCES
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
import type { VoicePreferences } from '../types';
import { DEFAULT_VOICE_PREFERENCES } from '../types';

export interface VoiceServiceResult<T> {
  success: boolean;
  data?: T;
  error?: StudentOSFirebaseError;
}

export type VoicePreferencesUpdate = Partial<Omit<VoicePreferences, 'uid' | 'createdAt'>>;

/** Get voice preferences. Returns null if not yet created. */
export async function getVoicePreferences(
  uid: string,
): Promise<VoiceServiceResult<VoicePreferences | null>> {
  try {
    const ref = doc(db, COLLECTIONS.JUNOVA_VOICE_PREFERENCES, uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: true, data: null };
    return { success: true, data: snap.data() as VoicePreferences };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

/** Subscribe to voice preferences in real-time. */
export function subscribeToVoicePreferences(
  uid: string,
  onNext: (prefs: VoicePreferences | null) => void,
  onError?: (error: StudentOSFirebaseError) => void,
): Unsubscribe {
  const ref = doc(db, COLLECTIONS.JUNOVA_VOICE_PREFERENCES, uid);
  return onSnapshot(
    ref,
    (snap) => onNext(snap.exists() ? (snap.data() as VoicePreferences) : null),
    (err) => onError?.(normalizeFirebaseError(err)),
  );
}

/** Create the preferences doc if it doesn't exist. Idempotent. */
export async function ensureVoicePreferencesExist(
  uid: string,
  overrides?: Partial<VoicePreferencesUpdate>,
): Promise<VoiceServiceResult<VoicePreferences>> {
  try {
    const ref = doc(db, COLLECTIONS.JUNOVA_VOICE_PREFERENCES, uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const now = Date.now();
      const prefs: VoicePreferences = {
        ...DEFAULT_VOICE_PREFERENCES,
        uid,
        ...overrides,
        createdAt: now,
        updatedAt: now,
      } as VoicePreferences;
      await setDoc(ref, { ...prefs, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      return { success: true, data: prefs };
    }
    return { success: true, data: snap.data() as VoicePreferences };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

/** Update specific fields. Creates the doc if it doesn't exist. */
export async function updateVoicePreferences(
  uid: string,
  updates: VoicePreferencesUpdate,
): Promise<VoiceServiceResult<void>> {
  try {
    await ensureVoicePreferencesExist(uid);
    const ref = doc(db, COLLECTIONS.JUNOVA_VOICE_PREFERENCES, uid);
    await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export const voiceService = {
  getVoicePreferences,
  subscribeToVoicePreferences,
  ensureVoicePreferencesExist,
  updateVoicePreferences,
} as const;
