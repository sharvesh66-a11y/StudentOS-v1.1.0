'use client';

/**
 * StudentOS Planner — Countdown Widget + Revision Cards
 *
 * Shows upcoming exam countdowns and revision cards with spaced-repetition.
 */

import { useState } from 'react';
import { CalendarClock, RefreshCw, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { StudySession, Revision } from '../types';

export interface CountdownWidgetProps {
  sessions: StudySession[];
  revisions: Revision[];
  onCompleteRevision: (revisionId: string, confidence: number) => void;
}

export function CountdownWidget({ sessions, revisions, onCompleteRevision }: CountdownWidgetProps) {
  const [expandedRevisions, setExpandedRevisions] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  // Upcoming sessions (next 7 days, not breaks, not completed)
  const upcoming = sessions
    .filter((s) => !s.isBreak && s.status !== 'completed' && s.date >= today)
    .slice(0, 5);

  // Due revisions
  const dueRevisions = revisions.filter((r) => r.nextReviewDate <= today);
  const shownRevisions = expandedRevisions ? dueRevisions : dueRevisions.slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Upcoming sessions */}
      <div className="border-border bg-card/50 rounded-xl border p-5">
        <div className="mb-3 flex items-center gap-2">
          <CalendarClock className="text-primary h-4 w-4" />
          <h2 className="text-foreground text-sm font-semibold">Upcoming Sessions</h2>
        </div>

        {upcoming.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center text-xs">No upcoming sessions.</p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((s) => (
              <div
                key={s.id}
                className="border-border bg-background/50 flex items-center gap-3 rounded-lg border p-2.5"
              >
                <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold">
                  {new Date(s.date + 'T00:00:00').getDate()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate text-xs font-medium">{s.title}</p>
                  <p className="text-muted-foreground text-[10px]">
                    {s.startTime} · {s.subject}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Revision cards */}
      <div className="border-border bg-card/50 rounded-xl border p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="text-primary h-4 w-4" />
            <h2 className="text-foreground text-sm font-semibold">Revisions Due</h2>
          </div>
          {dueRevisions.length > 3 && (
            <button
              onClick={() => setExpandedRevisions(!expandedRevisions)}
              className="text-muted-foreground hover:text-primary text-xs"
              aria-label={expandedRevisions ? 'Collapse revisions' : 'Show all revisions'}
              aria-expanded={expandedRevisions}
            >
              {expandedRevisions ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {dueRevisions.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center text-xs">No revisions due. 🎉</p>
        ) : (
          <div className="space-y-2">
            {shownRevisions.map((rev) => (
              <div key={rev.id} className="border-border bg-background/50 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate text-sm font-medium">{rev.topic}</p>
                    <p className="text-muted-foreground text-xs">
                      {rev.subject} · Confidence: {rev.confidence}%
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 flex-1 text-xs"
                    onClick={() => onCompleteRevision(rev.id, Math.min(rev.confidence + 10, 100))}
                  >
                    Reviewed (+10%)
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive h-7 text-xs"
                    onClick={() => onCompleteRevision(rev.id, Math.max(rev.confidence - 10, 0))}
                  >
                    Need more practice
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
