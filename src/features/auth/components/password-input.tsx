'use client';

/**
 * StudentOS Password Input
 *
 * Password input with show/hide toggle and optional strength meter.
 * Built on the shadcn/ui Input primitive for consistency with the rest
 * of the form. Accessible — toggle button has `aria-label` and the input
 * type switches between `password` and `text`.
 *
 * @see src/features/auth/components/password-strength.tsx
 */

import { forwardRef, useState, type ComponentProps } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { PasswordStrength } from './password-strength';

export interface PasswordInputProps extends ComponentProps<'input'> {
  /** When true, shows the strength meter below the input. */
  showStrengthMeter?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showStrengthMeter = false, value, ...props }, ref) => {
    const [isVisible, setIsVisible] = useState(false);
    const passwordValue = typeof value === 'string' ? value : '';

    return (
      <div className="space-y-2">
        <div className="relative">
          <Input
            ref={ref}
            type={isVisible ? 'text' : 'password'}
            className={cn('pr-10', className)}
            value={value}
            {...props}
          />
          <button
            type="button"
            onClick={() => setIsVisible((v) => !v)}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-background absolute top-0 right-0 flex h-full w-10 items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            aria-label={isVisible ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {showStrengthMeter && <PasswordStrength password={passwordValue} />}
      </div>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';
