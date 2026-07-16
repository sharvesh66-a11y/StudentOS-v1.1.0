/**
 * Validation Utilities
 *
 * Pure functions for validating user input.
 * For complex schemas use `zod` (already a project dependency) — these
 * helpers cover the common quick-check cases.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^https?:\/\/[^\s$.?#].[^\s]*$/i;

/** Check if a value is a non-empty string after trimming. */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/** Validate an email address. */
export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

/** Validate a URL (http/https). */
export function isValidUrl(value: string): boolean {
  return URL_REGEX.test(value.trim());
}

/** Validate password strength — at least 8 chars, 1 letter, 1 number. */
export function isStrongPassword(value: string): boolean {
  return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(value);
}

/** Check if a value is a positive integer. */
export function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

/** Check if a value is within an inclusive numeric range. */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/** Clamp a number to an inclusive range. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
