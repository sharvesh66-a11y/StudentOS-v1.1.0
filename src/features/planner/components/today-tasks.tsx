'use client';

/**
 * StudentOS Planner — Today's Tasks
 *
 * Shows today's study sessions as a task list with status toggles.
 */

import { CheckCircle2, Circle, Clock, AlertCircle, Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SESSION_STATUSES } from '../constants';
import type { StudySession, SessionStatus } from '../types';

export interface TodayTasksProps {
  sessions: StudySession[];
  onToggleStatus: (sessionId: string, status: SessionStatus) => void;
}

export function TodayTasks({ sessions, onToggleStatus }: TodayTasksProps) {
  const studySessions = sessions.filter((s) => !s.isBreak);
  const completed = studySessions.filter((s) => s.status === 'completed').length;

  if (studySessions.length === 0) {
    return (
      <div className="border-border bg-card/30 rounded-xl border border-dashed py-16 text-center">
        <Clock className="text-muted-foreground/40 mx-auto h-10 w-10" />
        <h3 className="text-foreground mt-3 text-sm font-semibold">No sessions scheduled</h3>
        <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-sm">
          Click &quot;Generate AI Plan&quot; to create a personalized study schedule with Junova AI.
        </p>
      </div>
    );
  }

  const toggleStatus = (session: StudySession) => {
    if (session.status === 'completed') {
      onToggleStatus(session.id, 'scheduled');
    } else {
      onToggleStatus(session.id, 'completed');
    }
  };

  return (
    <div className="space-y-3">
      {/* Progress header */}
      <div className="border-border bg-card/50 flex items-center justify-between rounded-xl border p-4">
        <div>
          <p className="text-foreground text-sm font-medium">Today&apos;s Progress</p>
          <p className="text-muted-foreground text-xs">
            {completed} of {studySessions.length} sessions completed
          </p>
        </div>
        <div className="text-primary text-2xl font-semibold">
          {Math.round((completed / studySessions.length) * 100)}%
        </div>
      </div>

      {/* Task list */}
      {sessions.map((session) => (
        <div
          key={session.id}
          className={cn(
            'flex items-center gap-3 rounded-xl border p-4 transition-all',
            session.isBreak
              ? 'border-border/50 bg-muted/20'
              : session.status === 'completed'
                ? 'border-emerald-500/20 bg-emerald-500/5'
                : session.status === 'missed'
                  ? 'border-destructive/20 bg-destructive/5'
                  : 'border-border bg-card/50',
          )}
        >
          {/* Toggle button */}
          {session.isBreak ? (
            <Coffee className="text-muted-foreground h-5 w-5 shrink-0" />
          ) : session.status === 'completed' ? (
            <button onClick={() => toggleStatus(session)} aria-label="Mark as incomplete">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
            </button>
          ) : (
            <button onClick={() => toggleStatus(session)} aria-label="Mark as complete">
              <Circle className="text-muted-foreground hover:text-primary h-5 w-5 shrink-0" />
            </button>
          )}

          {/* Session info */}
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                'truncate text-sm font-medium',
                session.status === 'completed'
                  ? 'text-muted-foreground line-through'
                  : 'text-foreground',
              )}
            >
              {session.title}
            </p>
            <div className="text-muted-foreground mt-0.5 flex items-center gap-2 text-xs">
              <span>
                {session.startTime}–{session.endTime}
              </span>
              <span>·</span>
              <span>{session.subject}</span>
              {session.isRevision && (
                <>
                  <span>·</span>
                  <span className="text-primary">Revision</span>
                </>
              )}
            </div>
          </div>

          {/* Status badge */}
          {!session.isBreak && session.status !== 'scheduled' && session.status !== 'completed' && (
            <span
              className={cn(
                'flex items-center gap-1 text-xs font-medium',
                SESSION_STATUSES[session.status].color,
              )}
            >
              {session.status === 'missed' && <AlertCircle className="h-3 w-3" />}
              {SESSION_STATUSES[session.status].label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
