'use client';

/**
 * StudentOS Password Strength Meter
 *
 * Visual indicator shown below the password input on the signup form.
 * Updates in real-time as the user types. Uses the StudentOS purple/blue
 * palette — danger (red), warning (amber), success (green).
 *
 * @see src/features/auth/utils/password-strength.ts
 */

import { useMemo } from 'react';
import { scorePassword } from '../utils/password-strength';
import { cn } from '@/lib/utils';

export interface PasswordStrengthProps {
  password: string;
  className?: string;
}

const VARIANT_BAR: Record<string, string> = {
  danger: 'bg-destructive',
  warning: 'bg-amber-500',
  success: 'bg-primary',
};

const VARIANT_LABEL: Record<string, string> = {
  danger: 'text-destructive',
  warning: 'text-amber-500',
  success: 'text-primary',
};

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const result = useMemo(() => scorePassword(password), [password]);

  // Don't render anything until the user starts typing.
  if (!password) return null;

  return (
    <div className={cn('space-y-1.5', className)} aria-live="polite">
      <div className="flex items-center justify-between">
        <div className="flex gap-1" aria-hidden="true">
          {[1, 2, 3, 4].map((segment) => (
            <div
              key={segment}
              className={cn(
                'h-1 w-12 rounded-full transition-all duration-300',
                segment <= result.level ? VARIANT_BAR[result.variant] : 'bg-muted-foreground/20',
              )}
            />
          ))}
        </div>
        <span className={cn('text-xs font-medium', VARIANT_LABEL[result.variant])}>
          {result.label}
        </span>
      </div>
      {result.suggestions.length > 0 && (
        <p className="text-muted-foreground text-xs">{result.suggestions[0]}</p>
      )}
    </div>
  );
}
