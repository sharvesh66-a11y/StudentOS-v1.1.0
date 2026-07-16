'use client';

/**
 * StudentOS Auth Provider
 *
 * Mounts once at the app root (in `src/app/layout.tsx`). Owns the single
 * `onAuthStateChanged` subscription and exposes auth state + actions to
 * the entire React tree via `AuthContext`.
 *
 * Architecture:
 * - Subscribes to `onAuthStateChanged` on mount; unsubscribes on unmount.
 * - On auth state change, fetches the Firestore profile and updates the
 *   Zustand backing store (which the Context value mirrors).
 * - Exposes auth actions (`signUp`, `signIn`, `signOut`, etc.) from the
 *   `authService` — wrapped to clear errors on success.
 * - Initializes Firebase Auth session persistence on mount.
 *
 * Components consume auth via `useAuth()`:
 *   'use client';
 *   import { useAuth } from '@/features/auth';
 *   export function MyComponent() {
 *     const { user, isAuthenticated, isLoading } = useAuth();
 *     ...
 *   }
 *
 * @see src/features/auth/context/auth-context.ts
 * @see src/features/auth/hooks/use-auth.ts
 */

import { useEffect, useMemo, useState, useCallback } from 'react';
import { onAuthStateChanged, type Unsubscribe, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/firebase';
import type { StudentOSFirebaseError, UserProfile } from '@/firebase';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';
import { setSessionPersistence, DEFAULT_PERSISTENCE } from '../utils/session-persistence';
import { AuthContext, type AuthContextValue } from '../context/auth-context';
import type { AuthResult, OAuthProviderId, SignInPayload, SignUpPayload } from '../types';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Local state mirrors the Zustand store — kept in sync by the listener.
  // Using local state lets React batch context value updates properly.
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<StudentOSFirebaseError | null>(null);

  const isAuthenticated = Boolean(user);

  // -------------------------------------------------------------------------
  // Wire onAuthStateChanged — the single subscription for the entire app.
  // -------------------------------------------------------------------------
  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null;
    let cancelled = false;

    // Set default persistence before the listener fires.
    void setSessionPersistence(DEFAULT_PERSISTENCE);

    unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (cancelled) return;

        setIsLoading(true);
        setUser(firebaseUser);

        if (firebaseUser) {
          const result = await authService.getUserProfile(firebaseUser.uid);
          if (cancelled) return;

          if (result.success) {
            setProfile(result.data ?? null);
            setError(null);
          } else if (result.error) {
            setError(result.error);
            setProfile(null);
          }
        } else {
          setProfile(null);
          setError(null);
        }

        setIsLoading(false);
      },
      (err: Error) => {
        if (cancelled) return;
        const code = (err as { code?: string }).code ?? 'auth/listener-error';
        setError({
          code,
          message: err.message ?? 'Auth state listener failed.',
          field: 'general',
          service: 'auth',
        });
        setIsLoading(false);
      },
    );

    // Mirror to Zustand store for non-React access.
    const syncToStore = () => {
      const store = useAuthStore.getState();
      store.setUser(user);
      store.setProfile(profile);
      store.setLoading(isLoading);
      store.setError(error);
    };
    syncToStore();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
    // We intentionally don't depend on `user`/`profile`/etc — the listener
    // is registered exactly once.
  }, []);

  // Mirror local state → Zustand store whenever it changes.
  useEffect(() => {
    useAuthStore.getState().setUser(user);
  }, [user]);
  useEffect(() => {
    useAuthStore.getState().setProfile(profile);
  }, [profile]);
  useEffect(() => {
    useAuthStore.getState().setLoading(isLoading);
  }, [isLoading]);
  useEffect(() => {
    useAuthStore.getState().setError(error);
  }, [error]);

  // -------------------------------------------------------------------------
  // Action wrappers — clear error on success, set error on failure.
  // -------------------------------------------------------------------------

  const handleSignUp = useCallback(
    async (payload: SignUpPayload): Promise<AuthResult<FirebaseUser>> => {
      setError(null);
      const result = await authService.signUp(payload);
      if (!result.success && result.error) setError(result.error);
      return result;
    },
    [],
  );

  const handleSignIn = useCallback(
    async (payload: SignInPayload): Promise<AuthResult<FirebaseUser>> => {
      setError(null);
      const result = await authService.signIn(payload);
      if (!result.success && result.error) setError(result.error);
      return result;
    },
    [],
  );

  const handleSignInWithOAuth = useCallback(
    async (providerId: OAuthProviderId): Promise<AuthResult<FirebaseUser>> => {
      setError(null);
      const result = await authService.signInWithOAuth(providerId);
      if (!result.success && result.error) setError(result.error);
      return result;
    },
    [],
  );

  const handleSignOut = useCallback(async (): Promise<AuthResult<void>> => {
    setError(null);
    const result = await authService.signOut();
    if (result.success) {
      setUser(null);
      setProfile(null);
    } else if (result.error) {
      setError(result.error);
    }
    return result;
  }, []);

  const handleResetPassword = useCallback(async (email: string): Promise<AuthResult<void>> => {
    setError(null);
    const result = await authService.resetPassword(email);
    if (!result.success && result.error) setError(result.error);
    return result;
  }, []);

  const handleSendVerificationEmail = useCallback(async (): Promise<AuthResult<void>> => {
    setError(null);
    const result = await authService.sendVerificationEmail();
    if (!result.success && result.error) setError(result.error);
    return result;
  }, []);

  const handleRefreshProfile = useCallback(async (): Promise<AuthResult<UserProfile | null>> => {
    if (!user) {
      return { success: true, data: null };
    }
    const result = await authService.getUserProfile(user.uid);
    if (result.success) {
      setProfile(result.data ?? null);
    } else if (result.error) {
      setError(result.error);
    }
    return result;
  }, [user]);

  const handleClearError = useCallback(() => setError(null), []);

  // -------------------------------------------------------------------------
  // Memoized context value — prevents unnecessary re-renders.
  // -------------------------------------------------------------------------
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      isLoading,
      isAuthenticated,
      error,
      signUp: handleSignUp,
      signIn: handleSignIn,
      signInWithOAuth: handleSignInWithOAuth,
      signOut: handleSignOut,
      resetPassword: handleResetPassword,
      sendVerificationEmail: handleSendVerificationEmail,
      refreshProfile: handleRefreshProfile,
      clearError: handleClearError,
    }),
    [
      user,
      profile,
      isLoading,
      isAuthenticated,
      error,
      handleSignUp,
      handleSignIn,
      handleSignInWithOAuth,
      handleSignOut,
      handleResetPassword,
      handleSendVerificationEmail,
      handleRefreshProfile,
      handleClearError,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
