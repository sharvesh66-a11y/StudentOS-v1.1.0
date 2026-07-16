/**
 * StudentOS Auth Domain Types
 *
 * Types specific to the auth feature. Cross-feature types live in
 * `src/types/index.ts` and `src/firebase/types.ts`.
 *
 * Note: `AuthError` is now an alias for `StudentOSFirebaseError` from the
 * centralized error-handler, so all Firebase errors share a single shape
 * across the codebase.
 */

import type { User as FirebaseUser } from 'firebase/auth';
import type { UserProfile, StudentOSFirebaseError } from '@/firebase';

/**
 * Normalized error type for auth operations.
 * Alias for the centralized `StudentOSFirebaseError` — kept for backward
 * compatibility and clearer auth-feature intent.
 */
export type AuthError = StudentOSFirebaseError;

/** Sign-up payload (validated by Zod in the UI layer in M2). */
export interface SignUpPayload {
  email: string;
  password: string;
  displayName: string;
}

/** Sign-in payload. */
export interface SignInPayload {
  email: string;
  password: string;
}

/** OAuth provider IDs supported by StudentOS. */
export type OAuthProviderId = 'google' | 'apple';

/** Result of an auth operation. */
export interface AuthResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: AuthError;
}

/**
 * Shape of the auth state. Used by the Zustand store (internal backing
 * store) and the React Context value.
 */
export interface AuthState {
  /** The Firebase user, or null when signed out. */
  user: FirebaseUser | null;
  /** The StudentOS profile from Firestore (loaded after auth resolves). */
  profile: UserProfile | null;
  /** True until `onAuthStateChanged` fires its first result. */
  isLoading: boolean;
  /** Set when an auth operation fails. */
  error: AuthError | null;
  /** True if a profile is fully loaded (user is signed in AND profile fetched). */
  isAuthenticated: boolean;
}
