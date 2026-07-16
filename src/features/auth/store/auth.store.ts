/**
 * StudentOS Auth Store (Zustand — internal backing store)
 *
 * Holds auth state client-side. This is an INTERNAL backing store used by
 * the `AuthProvider`. Components should consume auth state via the
 * `useAuth` hook (which reads from the AuthContext), NOT directly from
 * this store.
 *
 * Why both Zustand AND React Context?
 * - Zustand: enables access to auth state from non-React code (middleware,
 *   server actions, route guards). No re-render cost for components that
 *   don't subscribe.
 * - React Context: provides a clean React-idiomatic API surface and
 *   co-locates auth state with auth actions.
 *
 * The store is intentionally passive — it does NOT subscribe to
 * `onAuthStateChanged` itself. The `AuthProvider` is responsible for
 * wiring the listener and updating this store.
 *
 * @see src/features/auth/provider/auth-provider.tsx
 * @see src/features/auth/hooks/use-auth.ts
 */

import { create } from 'zustand';
import type { User as FirebaseUser } from 'firebase/auth';
import type { UserProfile, StudentOSFirebaseError } from '@/firebase';
import type { AuthState } from '../types';

interface AuthStore extends AuthState {
  // --- mutators (called by AuthProvider + service layer) ---
  setUser: (user: FirebaseUser | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: StudentOSFirebaseError | null) => void;
  reset: () => void;
}

const initialState: AuthState = {
  user: null,
  profile: null,
  isLoading: true, // true until first onAuthStateChanged fires
  error: null,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,

  setUser: (user) =>
    set((state) => ({
      user,
      isAuthenticated: Boolean(user),
    })),

  setProfile: (profile) =>
    set((state) => ({
      profile,
      isAuthenticated: Boolean(state.user),
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  reset: () => set({ ...initialState, isLoading: false }),
}));
