/**
 * StudentOS Firebase Admin SDK Initialization
 *
 * SERVER-ONLY. This file MUST NEVER be imported from client code.
 * The `server-only` package throws a build-time error if it ever sneaks
 * into a client bundle.
 *
 * BUILD-SAFE: Initialization is lazy — `getAdminAuth()` etc. only initialize
 * on first call, not at import time. This prevents build-time crashes when
 * server env vars (FIREBASE_PRIVATE_KEY etc.) are not set during
 * prerendering. If credentials are missing, the functions return null
 * instead of throwing.
 *
 * @see docs/ARCHITECTURE.md §4 for data flow.
 */

import 'server-only';
import { initializeApp, getApps, cert, type App as AdminApp } from 'firebase-admin/app';
import { getAuth, type Auth as AdminAuth } from 'firebase-admin/auth';
import { getFirestore, type Firestore as AdminFirestore } from 'firebase-admin/firestore';
import { getStorage, type Storage as AdminStorage } from 'firebase-admin/storage';

// ---------------------------------------------------------------------------
// Admin credential (server-only env vars)
// ---------------------------------------------------------------------------

function buildAdminConfig() {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  return {
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  };
}

/** Whether the Admin SDK has the required credentials. */
export const isAdminConfigured: boolean = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY,
);

// ---------------------------------------------------------------------------
// Lazy admin app initialization
// ---------------------------------------------------------------------------

let _adminApp: AdminApp | null | undefined;

function getAdminApp(): AdminApp | null {
  if (_adminApp !== undefined) return _adminApp;

  const config = buildAdminConfig();
  if (!config) {
    _adminApp = null;
    return null;
  }

  _adminApp = getApps().find((a) => a.name === 'admin') ?? initializeApp(config, 'admin');
  return _adminApp;
}

/** Admin Auth — used for server-side token verification. Lazy-initialized. Returns null if not configured. */
export function getAdminAuth(): AdminAuth | null {
  const app = getAdminApp();
  return app ? getAuth(app) : null;
}

/** Admin Firestore — used for server-side queries. Lazy-initialized. Returns null if not configured. */
export function getAdminDb(): AdminFirestore | null {
  const app = getAdminApp();
  return app ? getFirestore(app) : null;
}

/** Admin Storage — used for server-side file operations. Lazy-initialized. Returns null if not configured. */
export function getAdminStorage(): AdminStorage | null {
  const app = getAdminApp();
  return app ? getStorage(app) : null;
}

// ---------------------------------------------------------------------------
// Backward-compatible exports (for existing code that imports `adminAuth` etc.)
// These are null-safe — code that uses them must check for null.
// ---------------------------------------------------------------------------

/** @deprecated Use `getAdminAuth()` instead. Null when not configured. */
export const adminAuth: AdminAuth | null = null;

/** @deprecated Use `getAdminDb()` instead. Null when not configured. */
export const adminDb: AdminFirestore | null = null;

/** @deprecated Use `getAdminStorage()` instead. Null when not configured. */
export const adminStorage: AdminStorage | null = null;

/** @deprecated Use `getAdminApp()` + named getters instead. */
export const admin = { adminAuth, adminDb, adminStorage } as const;
