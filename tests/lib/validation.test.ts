/**
 * Unit tests for the pure validation helpers in `src/utils/validation.ts`.
 */
import { describe, it, expect } from 'vitest';
import {
  isNonEmptyString,
  isValidEmail,
  isValidUrl,
  isStrongPassword,
  isPositiveInteger,
  isInRange,
  clamp,
} from '@/utils/validation';

describe('isNonEmptyString', () => {
  it('returns true for a non-empty string', () => {
    expect(isNonEmptyString('hello')).toBe(true);
  });

  it('returns false for an empty string', () => {
    expect(isNonEmptyString('')).toBe(false);
  });

  it('returns false for a whitespace-only string', () => {
    expect(isNonEmptyString('   ')).toBe(false);
  });

  it('returns false for non-string types', () => {
    expect(isNonEmptyString(42)).toBe(false);
    expect(isNonEmptyString(null)).toBe(false);
    expect(isNonEmptyString(undefined)).toBe(false);
    expect(isNonEmptyString({})).toBe(false);
  });

  it('narrows the type (compile-time check)', () => {
    const v: unknown = 'x';
    if (isNonEmptyString(v)) {
      // v should be typed as string here.
      expect(v.toUpperCase()).toBe('X');
    }
  });
});

describe('isValidEmail', () => {
  it.each(['user@example.com', 'first.last+tag@sub.example.co.uk'])(
    'accepts valid email %s',
    (email) => {
      expect(isValidEmail(email)).toBe(true);
    },
  );

  it.each(['plainaddress', '@no-local.com', 'no-at-sign.com', 'spaces @example.com', ''])(
    'rejects invalid email %s',
    (email) => {
      expect(isValidEmail(email)).toBe(false);
    },
  );

  it('trims whitespace before validating', () => {
    expect(isValidEmail('  user@example.com  ')).toBe(true);
  });
});

describe('isValidUrl', () => {
  it.each(['http://example.com', 'https://example.com/path?q=1', 'https://sub.example.co.uk'])(
    'accepts valid URL %s',
    (url) => {
      expect(isValidUrl(url)).toBe(true);
    },
  );

  it.each(['ftp://example.com', 'example.com', 'not a url', ''])(
    'rejects invalid URL %s',
    (url) => {
      expect(isValidUrl(url)).toBe(false);
    },
  );
});

describe('isStrongPassword', () => {
  it.each(['Password1', 'abcdefg1', 'PASS1word', '   12abAB'])(
    'accepts strong password %s',
    (pw) => {
      expect(isStrongPassword(pw)).toBe(true);
    },
  );

  it.each(['short', 'allletters', '12345678', 'abcdefg', ''])('rejects weak password %s', (pw) => {
    expect(isStrongPassword(pw)).toBe(false);
  });
});

describe('isPositiveInteger', () => {
  it.each([1, 42, 9999])('returns true for positive integer %d', (n) => {
    expect(isPositiveInteger(n)).toBe(true);
  });

  it.each([0, -1, 1.5, Number.NaN, '1', null, undefined])(
    'returns false for non-positive-integer %s',
    (n) => {
      expect(isPositiveInteger(n)).toBe(false);
    },
  );
});

describe('isInRange', () => {
  it('returns true for values inside the range (inclusive)', () => {
    expect(isInRange(5, 1, 10)).toBe(true);
    expect(isInRange(1, 1, 10)).toBe(true);
    expect(isInRange(10, 1, 10)).toBe(true);
  });

  it('returns false for values outside the range', () => {
    expect(isInRange(0, 1, 10)).toBe(false);
    expect(isInRange(11, 1, 10)).toBe(false);
  });
});

describe('clamp', () => {
  it('returns the value when inside the range', () => {
    expect(clamp(5, 1, 10)).toBe(5);
  });

  it('clamps below the minimum', () => {
    expect(clamp(-3, 1, 10)).toBe(1);
  });

  it('clamps above the maximum', () => {
    expect(clamp(99, 1, 10)).toBe(10);
  });
});
