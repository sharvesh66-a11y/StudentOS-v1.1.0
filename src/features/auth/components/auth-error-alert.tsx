'use client';

/**
 * StudentOS Auth Error Alert
 *
 * Displays a form-level error (e.g. "Invalid email or password") in a
 * dismissible alert. Used at the top of /login and /signup forms when
 * the service layer returns an error.
 *
 * Uses the shadcn/ui Alert primitive with the `destructive` variant.
 */

import { AlertCircle, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

export interface AuthErrorAlertProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export function AuthErrorAlert({ message, onDismiss, className }: AuthErrorAlertProps) {
  if (!message) return null;

  return (
    <Alert variant="destructive" className={cn('animate-fade-in relative pr-9', className)}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-destructive/70 hover:text-destructive absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded transition-colors"
          aria-label="Dismiss error"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </Alert>
  );
}
