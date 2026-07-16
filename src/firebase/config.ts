/**
 * StudentOS Firebase Client Configuration
 *
 * Pure config object built from `NEXT_PUBLIC_*` environment variables.
 * This file does NOT initialize anything — it only reads env vars and
 * validates them. Initialization lives in `app.ts`, `auth.ts`,
 * `firestore.ts`, and `storage.ts` respectively.
 *
 * All values here are safe to expose to the client (security is enforced
 * by Firestore/Storage rules, NOT by hiding these keys).
 *
 * @see .env.local.example for the env-var reference.
 */

// ---------------------------------------------------------------------------
// Required client env vars (build will warn if any are missing)
// ---------------------------------------------------------------------------

const REQUIRED_CLIENT_ENV_VARS = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
] as const;

function validateClientEnv(): void {
  if (process.env.NODE_ENV === 'production') {
    const missing = REQUIRED_CLIENT_ENV_VARS.filter((name) => !process.env[name]);
    if (missing.length > 0) {
      console.error(
        `[StudentOS] Missing required Firebase env vars: ${missing.join(', ')}. ` +
          `Copy .env.local.example to .env.local and fill in real values.`,
      );
    }
  } else {
    const missing = REQUIRED_CLIENT_ENV_VARS.filter((name) => !process.env[name]);
    if (missing.length > 0) {
      console.warn(
        `[StudentOS] Firebase env vars not set yet (${missing.join(', ')}). ` +
          `Firebase features will be disabled until .env.local is configured.`,
      );
    }
  }
}

validateClientEnv();

// ---------------------------------------------------------------------------
// Firebase config object (typed to match Firebase's `FirebaseOptions`)
// ---------------------------------------------------------------------------

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  /** Optional — only set if Google Analytics is enabled in the Firebase console. */
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
} as const;

/** True when all 6 required client env vars are present. */
export const isFirebaseConfigured = REQUIRED_CLIENT_ENV_VARS.every((name) =>
  Boolean(process.env[name]),
);
