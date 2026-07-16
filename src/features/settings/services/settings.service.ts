/**
 * StudentOS Settings Service
 * User settings CRUD at `user_settings/{uid}`.
 */
import { db, COLLECTIONS, type StudentOSFirebaseError } from '@/firebase';
import { normalizeFirebaseError } from '@/firebase/error-handler';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import type { UserSettings } from '../../tools/types';
import { DEFAULT_USER_SETTINGS } from '../../tools/types';

export interface SettingsResult<T> {
  success: boolean;
  data?: T;
  error?: StudentOSFirebaseError;
}

export async function getSettings(uid: string): Promise<SettingsResult<UserSettings | null>> {
  try {
    const ref = doc(db, COLLECTIONS.USER_SETTINGS, uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: true, data: null };
    return { success: true, data: snap.data() as UserSettings };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export async function ensureSettings(uid: string): Promise<SettingsResult<UserSettings>> {
  try {
    const ref = doc(db, COLLECTIONS.USER_SETTINGS, uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const data: UserSettings = { ...DEFAULT_USER_SETTINGS, uid, updatedAt: Date.now() };
      await setDoc(ref, { ...data, updatedAt: serverTimestamp() });
      return { success: true, data };
    }
    return { success: true, data: snap.data() as UserSettings };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export async function updateSettings(
  uid: string,
  updates: Partial<UserSettings>,
): Promise<SettingsResult<void>> {
  try {
    await ensureSettings(uid);
    const ref = doc(db, COLLECTIONS.USER_SETTINGS, uid);
    await setDoc(ref, { ...updates, updatedAt: serverTimestamp() }, { merge: true });
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export function subscribeToSettings(
  uid: string,
  onNext: (settings: UserSettings | null) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  const ref = doc(db, COLLECTIONS.USER_SETTINGS, uid);
  return onSnapshot(
    ref,
    (snap) => onNext(snap.exists() ? (snap.data() as UserSettings) : null),
    (err) => onError?.(normalizeFirebaseError(err)),
  );
}

export const settingsService = {
  getSettings,
  ensureSettings,
  updateSettings,
  subscribeToSettings,
} as const;
