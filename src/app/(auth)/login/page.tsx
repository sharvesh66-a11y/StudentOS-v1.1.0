'use client';

/**
 * StudentOS Login Page
 *
 * Email/password login with form validation, OAuth buttons, "remember me"
 * persistence toggle, and toast notifications on success / error.
 *
 * Authenticated users are bounced to /dashboard via the route guard logic.
 *
 * The form is wrapped in <Suspense> because it uses `useSearchParams()`,
 * which Next.js 16 requires to be inside a Suspense boundary for static
 * prerendering (the boundary lets the page shell stream while the
 * searchParams promise resolves).
 *
 * @see src/features/auth/schemas/auth-schemas.ts
 * @see src/features/auth/components/auth-form-card.tsx
 */

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { loginFormSchema, type LoginFormValues } from '@/features/auth/schemas/auth-schemas';
import { setSessionPersistence } from '@/features/auth/utils/session-persistence';
import { getSafeRedirect } from '@/features/auth/utils/auth-redirect';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, clearError } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
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
  const rememberMe = watch('rememberMe');

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);
    clearError();

    // Toggle persistence based on "remember me" checkbox.
    await setSessionPersistence(values.rememberMe ? 'local' : 'session');

    const result = await signIn({
      email: values.email,
      password: values.password,
    });

    if (result.success) {
      toast.success('Welcome back!', {
        description: 'You have been signed in successfully.',
      });
      const redirectTo = getSafeRedirect(searchParams);
      router.push(redirectTo);
      router.refresh();
    } else if (result.error) {
      setFormError(result.error.message);
      toast.error('Sign-in failed', {
        description: result.error.message,
      });
    }
  };

  const handleOAuthSuccess = () => {
    setIsOAuthLoading(true);
    toast.success('Welcome back!', {
      description: 'You have been signed in via OAuth.',
    });
    const redirectTo = getSafeRedirect(searchParams);
    router.push(redirectTo);
    router.refresh();
  };

  const handleOAuthError = (message: string) => {
    setIsOAuthLoading(false);
    setFormError(message);
    toast.error('OAuth sign-in failed', { description: message });
  };

  return (
    <AuthFormCard
      title="Welcome back"
      subtitle="Sign in to continue to your StudentOS dashboard."
      footer={
        <p>
          Don&apos;t have an account?{' '}
          <a href="/signup" className="text-primary font-medium underline-offset-4 hover:underline">
            Sign up
          </a>
        </p>
      }
    >
      {/* Form-level error */}
      {formError && <AuthErrorAlert message={formError} onDismiss={() => setFormError(null)} />}

      {/* Email / password form */}
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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <a
              href="/forgot-password"
              className="text-muted-foreground hover:text-primary text-xs underline-offset-4 hover:underline"
            >
              Forgot password?
            </a>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="••••••••"
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

        <div className="flex items-center gap-2">
          <Checkbox
            id="rememberMe"
            checked={rememberMe}
            onCheckedChange={(checked) => setValue('rememberMe', checked === true)}
          />
          <Label htmlFor="rememberMe" className="text-muted-foreground text-sm">
            Keep me signed in on this device
          </Label>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting || isOAuthLoading}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="border-border w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card text-muted-foreground px-2">or continue with</span>
        </div>
      </div>

      {/* OAuth */}
      <OAuthButtons onSuccess={handleOAuthSuccess} onError={handleOAuthError} />
    </AuthFormCard>
  );
}
