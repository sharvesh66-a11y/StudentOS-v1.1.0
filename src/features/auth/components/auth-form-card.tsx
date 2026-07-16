'use client';

/**
 * StudentOS Auth Form Card
 *
 * Shared card shell used by both /login and /signup pages. Provides:
 * - Centered max-width container
 * - Logo + heading + subheading
 * - Card body for form content
 * - Footer for cross-links (login↔signup, forgot password)
 *
 * Uses the approved StudentOS design language: dark card surface, subtle
 * border, ambient gradient backdrop handled by the (auth) layout.
 */

import { forwardRef, type ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';
import { cn } from '@/lib/utils';

export interface AuthFormCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export const AuthFormCard = forwardRef<HTMLDivElement, AuthFormCardProps>(
  ({ title, subtitle, children, footer, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'animate-scale-in border-border bg-card/80 shadow-primary/5 w-full max-w-md rounded-2xl border p-8 shadow-2xl backdrop-blur-xl',
          className,
        )}
      >
        {/* Header */}
        <div className="mb-8 space-y-3 text-center">
          <div className="bg-primary/10 ring-primary/20 mx-auto flex h-12 w-12 items-center justify-center rounded-xl ring-1">
            <Sparkles className="text-primary h-6 w-6" />
          </div>
          <div>
            <h1 className="text-foreground text-2xl font-semibold tracking-tight">{title}</h1>
            {subtitle && <p className="text-muted-foreground mt-1.5 text-sm">{subtitle}</p>}
          </div>
        </div>

        {/* Body */}
        <div className="space-y-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="border-border text-muted-foreground mt-6 border-t pt-6 text-center text-sm">
            {footer}
          </div>
        )}

        {/* Tiny branding */}
        <p className="text-muted-foreground/60 mt-6 text-center text-xs">
          {APP_NAME} · {APP_TAGLINE}
        </p>
      </div>
    );
  },
);

AuthFormCard.displayName = 'AuthFormCard';
