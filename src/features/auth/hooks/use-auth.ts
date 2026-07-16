'use client';

/**
 * StudentOS useAuth Hook
 *
 * Convenience hook that consumes the `AuthContext`. Throws a helpful error
 * if used outside an `<AuthProvider>` so misuse is caught early in dev.
 *
 * This hook does NOT subscribe to Firebase directly — the `AuthProvider`
 * owns the single `onAuthStateChanged` subscription. Multiple components
 * can call `useAuth()` without registering additional listeners.
 *
 * Usage:
 *   'use client';
 *   import { useAuth } from '@/features/auth';
 *
 *   export function Header() {
 *     const { user, isAuthenticated, isLoading, signOut } = useAuth();
 *     if (isLoading) return <Skeleton />;
 *     if (!isAuthenticated) return <LoginButton />;
 *     return <UserMenu user={user} onSignOut={signOut} />;
 *   }
 *
 * For non-React code (middleware, server actions), use the Zustand store
 * directly:
 *   import { useAuthStore } from '@/features/auth';
 *   const user = useAuthStore.getState().user;
 *
 * @see src/features/auth/provider/auth-provider.tsx
 * @see src/features/auth/context/auth-context.ts
 */

import { useContext } from 'react';
import { AuthContext, type AuthContextValue } from '../context/auth-context';

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      '[StudentOS] useAuth() must be used within an <AuthProvider>. ' +
        'Wrap your component tree with <AuthProvider> in src/app/layout.tsx.',
    );
  }
  return context;
}
