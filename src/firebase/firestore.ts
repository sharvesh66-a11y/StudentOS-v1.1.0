/**
 * StudentOS Firestore Initialization
 *
 * Singleton `Firestore` instance for the client. Conditionally connects to
 * the local Firestore emulator when `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true`.
 *
 * @see src/firebase/app.ts for the app instance.
 * @see src/firebase/firestore-helpers.ts for reusable CRUD operations.
 * @see firestore.rules for security rules.
 * @see firestore.indexes.json for composite indexes.
 */

import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';
import { app } from './app';
import { EMULATOR_CONFIG } from './constants';

/** Cloud Firestore client (singleton). */
export const db: Firestore = getFirestore(app);

// Emulator wiring — dev only.
if (EMULATOR_CONFIG.enabled) {
  try {
    connectFirestoreEmulator(db, 'localhost', EMULATOR_CONFIG.firestorePort);
    if (process.env.NODE_ENV !== 'production') {
      console.info(
        `[StudentOS] Firestore emulator connected on port ${EMULATOR_CONFIG.firestorePort}.`,
      );
    }
  } catch (err) {
    console.warn('[StudentOS] Firestore emulator connection skipped:', err);
  }
}
