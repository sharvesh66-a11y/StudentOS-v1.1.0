/**
 * StudentOS Password Strength Scoring
 *
 * Scores a password 0–4 based on length + character-class diversity.
 * Used by the signup form's `<PasswordStrength>` meter to give the user
 * real-time feedback before they submit.
 *
 * The scoring is intentionally heuristic — it does NOT replace Zod
 * validation (which enforces the hard 8-char/letter/number rule). It only
 * provides visual guidance.
 *
 * @see src/features/auth/components/password-strength.tsx
 */

export type PasswordStrengthLevel = 0 | 1 | 2 | 3 | 4;

export interface PasswordStrengthResult {
  level: PasswordStrengthLevel;
  /** 0–100 — used for the meter width. */
  score: number;
  label: string;
  /** Tailwind classes for the meter bar + label. */
  variant: 'danger' | 'warning' | 'success';
  suggestions: string[];
}

/** Check what character classes are present in the password. */
function countCharClasses(password: string): number {
  let count = 0;
  if (/[a-z]/.test(password)) count++;
  if (/[A-Z]/.test(password)) count++;
  if (/\d/.test(password)) count++;
  if (/[^A-Za-z0-9]/.test(password)) count++; // symbols
  return count;
}

/**
 * Score a password's strength on a 0–4 scale.
 *
 * - 0: empty / too short
 * - 1: weak (meets only one class, short)
 * - 2: fair (meets 2 classes, medium length)
 * - 3: good (meets 3+ classes, longer)
 * - 4: strong (meets 4 classes, 12+ chars)
 */
export function scorePassword(password: string): PasswordStrengthResult {
  if (!password) {
    return {
      level: 0,
      score: 0,
      label: 'Empty',
      variant: 'danger',
      suggestions: ['Start typing to see strength.'],
    };
  }

  const length = password.length;
  const classes = countCharClasses(password);

  let level: PasswordStrengthLevel;
  let label: string;
  let variant: PasswordStrengthResult['variant'];
  const suggestions: string[] = [];

  if (length < 8) {
    level = 1;
    label = 'Too short';
    variant = 'danger';
    suggestions.push('Use at least 8 characters.');
  } else if (length >= 12 && classes >= 4) {
    level = 4;
    label = 'Strong';
    variant = 'success';
  } else if (length >= 10 && classes >= 3) {
    level = 3;
    label = 'Good';
    variant = 'success';
  } else if (classes >= 2) {
    level = 2;
    label = 'Fair';
    variant = 'warning';
    suggestions.push('Add uppercase letters, numbers, or symbols.');
  } else {
    level = 1;
    label = 'Weak';
    variant = 'danger';
    suggestions.push('Mix letters, numbers, and symbols.');
  }

  if (!/[A-Z]/.test(password)) suggestions.push('Add an uppercase letter.');
  if (!/\d/.test(password)) suggestions.push('Add a number.');
  if (!/[^A-Za-z0-9]/.test(password)) suggestions.push('Add a symbol.');

  const score = (level / 4) * 100;

  return { level, score, label, variant, suggestions: suggestions.slice(0, 2) };
}
