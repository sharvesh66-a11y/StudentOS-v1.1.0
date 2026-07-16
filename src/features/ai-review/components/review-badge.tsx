'use client';

/**
 * Review Badge Component
 *
 * Displays the AI Review Engine's verdict and scores on a chat message.
 * Shows a compact badge by default; expands to show full scores on click.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShieldAlert, ShieldX, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ReviewBadgeProps {
  review: NonNullable<import('@/features/junova/types').ChatStreamChunk['review']>;
  className?: string;
}

const VERDICT_CONFIG = {
  approved: {
    icon: ShieldCheck,
    label: 'Reviewed',
    color: 'text-green-400',
    bg: 'border-green-500/30 bg-green-500/5',
  },
  'approved-with-enhancements': {
    icon: Sparkles,
    label: 'Enhanced',
    color: 'text-blue-400',
    bg: 'border-blue-500/30 bg-blue-500/5',
  },
  rewritten: {
    icon: ShieldAlert,
    label: 'Rewritten',
    color: 'text-yellow-400',
    bg: 'border-yellow-500/30 bg-yellow-500/5',
  },
  rejected: {
    icon: ShieldX,
    label: 'Blocked',
    color: 'text-red-400',
    bg: 'border-red-500/30 bg-red-500/5',
  },
} as const;

const SCORE_LABELS: Record<string, string> = {
  overallQuality: 'Overall Quality',
  accuracy: 'Accuracy',
  safety: 'Safety',
  childFriendly: 'Child-Friendly',
  boardExam: 'Board Exam',
  confidence: 'Confidence',
};

function scoreColor(score: number): string {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  return 'text-red-400';
}

function scoreBar(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
}

export function ReviewBadge({ review, className }: ReviewBadgeProps) {
  const [expanded, setExpanded] = useState(false);
  const config = VERDICT_CONFIG[review.verdict] ?? VERDICT_CONFIG.approved;
  const Icon = config.icon;

  const scores = review.scores;
  const scoreEntries = Object.entries(scores);

  return (
    <div className={cn('w-full', className)}>
      <button
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          'hover:bg-muted/30 flex w-full items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-colors',
          config.bg,
        )}
      >
        <Icon className={cn('h-3.5 w-3.5', config.color)} />
        <span className={cn('font-medium', config.color)}>{config.label}</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">
          Safety {scores.safety}/100 · Accuracy {scores.accuracy}/100
        </span>
        <span className="ml-auto">
          {expanded ? (
            <ChevronUp className="text-muted-foreground h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="text-muted-foreground h-3.5 w-3.5" />
          )}
        </span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-border/50 bg-card/30 mt-2 space-y-2 rounded-lg border p-3">
              <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                Review Engine Scores
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {scoreEntries.map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{SCORE_LABELS[key] ?? key}</span>
                      <span className={cn('font-medium tabular-nums', scoreColor(value))}>
                        {value}
                      </span>
                    </div>
                    <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                      <div
                        className={cn('h-full rounded-full transition-all', scoreBar(value))}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Issues */}
              {review.issues && review.issues.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                    Issues Found ({review.issues.length})
                  </p>
                  {review.issues.slice(0, 5).map((issue, i) => (
                    <div
                      key={i}
                      className="bg-muted/20 flex items-start gap-2 rounded-md p-2 text-xs"
                    >
                      <Badge
                        variant="outline"
                        className={cn(
                          'flex-shrink-0 text-[9px]',
                          issue.severity === 'critical' && 'border-red-500/30 text-red-500',
                          issue.severity === 'error' && 'border-orange-500/30 text-orange-500',
                          issue.severity === 'warning' && 'border-yellow-500/30 text-yellow-500',
                          issue.severity === 'info' && 'border-blue-500/30 text-blue-500',
                        )}
                      >
                        {issue.severity}
                      </Badge>
                      <div>
                        <p className="text-foreground/80">{issue.description}</p>
                        {issue.suggestedFix && (
                          <p className="text-muted-foreground mt-0.5 text-[10px]">
                            Fix: {issue.suggestedFix}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Review engine footer */}
              <div className="border-border/30 text-muted-foreground mt-2 flex items-center gap-1.5 border-t pt-2 text-[10px]">
                <ShieldCheck className="h-3 w-3" />
                <span>StudentOS AI Review Engine · 6 agents</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
