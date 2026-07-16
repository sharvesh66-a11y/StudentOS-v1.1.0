/**
 * StudentOS Firebase Storage Initialization
 *
 * Singleton `FirebaseStorage` instance for the client. Conditionally connects
 * to the local Storage emulator when `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true`.
 *
 * @see src/firebase/app.ts for the app instance.
 * @see src/firebase/storage-helpers.ts for upload utilities.
 * @see storage.rules for security rules.
 */

import { getStorage, connectStorageEmulator, type FirebaseStorage } from 'firebase/storage';
import { app } from './app';
import { EMULATOR_CONFIG } from './constants';

/** Firebase Storage client (singleton). */
export const storage: FirebaseStorage = getStorage(app);

// Emulator wiring — dev only.
if (EMULATOR_CONFIG.enabled) {
  try {
    connectStorageEmulator(storage, 'localhost', EMULATOR_CONFIG.storagePort);
    if (process.env.NODE_ENV !== 'production') {
      console.info(
        `[StudentOS] Firebase Storage emulator connected on port ${EMULATOR_CONFIG.storagePort}.`,
      );
    }
  } catch (err) {
    console.warn('[StudentOS] Firebase Storage emulator connection skipped:', err);
  }
}
