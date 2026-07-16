'use client';

/**
 * StudentOS FullPageLoader
 *
 * A minimal loading screen shown while auth state resolves or during
 * route-guard redirects. Uses the StudentOS design system (dark theme,
 * purple/blue palette) — no business logic, no Firebase, no hooks.
 *
 * @see src/features/auth/components/protected-route.tsx
 */

import { Loader2 } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

export function FullPageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-background flex min-h-screen flex-col items-center justify-center gap-4 px-6"
    >
      <div className="flex items-center gap-3">
        <Loader2 className="text-primary h-5 w-5 animate-spin" aria-hidden="true" />
        <span className="text-muted-foreground text-sm font-medium">{label}</span>
      </div>
      <span className="text-muted-foreground/60 text-xs">{APP_NAME}</span>
    </div>
  );
}
