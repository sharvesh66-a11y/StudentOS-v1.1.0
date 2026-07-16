/**
 * StudentOS Junova AI — Memory Service
 *
 * CRUD operations for the student's long-term memory. Uses a single document
 * per user at `junova_memory/{uid}` — this prevents duplicate memories,
 * enables atomic updates, and lets the AI read the full context in one fetch.
 *
 * @see src/firebase/firestore-helpers.ts
 * @see src/firebase/constants.ts — COLLECTIONS.JUNOVA_MEMORY
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
import type { StudentMemory } from '../types';
import { DEFAULT_MEMORY } from '../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MemoryServiceResult<T> {
  success: boolean;
  data?: T;
  error?: StudentOSFirebaseError;
}

/** Partial memory update — only the fields being changed. */
export type MemoryUpdate = Partial<Omit<StudentMemory, 'uid' | 'createdAt'>>;

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

/**
 * Get a user's memory document. Returns null if it doesn't exist yet
 * (first-time user).
 */
export async function getMemory(uid: string): Promise<MemoryServiceResult<StudentMemory | null>> {
  try {
    const ref = doc(db, COLLECTIONS.JUNOVA_MEMORY, uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: true, data: null };
    return { success: true, data: snap.data() as StudentMemory };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

/**
 * Subscribe to a user's memory in real-time. The callback fires immediately
 * with the current state (or null) and again whenever the document changes.
 *
 * @returns unsubscribe function
 */
export function subscribeToMemory(
  uid: string,
  onNext: (memory: StudentMemory | null) => void,
  onError?: (error: StudentOSFirebaseError) => void,
): Unsubscribe {
  const ref = doc(db, COLLECTIONS.JUNOVA_MEMORY, uid);
  return onSnapshot(
    ref,
    (snap) => {
      onNext(snap.exists() ? (snap.data() as StudentMemory) : null);
    },
    (err) => onError?.(normalizeFirebaseError(err)),
  );
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

/**
 * Create the memory document if it doesn't exist. Uses the provided data
 * or defaults. Idempotent — safe to call multiple times.
 */
export async function ensureMemoryExists(
  uid: string,
  overrides?: Partial<MemoryUpdate>,
): Promise<MemoryServiceResult<StudentMemory>> {
  try {
    const ref = doc(db, COLLECTIONS.JUNOVA_MEMORY, uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      const now = Date.now();
      const memory: StudentMemory = {
        ...DEFAULT_MEMORY,
        uid,
        ...overrides,
        createdAt: now,
        updatedAt: now,
      } as StudentMemory;
      await setDoc(ref, { ...memory, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      return { success: true, data: memory };
    }

    return { success: true, data: snap.data() as StudentMemory };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

/**
 * Update specific fields of the memory document. Automatically bumps
 * `updatedAt`. Creates the document if it doesn't exist.
 */
export async function updateMemory(
  uid: string,
  updates: MemoryUpdate,
): Promise<MemoryServiceResult<void>> {
  try {
    // Ensure doc exists first
    await ensureMemoryExists(uid);

    const ref = doc(db, COLLECTIONS.JUNOVA_MEMORY, uid);
    await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

/**
 * Add a topic to the weak-topics list (deduplicates automatically).
 */
export async function addWeakTopic(uid: string, topic: string): Promise<MemoryServiceResult<void>> {
  const result = await getMemory(uid);
  if (!result.success) return { success: false, error: result.error };

  const existing = result.data?.weakTopics ?? [];
  if (existing.includes(topic)) return { success: true }; // Already exists — no duplicate

  return updateMemory(uid, { weakTopics: [...existing, topic] });
}

/**
 * Add a topic to the strong-topics list (deduplicates automatically).
 */
export async function addStrongTopic(
  uid: string,
  topic: string,
): Promise<MemoryServiceResult<void>> {
  const result = await getMemory(uid);
  if (!result.success) return { success: false, error: result.error };

  const existing = result.data?.strongTopics ?? [];
  if (existing.includes(topic)) return { success: true };

  return updateMemory(uid, { strongTopics: [...existing, topic] });
}

/**
 * Add a topic to recent-topics (keeps last 10, deduplicates).
 */
export async function addRecentTopic(
  uid: string,
  topic: string,
): Promise<MemoryServiceResult<void>> {
  const result = await getMemory(uid);
  if (!result.success) return { success: false, error: result.error };

  const existing = result.data?.recentTopics ?? [];
  const filtered = existing.filter((t) => t !== topic);
  const updated = [topic, ...filtered].slice(0, 10); // Keep most recent 10

  return updateMemory(uid, { recentTopics: updated });
}

/**
 * Add or update a revision-history entry. If the topic already exists,
 * updates the timestamp + confidence.
 */
export async function recordRevision(
  uid: string,
  entry: { topic: string; subject: string; confidence: number },
): Promise<MemoryServiceResult<void>> {
  const result = await getMemory(uid);
  if (!result.success) return { success: false, error: result.error };

  const existing = result.data?.revisionHistory ?? [];
  const filtered = existing.filter((r) => r.topic !== entry.topic);
  const updated = [{ ...entry, lastReviewed: Date.now() }, ...filtered].slice(0, 50); // Keep most recent 50

  return updateMemory(uid, { revisionHistory: updated });
}

/**
 * Update the conversation summary (auto-generated by AI).
 */
export async function updateConversationSummary(
  uid: string,
  summary: string,
): Promise<MemoryServiceResult<void>> {
  return updateMemory(uid, {
    conversationSummary: summary,
    lastSummaryUpdate: Date.now(),
  });
}

// ---------------------------------------------------------------------------
// Barrel
// ---------------------------------------------------------------------------

export const memoryService = {
  getMemory,
  subscribeToMemory,
  ensureMemoryExists,
  updateMemory,
  addWeakTopic,
  addStrongTopic,
  addRecentTopic,
  recordRevision,
  updateConversationSummary,
} as const;
