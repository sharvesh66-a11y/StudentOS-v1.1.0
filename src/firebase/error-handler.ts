/**
 * StudentOS Centralized Firebase Error Handler
 *
 * Normalizes errors from Firebase Auth, Firestore, and Storage into a single
 * `StudentOSFirebaseError` shape with:
 *   - `code`        — the original Firebase error code (e.g. `auth/email-already-in-use`)
 *   - `message`     — a human-friendly, production-safe message
 *   - `field`       — optional form-field tag for UI binding (email/password/general)
 *   - `service`     — which Firebase service raised the error (auth/firestore/storage)
 *   - `original`    — the raw error (dev only; stripped in production)
 *
 * Every service-layer function (auth, firestore helpers, storage helpers)
 * funnels through `normalizeFirebaseError` so the UI receives consistent
 * error shapes regardless of which Firebase service raised them.
 *
 * @see src/features/auth/services/auth.service.ts
 * @see src/firebase/firestore-helpers.ts
 * @see src/firebase/storage-helpers.ts
 */

/** Which Firebase service raised the error. */
export type FirebaseService = 'auth' | 'firestore' | 'storage' | 'unknown';

/** Form-field tag — used by the UI to bind errors to specific inputs. */
export type FirebaseErrorField = 'email' | 'password' | 'displayName' | 'file' | 'general';

/** Normalized error shape returned by every StudentOS Firebase service. */
export interface StudentOSFirebaseError {
  /** Original Firebase error code (e.g. `auth/email-already-in-use`). */
  code: string;
  /** Human-friendly, production-safe message. */
  message: string;
  /** Optional form-field tag for UI binding. */
  field?: FirebaseErrorField;
  /** Which Firebase service raised the error. */
  service: FirebaseService;
  /** Raw error (dev only — stripped in production). */
  original?: unknown;
}

// ---------------------------------------------------------------------------
// Error code → human message maps
// ---------------------------------------------------------------------------

const AUTH_ERROR_MAP: Record<string, { message: string; field?: FirebaseErrorField }> = {
  'auth/email-already-in-use': {
    message: 'An account with this email already exists.',
    field: 'email',
  },
  'auth/invalid-email': {
    message: 'Please enter a valid email address.',
    field: 'email',
  },
  'auth/operation-not-allowed': {
    message: 'Email/password sign-up is not enabled for this project.',
    field: 'general',
  },
  'auth/weak-password': {
    message: 'Password should be at least 8 characters with a letter and a number.',
    field: 'password',
  },
  'auth/user-disabled': {
    message: 'This account has been disabled.',
    field: 'general',
  },
  'auth/user-not-found': {
    message: 'No account found with this email.',
    field: 'email',
  },
  'auth/wrong-password': {
    message: 'Incorrect password. Please try again.',
    field: 'password',
  },
  'auth/invalid-credential': {
    message: 'Invalid email or password.',
    field: 'general',
  },
  'auth/too-many-requests': {
    message: 'Too many attempts. Please wait a few minutes and try again.',
    field: 'general',
  },
  'auth/network-request-failed': {
    message: 'Network error. Check your connection and try again.',
    field: 'general',
  },
  'auth/popup-closed-by-user': {
    message: 'Sign-in popup was closed before completing.',
    field: 'general',
  },
  'auth/cancelled-popup-request': {
    message: 'Sign-in was cancelled.',
    field: 'general',
  },
  'auth/popup-blocked': {
    message: 'Sign-in popup was blocked by the browser. Allow popups and try again.',
    field: 'general',
  },
  'auth/operation-not-supported-in-this-environment': {
    message: 'This operation is not supported in the current environment.',
    field: 'general',
  },
  'auth/unauthorized-domain': {
    message: 'This domain is not authorized for OAuth sign-in.',
    field: 'general',
  },
  'auth/requires-recent-login': {
    message: 'This operation requires recent sign-in. Please sign in again.',
    field: 'general',
  },
  'auth/no-current-user': {
    message: 'No user is signed in.',
    field: 'general',
  },
};

