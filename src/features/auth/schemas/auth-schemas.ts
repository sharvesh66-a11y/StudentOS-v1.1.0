/**
 * StudentOS Auth Validation Schemas (Zod)
 *
 * Schemas shared between client forms and (future) server actions.
 * Importing these guarantees that validation rules are identical on
 * both sides — no drift.
 *
 * @see src/app/(auth)/login/page.tsx
 * @see src/app/(auth)/signup/page.tsx
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Field-level schemas (reused across forms)
// ---------------------------------------------------------------------------

/** Email — RFC-ish validation, normalized to lowercase. */
export const emailSchema = z
  .string()
  .min(1, 'Email is required.')
  .email('Please enter a valid email address.')
  .transform((v) => v.trim().toLowerCase());

/**
 * Password — at least 8 chars, 1 letter, 1 number.
 * Matches the rule surfaced in `auth/weak-password` Firebase error mapping.
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .regex(/[A-Za-z]/, 'Password must contain at least one letter.')
  .regex(/\d/, 'Password must contain at least one number.');

/** Display name — 2–50 chars, no leading/trailing whitespace. */
export const displayNameSchema = z
  .string()
  .min(2, 'Display name must be at least 2 characters.')
  .max(50, 'Display name must be at most 50 characters.')
  .transform((v) => v.trim());

// ---------------------------------------------------------------------------
// Form schemas
// ---------------------------------------------------------------------------

/** Login form schema. */
export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required.'),
  /** When true, switches persistence to `local` (default). */
  rememberMe: z.boolean(),
});

/** Signup form schema. */
export const signupFormSchema = z
  .object({
    displayName: displayNameSchema,
    email: emailSchema,
    password: passwordSchema,
    /** Mirror of `password` — must match exactly. */
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
    /** Required consent — must be true to sign up. */
    agreeToTerms: z.literal(true, {
      message: 'You must agree to the Terms to continue.',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

/** Password reset form schema. */
export const passwordResetFormSchema = z.object({
  email: emailSchema,
});

// ---------------------------------------------------------------------------
// Inferred TypeScript types (for use with React Hook Form)
// ---------------------------------------------------------------------------

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type SignupFormValues = z.infer<typeof signupFormSchema>;
export type PasswordResetFormValues = z.infer<typeof passwordResetFormSchema>;
