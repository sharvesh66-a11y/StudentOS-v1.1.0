/**
 * StudentOS Auth Service
 *
 * Production-ready auth service layer. Wraps Firebase Auth SDK into typed,
 * business-domain functions. NO UI, NO React, NO Zustand here — pure
 * business logic that the AuthProvider (React) consumes.
 *
 * Responsibilities:
 * - Sign up (email/password) — creates Auth user AND Firestore profile doc
 * - Sign in (email/password)
 * - Sign out
 * - Password reset (email link)
 * - Email verification
 * - OAuth sign-in (Google, Apple)
 * - Profile sync (read / write Firestore `users/{uid}` doc)
 *
 * Error handling:
 * - All Firebase errors are normalized via the centralized `normalizeFirebaseError`
 *   in `src/firebase/error-handler.ts`. The UI receives consistent
 *   `StudentOSFirebaseError` shapes regardless of which Firebase service
 *   raised the error.
 *
 * @see src/firebase/error-handler.ts
 * @see docs/DATABASE.md for the `users` collection schema.
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile as firebaseUpdateProfile,
  GoogleAuthProvider,
  OAuthProvider,
  type User as FirebaseUser,
  type UserCredential,
  type AuthProvider as FirebaseAuthProvider,
} from 'firebase/auth';

import {
  auth,
  db,
  COLLECTIONS,
  normalizeFirebaseError,
  type StudentOSFirebaseError,
  type UserProfile,
  newUserProfileFromFirebase,
} from '@/firebase';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { AuthResult, OAuthProviderId, SignInPayload, SignUpPayload } from '../types';

// ---------------------------------------------------------------------------
// Profile sync (Firestore `users/{uid}`)
// ---------------------------------------------------------------------------

/**
 * Create or update a user's profile document in Firestore.
 * Called automatically after sign-up. Made idempotent so it can also be
 * invoked manually if the Firestore write fails (e.g. transient network error).
 */
export async function syncUserProfile(
  user: FirebaseUser,
  overrides?: Partial<UserProfile>,
): Promise<AuthResult<UserProfile>> {
  try {
    const ref = doc(db, COLLECTIONS.USERS, user.uid);
    const existing = await getDoc(ref);

    if (!existing.exists()) {
      const profile = { ...newUserProfileFromFirebase(user), ...overrides };
      await setDoc(ref, {
        ...profile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { success: true, data: profile };
    }

    const merged = {
      ...(existing.data() as UserProfile),
      ...overrides,
      updatedAt: Date.now(),
    };
    await updateDoc(ref, { ...overrides, updatedAt: serverTimestamp() });
    return { success: true, data: merged };
  } catch (err) {
    return {
      success: false,
      error: normalizeFirebaseError(err) as StudentOSFirebaseError,
    };
  }
}

/**
 * Read a user's profile from Firestore.
 * Returns null if the profile doesn't exist yet (first-time user).
 */
export async function getUserProfile(uid: string): Promise<AuthResult<UserProfile | null>> {
  try {
    const ref = doc(db, COLLECTIONS.USERS, uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: true, data: null };
    return { success: true, data: snap.data() as UserProfile };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) as StudentOSFirebaseError };
  }
}

// ---------------------------------------------------------------------------
// Auth operations
// ---------------------------------------------------------------------------

/**
 * Sign up with email/password and create the user's Firestore profile doc.
 * If Firestore write fails, the Auth user is still created — the profile
 * can be synced later via `syncUserProfile`.
 */
export async function signUp({
  email,
  password,
  displayName,
}: SignUpPayload): Promise<AuthResult<FirebaseUser>> {
  try {
    const cred: UserCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Set displayName on the Auth user.
    await firebaseUpdateProfile(cred.user, { displayName });

    // Create the Firestore profile doc.
    await syncUserProfile(cred.user, { displayName });

    // Send verification email (non-blocking).
    void sendEmailVerification(cred.user).catch(() => {
      // Verification email failure is non-fatal.
    });

    return { success: true, data: cred.user };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) as StudentOSFirebaseError };
  }
}

/** Sign in with email/password. Bumps `lastLogin` on the Firestore profile. */
export async function signIn({
  email,
  password,
}: SignInPayload): Promise<AuthResult<FirebaseUser>> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);

    // Bump `lastLogin` on the user's profile. Non-blocking — sign-in
    // succeeds even if this write fails (e.g. profile doc missing).
    void syncUserProfile(cred.user, { lastLogin: Date.now() }).catch(() => {
      // Profile sync failure is non-fatal during sign-in.
    });

    return { success: true, data: cred.user };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) as StudentOSFirebaseError };
  }
}

/**
 * Sign in with an OAuth provider (Google / Apple).
 * Uses popup-based sign-in. M2's UI will wire up the buttons.
 */
export async function signInWithOAuth(
  providerId: OAuthProviderId,
): Promise<AuthResult<FirebaseUser>> {
  try {
    const provider = getOAuthProvider(providerId);
    const cred = await signInWithPopup(auth, provider);

    // For first-time OAuth users, create the Firestore profile doc.
    // For returning users, bump `lastLogin`.
    await syncUserProfile(cred.user, { lastLogin: Date.now() });

    return { success: true, data: cred.user };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) as StudentOSFirebaseError };
  }
}

/** Sign out the current user. */
export async function signOut(): Promise<AuthResult<void>> {
  try {
    await firebaseSignOut(auth);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) as StudentOSFirebaseError };
  }
}

/** Send a password-reset email to the given address. */
export async function resetPassword(email: string): Promise<AuthResult<void>> {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) as StudentOSFirebaseError };
  }
}

/** Send a verification email to the currently signed-in user. */
export async function sendVerificationEmail(): Promise<AuthResult<void>> {
  try {
    if (!auth.currentUser) {
      return {
        success: false,
        error: {
          code: 'auth/no-current-user',
          message: 'No user is signed in.',
          field: 'general',
          service: 'auth',
        },
      };
    }
    await sendEmailVerification(auth.currentUser);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) as StudentOSFirebaseError };
  }
}

// ---------------------------------------------------------------------------
// OAuth provider configuration
// ---------------------------------------------------------------------------

/**
 * Get the appropriate OAuth provider instance for a given provider ID.
 * Used by M2's OAuth sign-in buttons. Returned here so the provider config
 * (scopes, custom params) is centralized.
 */
export function getOAuthProvider(providerId: OAuthProviderId): FirebaseAuthProvider {
  switch (providerId) {
    case 'google': {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      provider.setCustomParameters({ prompt: 'select_account' });
      return provider;
    }
    case 'apple': {
      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');
      return provider;
    }
    default: {
      const _exhaustive: never = providerId;
      throw new Error(`Unsupported OAuth provider: ${String(_exhaustive)}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Barrel
// ---------------------------------------------------------------------------

export const authService = {
  signUp,
  signIn,
  signInWithOAuth,
  signOut,
  resetPassword,
  sendVerificationEmail,
  syncUserProfile,
  getUserProfile,
  getOAuthProvider,
} as const;

export type AuthService = typeof authService;
