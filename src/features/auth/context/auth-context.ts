'use client';

/**
 * StudentOS Auth Context
 *
 * The React Context object that holds auth state + action handlers.
 * The `AuthProvider` component is the only place that assigns a value to
 * this context. Everywhere else consumes it via the `useAuth` hook.
 *
 * The context value type is exported as `AuthContextValue` so the
 * Provider implementation can be type-checked against it.
 *
 * @see src/features/auth/provider/auth-provider.tsx
 * @see src/features/auth/hooks/use-auth.ts
 */

import { createContext } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import type { UserProfile, StudentOSFirebaseError } from '@/firebase';
import type { SignInPayload, SignUpPayload, OAuthProviderId, AuthResult } from '../types';

/** The shape of the value provided by `AuthProvider`. */
export interface AuthContextValue {
  // --- state ---
  /** The Firebase user, or null when signed out. */
  user: FirebaseUser | null;
  /** The StudentOS profile from Firestore (loaded after auth resolves). */
  profile: UserProfile | null;
  /** True until `onAuthStateChanged` fires its first result. */
  isLoading: boolean;
  /** True if user is signed in AND profile is loaded. */
  isAuthenticated: boolean;
  /** Set when an auth operation fails. */
  error: StudentOSFirebaseError | null;

  // --- actions (return AuthResult envelopes) ---
  signUp: (payload: SignUpPayload) => Promise<AuthResult<FirebaseUser>>;
  signIn: (payload: SignInPayload) => Promise<AuthResult<FirebaseUser>>;
  signInWithOAuth: (providerId: OAuthProviderId) => Promise<AuthResult<FirebaseUser>>;
  signOut: () => Promise<AuthResult<void>>;
  resetPassword: (email: string) => Promise<AuthResult<void>>;
  sendVerificationEmail: () => Promise<AuthResult<void>>;
  refreshProfile: () => Promise<AuthResult<UserProfile | null>>;
  clearError: () => void;
}

/**
 * The Auth Context. Defaults to `undefined` so `useAuth` can detect
 * missing-provider misuse (calling the hook outside `<AuthProvider>`).
 */
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Display name for React DevTools. */
AuthContext.displayName = 'StudentOSAuthContext';
