/**
 * StudentOS Firebase-specific TypeScript types.
 *
 * Cross-feature Firebase types live here. Feature-specific types stay in
 * `src/features/<feature>/types.ts`.
 *
 * @see src/types/index.ts for app-wide domain types.
 * @see docs/DATABASE.md for the full schema reference.
 */

import type { User as FirebaseUser } from 'firebase/auth';

/**
 * User roles — gates authorization decisions across the app.
 * Default role for new sign-ups is `student`.
 */
export type UserRole = 'student' | 'teacher' | 'admin';

/**
 * A sanitized StudentOS user profile (NOT the raw Firebase Auth user).
 * This is the shape we store in Firestore under `users/{uid}`.
 *
 * Schema reference: docs/DATABASE.md §2 (`users` collection).
 */
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;

  /** Server-set timestamps (millis since epoch). */
  createdAt: number;
  updatedAt: number;

  /** Authorization role — drives feature access. Default: `student`. */
  role: UserRole;

  /** True until the student finishes onboarding (Sprint 3). */
  onboardingComplete: boolean;

  /** Subjects the student is studying (e.g. ['Math', 'Physics']). */
  subjects: string[];

  /** Grade / year level (e.g. 'Grade 12', 'Undergrad Year 2'). */
  grade: string | null;

  /** Free-text learning goals ( surfaced in onboarding ). */
  goals: string | null;

  /** User-configurable preferences. */
  preferences: {
    theme: 'dark' | 'light';
    notifications: boolean;
  };

  /** Daily streak tracking (Gamification — M10). */
  streak: {
    current: number;
    longest: number;
    lastActiveDate: string | null; // ISO date (yyyy-mm-dd)
  };

  /** Gamification XP (M10). */
  xp: number;

  /** Gamification level — derived from XP (M10). */
  level: number;

  /** Timestamp (millis) of the user's most recent sign-in. */
  lastLogin: number | null;
}

/**
 * Convert a Firebase Auth user into a minimal StudentOS profile.
 * Used when creating a new user's Firestore doc on first sign-up.
 *
 * Field defaults follow the schema in docs/DATABASE.md §2.
 */
export const newUserProfileFromFirebase = (user: FirebaseUser): UserProfile => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  role: 'student',
  onboardingComplete: false,
  subjects: [],
  grade: null,
  goals: null,
  preferences: {
    theme: 'dark',
    notifications: true,
  },
  streak: {
    current: 0,
    longest: 0,
    lastActiveDate: null,
  },
  xp: 0,
  level: 1,
  lastLogin: Date.now(),
});

/** Standard shape for any timestamped Firestore document. */
export interface FirestoreDocument {
  id: string;
  createdAt: number;
  updatedAt: number;
}

/** Shape returned by service-layer functions that mutate Firestore. */
export interface FirestoreWriteResult<T = unknown> {
  success: boolean;
  id?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
