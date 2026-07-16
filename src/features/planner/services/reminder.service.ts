/**
 * StudentOS Planner — Reminder Service
 *
 * CRUD operations for reminders. Collection: `reminders/{reminderId}`.
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
  type Unsubscribe,
} from 'firebase/firestore';
import { normalizeFirebaseError } from '@/firebase/error-handler';
import type { Reminder, ReminderType } from '../types';

export interface ReminderServiceResult<T> {
  success: boolean;
  data?: T;
  error?: StudentOSFirebaseError;
}

export interface CreateReminderInput {
  title: string;
  message: string;
  type: ReminderType;
  scheduledAt: string;
  sessionId?: string | null;
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export async function createReminder(
  uid: string,
  input: CreateReminderInput,
): Promise<ReminderServiceResult<Reminder>> {
  try {
    const now = Date.now();
    const data = {
      uid,
      title: input.title,
      message: input.message,
      type: input.type,
      scheduledAt: input.scheduledAt,
      dismissed: false,
      completed: false,
      sessionId: input.sessionId ?? null,
      createdAt: now,
      updatedAt: now,
    };
    const ref = doc(collection(db, COLLECTIONS.REMINDERS));
    await setDoc(ref, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    return { success: true, data: { id: ref.id, ...data } as Reminder };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export function subscribeToReminders(
  uid: string,
  onNext: (reminders: Reminder[]) => void,
  onError?: (error: StudentOSFirebaseError) => void,
): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.REMINDERS),
    where('uid', '==', uid),
    orderBy('scheduledAt', 'asc'),
  );
  return onSnapshot(
    q,
    (snap) => onNext(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Reminder)),
    (err) => onError?.(normalizeFirebaseError(err)),
  );
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export async function updateReminder(
  reminderId: string,
  updates: Partial<Omit<Reminder, 'id' | 'uid' | 'createdAt'>>,
): Promise<ReminderServiceResult<void>> {
  try {
    const ref = doc(db, COLLECTIONS.REMINDERS, reminderId);
    await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export async function dismissReminder(reminderId: string): Promise<ReminderServiceResult<void>> {
  return updateReminder(reminderId, { dismissed: true });
}

export async function completeReminder(reminderId: string): Promise<ReminderServiceResult<void>> {
  return updateReminder(reminderId, { completed: true, dismissed: true });
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export async function deleteReminder(reminderId: string): Promise<ReminderServiceResult<void>> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.REMINDERS, reminderId));
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export const reminderService = {
  createReminder,
  subscribeToReminders,
  updateReminder,
  dismissReminder,
  completeReminder,
  deleteReminder,
} as const;
