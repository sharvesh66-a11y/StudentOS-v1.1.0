/**
 * StudentOS Firebase Auth Initialization
 *
 * Singleton `Auth` instance for the client. Conditionally connects to the
 * local Auth emulator when `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true`.
 *
 * @see src/firebase/app.ts for the app instance.
 * @see src/features/auth for the auth service + provider + hooks.
 */

import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import { app } from './app';
import { EMULATOR_CONFIG } from './constants';

/** Firebase Authentication client (singleton). */
export const auth: Auth = getAuth(app);

// Emulator wiring — dev only. Idempotent guard prevents noisy reconnects
// during Next.js HMR.
if (EMULATOR_CONFIG.enabled) {
  try {
    connectAuthEmulator(auth, `http://localhost:${EMULATOR_CONFIG.authPort}`, {
      disableWarnings: true,
    });
    if (process.env.NODE_ENV !== 'production') {
      console.info(
        `[StudentOS] Firebase Auth emulator connected on port ${EMULATOR_CONFIG.authPort}.`,
      );
    }
  } catch (err) {
    console.warn('[StudentOS] Firebase Auth emulator connection skipped:', err);
  }
}
