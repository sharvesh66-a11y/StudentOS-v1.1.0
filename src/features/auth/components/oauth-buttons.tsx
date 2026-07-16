'use client';

/**
 * StudentOS OAuth Buttons
 *
 * Google + Apple sign-in buttons. The Apple button is hidden until Apple
 * Developer credentials are configured (the provider is wired up in
 * `authService.signInWithOAuth` but not yet enabled in the Firebase console).
 *
 * Each button shows a loading spinner while the OAuth popup is open and
 * surfaces errors via toast (handled by the parent form).
 */

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import type { OAuthProviderId } from '../types';
import { cn } from '@/lib/utils';

// Inline Google SVG (lucide-react doesn't include brand icons)
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

const _AppleIcon = AppleIcon; // referenced when Apple OAuth is re-enabled

interface OAuthButtonProps {
  provider: OAuthProviderId;
  label: string;
  icon: React.ReactNode;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

function OAuthButton({ provider, label, icon, onSuccess, onError }: OAuthButtonProps) {
  const { signInWithOAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    const result = await signInWithOAuth(provider);
    setIsLoading(false);

    if (result.success) {
      onSuccess?.();
    } else if (result.error) {
      onError?.(result.error.message);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        'border-border bg-card text-foreground flex w-full items-center justify-center gap-3 rounded-md border px-4 py-2.5 text-sm font-medium transition-all',
        'hover:bg-accent hover:text-accent-foreground',
        'focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
      )}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      <span>{isLoading ? 'Connecting…' : label}</span>
    </button>
  );
}

export function OAuthButtons({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (message: string) => void;
}) {
  return (
    <div className="space-y-3">
      <OAuthButton
        provider="google"
        label="Continue with Google"
        icon={<GoogleIcon />}
        onSuccess={onSuccess}
        onError={onError}
      />
      {/* Apple button — uncomment once Apple Developer credentials are configured.
      <OAuthButton
        provider="apple"
        label="Continue with Apple"
        icon={<AppleIcon />}
        onSuccess={onSuccess}
        onError={onError}
      />
      */}
    </div>
  );
}
