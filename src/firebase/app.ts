/**
 * StudentOS Firebase App Initialization
 *
 * The single Firebase App instance for the client. Uses `getApps()` guard
 * to avoid "Firebase App named '[DEFAULT]' already exists" errors during
 * Next.js HMR / dev hot reloads.
 *
 * BUILD-SAFE: When env vars are missing (e.g. during Vercel build-time
 * prerendering without .env.local), we initialize with placeholder values
 * instead of throwing. Firebase init doesn't validate the API key — it
 * only fails when an actual API call is made. This prevents the
 * `auth/invalid-api-key` error that crashes page data collection.
 *
 * Runtime calls will fail with a clear error if env vars are not set.
 *
 * @see src/firebase/config.ts for the config object.
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { firebaseConfig, isFirebaseConfigured } from './config';

/**
 * Whether Firebase has been properly configured with real env vars.
 * False when env vars are missing (e.g. during build without .env.local).
 */
export const isFirebaseReady: boolean = isFirebaseConfigured;

/**
 * Singleton Firebase App instance.
 *
 * `getApps().length > 0 ? getApp() : initializeApp(config)` is the canonical
 * HMR-safe pattern recommended by Firebase for Next.js / SSR frameworks.
 *
 * When env vars are missing, we initialize with placeholder values —
 * Firebase init doesn't validate, so this doesn't throw. Actual API calls
 * will fail at runtime with a clear error.
 */
const config = isFirebaseConfigured
  ? firebaseConfig
  : {
      apiKey: 'placeholder-api-key',
      authDomain: 'placeholder.firebaseapp.com',
      projectId: 'placeholder-project',
      storageBucket: 'placeholder.appspot.com',
      messagingSenderId: '000000000000',
      appId: '1:000000000000:web:0000000000000000000000',
    };

export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(config);
