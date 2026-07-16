'use client';
/**
 * Question Navigator — grid of question numbers for quick navigation.
 */
import { cn } from '@/lib/utils';

export interface QuestionNavigatorProps {
  total: number;
  currentIndex: number;
  answeredIds: Set<number>;
  onNavigate: (index: number) => void;
}

export function QuestionNavigator({
  total,
  currentIndex,
  answeredIds,
  onNavigate,
}: QuestionNavigatorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          onClick={() => onNavigate(i)}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-medium transition-all',
            i === currentIndex
              ? 'border-primary bg-primary text-primary-foreground'
              : answeredIds.has(i)
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500'
                : 'border-border text-muted-foreground hover:bg-accent',
          )}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}
