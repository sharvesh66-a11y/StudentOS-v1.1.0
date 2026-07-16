/**
 * StudentOS Firestore Helpers
 *
 * Reusable, typed CRUD primitives. Every helper:
 *   - Returns a `FirestoreHelperResult<T>` envelope (success boolean + data/error)
 *   - Normalizes errors via `normalizeFirebaseError`
 *   - Uses `COLLECTIONS` constants (never hardcoded collection strings)
 *
 * Feature services (auth, junova, planner, etc.) build on these primitives
 * rather than calling the raw Firestore SDK directly. This guarantees
 * consistent error handling and makes the data layer mockable in tests.
 *
 * @see src/firebase/firestore.ts for the `db` instance.
 * @see src/firebase/constants.ts for `COLLECTIONS`.
 * @see src/firebase/error-handler.ts for error normalization.
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  type DocumentData,
  type QueryConstraint,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firestore';
import { normalizeFirebaseError, type StudentOSFirebaseError } from './error-handler';

/** Standard result envelope returned by every Firestore helper. */
export interface FirestoreHelperResult<T> {
  success: boolean;
  data?: T;
  error?: StudentOSFirebaseError;
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

/**
 * Read a single document by ID.
 *
 * @example
 *   const res = await getDocument<UserProfile>(COLLECTIONS.USERS, uid);
 *   if (res.success) console.log(res.data);
 */
export async function getDocument<T = DocumentData>(
  collectionName: string,
  id: string,
): Promise<FirestoreHelperResult<T | null>> {
  try {
    const ref = doc(db, collectionName, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: true, data: null };
    return { success: true, data: { id: snap.id, ...snap.data() } as T };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

/**
 * Query a collection with optional constraints.
 *
 * @example
 *   const res = await queryCollection<Note>(
 *     COLLECTIONS.NOTES,
 *     where('uid', '==', uid),
 *     orderBy('updatedAt', 'desc'),
 *     limit(20),
 *   );
 */
export async function queryCollection<T = DocumentData>(
  collectionName: string,
  ...constraints: QueryConstraint[]
): Promise<FirestoreHelperResult<T[]>> {
  try {
    const q = query(collection(db, collectionName), ...constraints);
    const snap = await getDocs(q);
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as T[];
    return { success: true, data: items };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

/**
 * Subscribe to a single document in real-time.
 *
 * @example
 *   const unsubscribe = subscribeToDocument<UserProfile>(
 *     COLLECTIONS.USERS, uid,
 *     (profile) => console.log(profile),
 *     (error) => console.error(error),
 *   );
 *   // Later: unsubscribe();
 */
export function subscribeToDocument<T = DocumentData>(
  collectionName: string,
  id: string,
  onNext: (data: T | null) => void,
  onError?: (error: StudentOSFirebaseError) => void,
): Unsubscribe {
  const ref = doc(db, collectionName, id);
  return onSnapshot(
    ref,
    (snap) => {
      onNext(snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null);
    },
    (err) => {
      onError?.(normalizeFirebaseError(err));
    },
  );
}

/**
 * Subscribe to a query in real-time.
 *
 * @example
 *   const unsubscribe = subscribeToQuery<Note>(
 *     COLLECTIONS.NOTES,
 *     (notes) => setNotes(notes),
 *     (err) => setError(err),
 *     where('uid', '==', uid),
 *     orderBy('updatedAt', 'desc'),
 *   );
 */
export function subscribeToQuery<T = DocumentData>(
  collectionName: string,
  onNext: (data: T[]) => void,
  onError?: (error: StudentOSFirebaseError) => void,
  ...constraints: QueryConstraint[]
): Unsubscribe {
  const q = query(collection(db, collectionName), ...constraints);
  return onSnapshot(
    q,
    (snap) => {
      onNext(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as T[]);
    },
    (err) => {
      onError?.(normalizeFirebaseError(err));
    },
  );
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

/**
 * Create or overwrite a document with a generated ID.
 *
 * Sets `createdAt` and `updatedAt` server timestamps automatically.
 * Returns the new document ID.
 *
 * @example
 *   const res = await createDocument(COLLECTIONS.NOTES, { title: 'Hi', uid });
 */
export async function createDocument<T extends Record<string, unknown>>(
  collectionName: string,
  data: T,
  customId?: string,
): Promise<FirestoreHelperResult<string>> {
  try {
    const ref = customId ? doc(db, collectionName, customId) : doc(collection(db, collectionName));
    const payload = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(ref, payload);
    return { success: true, data: ref.id };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

/**
 * Update an existing document (partial update).
 * Automatically bumps `updatedAt`.
 */
export async function updateDocument<T extends Record<string, unknown>>(
  collectionName: string,
  id: string,
  updates: Partial<T>,
): Promise<FirestoreHelperResult<void>> {
  try {
    const ref = doc(db, collectionName, id);
    await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

/**
 * Set (create or overwrite) a document at a specific ID.
 * Does NOT auto-add timestamps — caller controls the full payload.
 */
export async function setDocument<T extends Record<string, unknown>>(
  collectionName: string,
  id: string,
  data: T,
  merge = false,
): Promise<FirestoreHelperResult<void>> {
  try {
    const ref = doc(db, collectionName, id);
    if (merge) {
      await setDoc(ref, data, { merge: true });
    } else {
      await setDoc(ref, data);
    }
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

/**
 * Delete a document by ID.
 */
export async function deleteDocument(
  collectionName: string,
  id: string,
): Promise<FirestoreHelperResult<void>> {
  try {
    const ref = doc(db, collectionName, id);
    await deleteDoc(ref);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

// ---------------------------------------------------------------------------
// Convenience — re-export commonly used query builders
// ---------------------------------------------------------------------------

export { where, orderBy, limit };

/**
 * Barrel — all Firestore helpers.
 */
export const firestoreHelpers = {
  getDocument,
  queryCollection,
  subscribeToDocument,
  subscribeToQuery,
  createDocument,
  updateDocument,
  setDocument,
  deleteDocument,
} as const;
