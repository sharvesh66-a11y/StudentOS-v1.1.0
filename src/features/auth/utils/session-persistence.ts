/**
 * StudentOS Session Persistence
 *
 * Wraps Firebase Auth's `setPersistence` API into a typed, app-aware
 * helper. Firebase supports three persistence strategies:
 *
 *   - `browserLocalPersistence`     — survives across browser restarts (default)
 *   - `browserSessionPersistence`   — cleared when the tab/window closes
 *   - `inMemoryPersistence`         — cleared on page reload (testing only)
 *
 * StudentOS defaults to `browserLocalPersistence` for the best UX. The
 * Settings module (M11) will expose a UI toggle to switch between local
 * and session persistence (e.g. "Remember me on this device" checkbox).
 *
 * @see https://firebase.google.com/docs/auth/web/auth-state-persistence
 */

import {
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence,
  type Persistence,
} from 'firebase/auth';
import { auth } from '@/firebase';
import { normalizeFirebaseError, type StudentOSFirebaseError } from '@/firebase';

/** Persistence strategy names — stringly-typed for UI binding. */
export type PersistenceStrategy = 'local' | 'session' | 'none';

/** Default strategy used by the AuthProvider on app boot. */
export const DEFAULT_PERSISTENCE: PersistenceStrategy = 'local';

export interface PersistenceResult {
  success: boolean;
  error?: StudentOSFirebaseError;
}

/**
 * In-memory tracking of the currently-active persistence strategy.
 * Firebase Auth doesn't expose the active persistence type after
 * `setPersistence`, so we track it ourselves for the Settings UI (M11).
 * On page reload, this resets to `DEFAULT_PERSISTENCE` until the
 * `AuthProvider` calls `setSessionPersistence` on mount.
 */
let currentPersistence: PersistenceStrategy = DEFAULT_PERSISTENCE;

/** Map strategy name → Firebase Persistence instance. */
function resolvePersistence(strategy: PersistenceStrategy): Persistence {
  switch (strategy) {
    case 'local':
      return browserLocalPersistence;
    case 'session':
      return browserSessionPersistence;
    case 'none':
      return inMemoryPersistence;
    default: {
      const _exhaustive: never = strategy;
      throw new Error(`Unknown persistence strategy: ${String(_exhaustive)}`);
    }
  }
}

/**
 * Set the Firebase Auth persistence strategy.
 *
 * Call this before sign-in (e.g. in the AuthProvider on mount, or in the
 * login form when "Remember me" is toggled).
 *
 * @example
 *   await setSessionPersistence('session'); // don't remember after tab close
 */
export async function setSessionPersistence(
  strategy: PersistenceStrategy = DEFAULT_PERSISTENCE,
): Promise<PersistenceResult> {
  try {
    await setPersistence(auth, resolvePersistence(strategy));
    currentPersistence = strategy;
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

/**
 * Read the current persistence strategy (in-memory tracked).
 * Useful for the Settings page (M11) to show the current state.
 */
export function getCurrentPersistence(): PersistenceStrategy {
  return currentPersistence;
}
