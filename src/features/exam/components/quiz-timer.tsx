'use client';
/**
 * Quiz Timer — countdown display with visual indicator.
 */
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QuizTimerProps {
  secondsRemaining: number | null;
}

export function QuizTimer({ secondsRemaining }: QuizTimerProps) {
  if (secondsRemaining === null) return null;

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const isLow = secondsRemaining <= 60;
  const isCritical = secondsRemaining <= 30;

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-sm font-medium transition-colors',
        isCritical
          ? 'border-destructive bg-destructive/10 text-destructive'
          : isLow
            ? 'border-amber-500/40 bg-amber-500/10 text-amber-500'
            : 'border-border text-muted-foreground',
      )}
    >
      <Clock className="h-3.5 w-3.5" />
      {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </div>
  );
}
