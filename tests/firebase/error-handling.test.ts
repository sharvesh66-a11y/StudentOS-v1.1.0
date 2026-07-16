/**
 * Unit tests for `src/firebase/error-handler.ts`.
 *
 * `normalizeFirebaseError` is a pure function — no Firestore/Auth calls.
 */
import { describe, it, expect } from 'vitest';
import {
  normalizeFirebaseError,
  isFirebaseError,
  type StudentOSFirebaseError,
} from '@/firebase/error-handler';

/** Helper: build an Error that looks like a Firebase error. */
function firebaseError(code: string, message?: string): Error {
  const err = new Error(message ?? code);
  (err as { code?: string }).code = code;
  return err;
}

describe('normalizeFirebaseError', () => {
  it('returns a valid StudentOSFirebaseError shape (never throws)', () => {
    const out = normalizeFirebaseError(new Error('boom'));
    expect(out).toMatchObject({
      code: expect.any(String),
      message: expect.any(String),
      service: expect.any(String),
    });
    expect(out.field).toBeDefined();
  });

  it('normalizes non-Error thrown values without throwing', () => {
    const out = normalizeFirebaseError('a plain string');
    expect(out.code).toBe('unknown/unknown');
    expect(out.message).toBe('An unexpected error occurred. Please try again.');
    expect(out.service).toBe('unknown');
  });

  it('normalizes null/undefined without throwing', () => {
    expect(normalizeFirebaseError(null).service).toBe('unknown');
    expect(normalizeFirebaseError(undefined).service).toBe('unknown');
  });

  describe('auth error mapping', () => {
    it('maps auth/email-already-in-use to a user-friendly message', () => {
      const out = normalizeFirebaseError(firebaseError('auth/email-already-in-use'));
      expect(out.service).toBe('auth');
      expect(out.field).toBe('email');
      expect(out.message).toBe('An account with this email already exists.');
    });

    it('maps auth/wrong-password to a password-field error', () => {
      const out = normalizeFirebaseError(firebaseError('auth/wrong-password'));
      expect(out.field).toBe('password');
      expect(out.message).toBe('Incorrect password. Please try again.');
    });

    it('maps auth/weak-password to the password rule message', () => {
      const out = normalizeFirebaseError(firebaseError('auth/weak-password'));
      expect(out.field).toBe('password');
      expect(out.message).toMatch(/at least 8 characters/);
    });

    it('maps auth/network-request-failed to a network message', () => {
      const out = normalizeFirebaseError(firebaseError('auth/network-request-failed'));
      expect(out.field).toBe('general');
      expect(out.message).toMatch(/Network error/);
    });

    it('maps auth/too-many-requests to a rate-limit message', () => {
      const out = normalizeFirebaseError(firebaseError('auth/too-many-requests'));
      expect(out.field).toBe('general');
      expect(out.message).toMatch(/Too many attempts/);
    });

    it('falls back to the raw Error.message for unknown auth codes', () => {
      const out = normalizeFirebaseError(firebaseError('auth/some-future-code', 'weird'));
      expect(out.service).toBe('auth');
      expect(out.code).toBe('auth/some-future-code');
      expect(out.message).toBe('weird');
    });
  });

  describe('firestore error mapping', () => {
    it('maps permission-denied', () => {
      const out = normalizeFirebaseError(firebaseError('permission-denied'));
      expect(out.service).toBe('firestore');
      expect(out.message).toMatch(/permission/);
    });

    it('maps not-found', () => {
      const out = normalizeFirebaseError(firebaseError('not-found'));
      expect(out.service).toBe('firestore');
      expect(out.message).toMatch(/not found/);
    });

    it('maps unavailable', () => {
      const out = normalizeFirebaseError(firebaseError('unavailable'));
      expect(out.service).toBe('firestore');
      expect(out.message).toMatch(/temporarily unavailable/);
    });

    it('maps failed-precondition to the index-missing hint', () => {
      const out = normalizeFirebaseError(firebaseError('failed-precondition'));
      expect(out.message).toMatch(/index may be missing/);
    });

    it('maps unauthenticated', () => {
      const out = normalizeFirebaseError(firebaseError('unauthenticated'));
      expect(out.message).toMatch(/signed in/);
    });
  });

  describe('storage error mapping', () => {
    it('maps storage/object-not-found', () => {
      const out = normalizeFirebaseError(firebaseError('storage/object-not-found'));
      expect(out.service).toBe('storage');
      expect(out.field).toBe('file');
      expect(out.message).toBe('File not found.');
    });

    it('maps storage/quota-exceeded', () => {
      const out = normalizeFirebaseError(firebaseError('storage/quota-exceeded'));
      expect(out.service).toBe('storage');
      expect(out.field).toBe('general');
    });

    it('maps storage/file-too-large with the 10 MB hint', () => {
      const out = normalizeFirebaseError(firebaseError('storage/file-too-large'));
      expect(out.field).toBe('file');
      expect(out.message).toMatch(/10 MB/);
    });
  });

  describe('original error passthrough', () => {
    it('keeps the original error in non-production', () => {
      const original = firebaseError('auth/invalid-email');
      const out = normalizeFirebaseError(original);
      // NODE_ENV is 'test' here — not 'production'.
      expect(out.original).toBe(original);
    });

    it('strips the original in production', () => {
      // `process.env.NODE_ENV` is typed as readonly in newer @types/node.
      // Use vi.stubEnv to safely override it for the duration of the test.
      const prev = process.env.NODE_ENV;
      vi.stubEnv('NODE_ENV', 'production');
      try {
        const out = normalizeFirebaseError(firebaseError('auth/invalid-email'));
        expect(out.original).toBeUndefined();
      } finally {
        vi.stubEnv('NODE_ENV', prev);
      }
    });
  });
});

describe('isFirebaseError type guard', () => {
  it('returns true for a valid StudentOSFirebaseError', () => {
    const err: StudentOSFirebaseError = {
      code: 'auth/x',
      message: 'msg',
      field: 'general',
      service: 'auth',
    };
    expect(isFirebaseError(err)).toBe(true);
  });

  it('returns false for plain Errors', () => {
    expect(isFirebaseError(new Error('boom'))).toBe(false);
  });

  it('returns false for null/undefined/primitives', () => {
    expect(isFirebaseError(null)).toBe(false);
    expect(isFirebaseError(undefined)).toBe(false);
    expect(isFirebaseError('string')).toBe(false);
    expect(isFirebaseError(42)).toBe(false);
  });

  it('returns false for objects missing required fields', () => {
    expect(isFirebaseError({ code: 'x', message: 'y' })).toBe(false);
    expect(isFirebaseError({})).toBe(false);
  });
});