const FIRESTORE_ERROR_MAP: Record<string, { message: string; field?: FirebaseErrorField }> = {
  'permission-denied': {
    message: 'You do not have permission to perform this action.',
    field: 'general',
  },
  'not-found': {
    message: 'The requested document was not found.',
    field: 'general',
  },
  'already-exists': {
    message: 'This document already exists.',
    field: 'general',
  },
  'resource-exhausted': {
    message: 'Quota exceeded. Please try again later.',
    field: 'general',
  },
  'failed-precondition': {
    message: 'Operation failed. A required index may be missing.',
    field: 'general',
  },
  unavailable: {
    message: 'Service temporarily unavailable. Please try again.',
    field: 'general',
  },
  unauthenticated: {
    message: 'You must be signed in to perform this action.',
    field: 'general',
  },
  aborted: {
    message: 'Operation was aborted due to a conflict. Please retry.',
    field: 'general',
  },
  'invalid-argument': {
    message: 'Invalid data provided.',
    field: 'general',
  },
  'deadline-exceeded': {
    message: 'Operation timed out. Please try again.',
    field: 'general',
  },
};

const STORAGE_ERROR_MAP: Record<string, { message: string; field?: FirebaseErrorField }> = {
  'storage/object-not-found': {
    message: 'File not found.',
    field: 'file',
  },
  'storage/bucket-not-found': {
    message: 'Storage bucket not configured.',
    field: 'general',
  },
  'storage/quota-exceeded': {
    message: 'Storage quota exceeded.',
    field: 'general',
  },
  'storage/unauthorized': {
    message: 'You do not have permission to access this file.',
    field: 'file',
  },
  'storage/canceled': {
    message: 'Upload was cancelled.',
    field: 'file',
  },
  'storage/invalid-format': {
    message: 'File format is not supported.',
    field: 'file',
  },
  'storage/file-too-large': {
    message: 'File is too large. Maximum size is 10 MB.',
    field: 'file',
  },
};

// ---------------------------------------------------------------------------
// Normalizer
// ---------------------------------------------------------------------------

function detectService(err: unknown): FirebaseService {
  if (err instanceof Error) {
    const code = (err as { code?: string }).code ?? '';
    if (code.startsWith('auth/')) return 'auth';
    if (code.startsWith('storage/')) return 'storage';
    // Firestore errors don't always have a `storage/` or `auth/` prefix —
    // they use gRPC-style codes like `permission-denied`.
    if (code.startsWith('firestore/') || FIRESTORE_ERROR_MAP[code]) return 'firestore';
  }
  return 'unknown';
}

function pickMap(
  service: FirebaseService,
): Record<string, { message: string; field?: FirebaseErrorField }> {
  switch (service) {
    case 'auth':
      return AUTH_ERROR_MAP;
    case 'firestore':
      return FIRESTORE_ERROR_MAP;
    case 'storage':
      return STORAGE_ERROR_MAP;
    default:
      return {};
  }
}

/**
 * Normalize any thrown value into a `StudentOSFirebaseError`.
 *
 * Always returns a valid object — never throws. Safe to call in catch
 * blocks without further wrapping.
 */
export function normalizeFirebaseError(err: unknown): StudentOSFirebaseError {
  const service = detectService(err);

  if (err instanceof Error) {
    const code = (err as { code?: string }).code ?? `${service}/unknown`;
    const map = pickMap(service);
    const mapped = map[code];

    return {
      code,
      message: mapped?.message ?? err.message ?? 'An unexpected error occurred. Please try again.',
      field: mapped?.field ?? 'general',
      service,
      original: process.env.NODE_ENV === 'production' ? undefined : err,
    };
  }

  return {
    code: `${service}/unknown`,
    message: 'An unexpected error occurred. Please try again.',
    field: 'general',
    service,
    original: process.env.NODE_ENV === 'production' ? undefined : err,
  };
}

/**
 * Type guard — check if an unknown value is a `StudentOSFirebaseError`.
 */
export function isFirebaseError(err: unknown): err is StudentOSFirebaseError {
  return (
    typeof err === 'object' && err !== null && 'code' in err && 'message' in err && 'service' in err
  );
}
