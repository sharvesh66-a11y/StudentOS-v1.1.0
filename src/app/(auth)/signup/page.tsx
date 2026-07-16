'use client';

/**
 * StudentOS Signup Page
 *
 * Email/password signup with display name, password strength meter,
 * confirm-password matching, terms consent, and OAuth buttons.
 *
 * On success, the user's Firestore profile doc is created by
 * `authService.signUp` (which calls `syncUserProfile`).
 *
 * The form is wrapped in <Suspense> because it uses `useSearchParams()`,
 * which Next.js 16 requires to be inside a Suspense boundary for static
 * prerendering.
 *
 * @see src/features/auth/schemas/auth-schemas.ts
 * @see src/features/auth/components/auth-form-card.tsx
 */

import { Suspense } from 'react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AuthFormCard } from '@/features/auth/components/auth-form-card';
import { AuthErrorAlert } from '@/features/auth/components/auth-error-alert';
import { PasswordInput } from '@/features/auth/components/password-input';
import { OAuthButtons } from '@/features/auth/components/oauth-buttons';
import { useAuth } from '@/features/auth';
import { signupFormSchema, type SignupFormValues } from '@/features/auth/schemas/auth-schemas';
import { getSafeRedirect } from '@/features/auth/utils/auth-redirect';

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp, clearError } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false as unknown as true,
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  // eslint-disable-next-line react-hooks/incompatible-library -- react-hook-form watch() is the standard API; safe to use
  const _password = watch('password');
  const agreeToTerms = watch('agreeToTerms');

  const onSubmit = async (values: SignupFormValues) => {
    setFormError(null);
    clearError();

    const result = await signUp({
      email: values.email,
      password: values.password,
      displayName: values.displayName,
    });

    if (result.success) {
      toast.success('Account created!', {
        description: 'A verification email is on its way. Welcome to StudentOS.',
      });
      const redirectTo = getSafeRedirect(searchParams);
      router.push(redirectTo);
      router.refresh();
    } else if (result.error) {
      setFormError(result.error.message);
      toast.error('Sign-up failed', { description: result.error.message });
    }
  };

  const handleOAuthSuccess = () => {
    setIsOAuthLoading(true);
    toast.success('Account created!', {
      description: 'You have been signed up via OAuth.',
    });
    const redirectTo = getSafeRedirect(searchParams);
    router.push(redirectTo);
    router.refresh();
  };

  const handleOAuthError = (message: string) => {
    setIsOAuthLoading(false);
    setFormError(message);
    toast.error('OAuth sign-up failed', { description: message });
  };

  return (
    <AuthFormCard
      title="Create your account"
      subtitle="Join StudentOS — one app for everything you learn."
      footer={
        <p>
          Already have an account?{' '}
          <a href="/login" className="text-primary font-medium underline-offset-4 hover:underline">
            Sign in
          </a>
        </p>
      }
    >
      {formError && <AuthErrorAlert message={formError} onDismiss={() => setFormError(null)} />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="displayName">Display name</Label>
          <Input
            id="displayName"
            type="text"
            autoComplete="name"
            placeholder="Ada Lovelace"
            aria-invalid={Boolean(errors.displayName)}
            aria-describedby={errors.displayName ? 'displayName-error' : undefined}
            {...register('displayName')}
          />
          {errors.displayName && (
            <p id="displayName-error" className="text-destructive text-xs">
              {errors.displayName.message}
            </p>
          )}
        </div>

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

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            showStrengthMeter
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password')}
          />
          {errors.password && (
            <p id="password-error" className="text-destructive text-xs">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p id="confirmPassword-error" className="text-destructive text-xs">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Checkbox
              id="agreeToTerms"
              className="mt-0.5"
              checked={agreeToTerms}
              onCheckedChange={(checked) => setValue('agreeToTerms', checked as true)}
            />
            <Label htmlFor="agreeToTerms" className="text-muted-foreground text-sm">
              I agree to the{' '}
              <a
                href="/terms"
                className="text-primary font-medium underline-offset-4 hover:underline"
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href="/privacy"
                className="text-primary font-medium underline-offset-4 hover:underline"
              >
                Privacy Policy
              </a>
              .
            </Label>
          </div>
          {errors.agreeToTerms && (
            <p className="text-destructive text-xs">{errors.agreeToTerms.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting || isOAuthLoading}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account…
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="border-border w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card text-muted-foreground px-2">or sign up with</span>
        </div>
      </div>

      <OAuthButtons onSuccess={handleOAuthSuccess} onError={handleOAuthError} />
    </AuthFormCard>
  );
}
