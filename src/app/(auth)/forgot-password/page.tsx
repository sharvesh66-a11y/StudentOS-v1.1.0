'use client';

/**
 * StudentOS Forgot Password Page
 *
 * Email-only form that sends a Firebase password-reset link. After submit,
 * shows a success state confirming the email was sent (regardless of whether
 * the email exists — Firebase intentionally doesn't reveal account existence
 * for security).
 *
 * Uses the existing `passwordResetFormSchema` and `authService.resetPassword()`.
 *
 * @see src/features/auth/schemas/auth-schemas.ts
 * @see src/features/auth/services/auth.service.ts
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Loader2, MailCheck, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthFormCard } from '@/features/auth/components/auth-form-card';
import { AuthErrorAlert } from '@/features/auth/components/auth-error-alert';
import { useAuth } from '@/features/auth';
import {
  passwordResetFormSchema,
  type PasswordResetFormValues,
} from '@/features/auth/schemas/auth-schemas';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [sentEmail, setSentEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordResetFormValues>({
    resolver: zodResolver(passwordResetFormSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: PasswordResetFormValues) => {
    setFormError(null);

    const result = await resetPassword(values.email);

    if (result.success) {
      // Firebase intentionally doesn't reveal whether the email exists.
      // Show the same success message either way for security.
      setSentEmail(values.email);
      toast.success('Reset link sent', {
        description: `Check ${values.email} for a password reset link.`,
      });
    } else if (result.error) {
      setFormError(result.error.message);
      toast.error('Reset failed', { description: result.error.message });
    }
  };

  // --- Success state ---
  if (sentEmail) {
    return (
      <AuthFormCard
        title="Check your email"
        subtitle="We've sent a password reset link to your inbox."
        footer={
          <p>
            Remembered your password?{' '}
            <a
              href="/login"
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              Back to sign in
            </a>
          </p>
        }
      >
        <div className="space-y-6 text-center">
          <div className="bg-primary/10 ring-primary/20 mx-auto flex h-14 w-14 items-center justify-center rounded-full ring-1">
            <MailCheck className="text-primary h-7 w-7" />
          </div>

          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">A password reset link has been sent to:</p>
            <p className="text-foreground font-medium">{sentEmail}</p>
          </div>

          <div className="border-border bg-background/50 rounded-lg border p-4 text-left">
            <p className="text-muted-foreground text-xs leading-relaxed">
              <strong className="text-foreground">Didn&apos;t get the email?</strong> Check your
              spam folder, or wait a few minutes and try again. The link will expire in 1 hour for
              security.
            </p>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setSentEmail(null);
            }}
          >
            <Link className="mr-2 h-4 w-4" />
            Try a different email
          </Button>
        </div>
      </AuthFormCard>
    );
  }

  // --- Form state ---
  return (
    <AuthFormCard
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <p>
          Remembered your password?{' '}
          <a
            href="/login"
            className="text-primary inline-flex items-center gap-1 font-medium underline-offset-4 hover:underline"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to sign in
          </a>
        </p>
      }
    >
      {formError && <AuthErrorAlert message={formError} onDismiss={() => setFormError(null)} />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
          />
          {errors.email && (
            <p id="email-error" className="text-destructive text-xs">
              {errors.email.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending reset link…
            </>
          ) : (
            'Send reset link'
          )}
        </Button>
      </form>

      <p className="text-muted-foreground text-center text-xs">
        We&apos;ll send a password reset link to this email address. The link expires in 1 hour.
      </p>
    </AuthFormCard>
  );
}
