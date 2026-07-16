'use client';

/**
 * StudentOS Planner — Timeline View
 *
 * Hourly timeline showing sessions for the selected day.
 */

import { Clock, Coffee, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StudySession, SessionStatus } from '../types';

export interface TimelineViewProps {
  sessions: StudySession[];
  onToggleStatus: (sessionId: string, status: SessionStatus) => void;
}

export function TimelineView({ sessions, onToggleStatus }: TimelineViewProps) {
  if (sessions.length === 0) {
    return (
      <div className="border-border bg-card/30 rounded-xl border border-dashed py-16 text-center">
        <Clock className="text-muted-foreground/40 mx-auto h-10 w-10" />
        <h3 className="text-foreground mt-3 text-sm font-semibold">No sessions for this day</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Select a different date or generate a plan.
        </p>
      </div>
    );
  }

  const sorted = [...sessions].sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="border-border bg-card/50 rounded-xl border p-5">
      <h2 className="text-foreground mb-4 text-lg font-semibold">Timeline</h2>

      <div className="relative space-y-2">
        {/* Vertical line */}
        <div className="bg-border absolute top-0 bottom-0 left-[20px] w-0.5" />

        {sorted.map((session) => (
          <div key={session.id} className="relative flex gap-4">
            {/* Time marker */}
            <div className="flex w-10 shrink-0 flex-col items-center pt-1">
              <div
                className={cn(
                  'z-10 flex h-5 w-5 items-center justify-center rounded-full border-2',
                  session.isBreak
                    ? 'border-muted-foreground bg-background'
                    : session.status === 'completed'
                      ? 'border-emerald-500 bg-emerald-500'
                      : 'border-primary bg-background',
                )}
              >
                {session.isBreak ? (
                  <Coffee className="text-muted-foreground h-2.5 w-2.5" />
                ) : session.status === 'completed' ? (
                  <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
                ) : (
                  <div className="bg-primary h-2 w-2 rounded-full" />
                )}
              </div>
            </div>

            {/* Session card */}
            <button
              onClick={() => {
                if (!session.isBreak) {
                  onToggleStatus(
                    session.id,
                    session.status === 'completed' ? 'scheduled' : 'completed',
                  );
                }
              }}
              disabled={session.isBreak}
              className={cn(
                'flex-1 rounded-lg border p-3 text-left transition-all',
                session.isBreak
                  ? 'border-border/50 bg-muted/10'
                  : session.status === 'completed'
                    ? 'border-emerald-500/20 bg-emerald-500/5 opacity-60'
                    : 'border-border bg-background/50 hover:border-primary/40',
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={cn(
                      'text-sm font-medium',
                      session.status === 'completed' && 'text-muted-foreground line-through',
                      !session.isBreak && session.status !== 'completed' && 'text-foreground',
                      session.isBreak && 'text-muted-foreground',
                    )}
                  >
                    {session.title}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {session.startTime}–{session.endTime} · {session.durationMinutes}min
                  </p>
                </div>
                {session.isRevision && !session.isBreak && (
                  <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-medium">
                    Revision
                  </span>
                )}
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
