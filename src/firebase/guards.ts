/**
 * StudentOS Firebase Runtime Guards
 *
 * Runtime helpers that throw clear, user-friendly errors when Firebase is
 * not configured. Used by service-layer code that needs the non-null
 * `db`, `auth`, or `storage` singletons.
 *
 * These guards ensure that:
 *   1. Build-time prerendering doesn't crash (the singletons are null, but
 *      service functions are never called at build time)
 *   2. Runtime calls get a clear error message instead of a null-pointer crash
 *
 * @see src/firebase/app.ts — singletons are null when env vars are missing
 */

import { auth, db, storage, isFirebaseReady } from './index';

/** Error thrown when a Firebase service is used but not configured. */
export class FirebaseNotConfiguredError extends Error {
  constructor() {
    super(
      'Firebase is not configured. Copy .env.local.example to .env.local and fill in your Firebase credentials.',
    );
    this.name = 'FirebaseNotConfiguredError';
  }
}

/**
 * Returns the Firestore instance, or throws if Firebase is not configured.
 * Use this in service functions that need a non-null `db`.
 *
 *   import { requireDb } from '@/firebase/guards';
 *   const database = requireDb();
 *   const ref = doc(database, 'users', uid);
 */
export function requireDb() {
  if (!db) throw new FirebaseNotConfiguredError();
  return db;
}

/**
 * Returns the Auth instance, or throws if Firebase is not configured.
 */
export function requireAuth() {
  if (!auth) throw new FirebaseNotConfiguredError();
  return auth;
}

/**
 * Returns the Storage instance, or throws if Firebase is not configured.
 */
export function requireStorage() {
  if (!storage) throw new FirebaseNotConfiguredError();
  return storage;
}

/** Re-export for convenience. */
export { isFirebaseReady };
