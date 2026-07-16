'use client';

/**
 * StudentOS Dashboard — Today's Study Overview
 *
 * Shows today's planned study time, tasks completed, and a mini schedule.
 * Since the Planner is folded into Dashboard + Junova AI (Sprint 4), this
 * shows an empty state for now with a clear call-to-action.
 */

import { Clock, CheckCircle2, Calendar, ArrowRight } from 'lucide-react';

export function TodayOverview() {
  // Placeholder data — will be wired to real planner data in Sprint 4
  const studyMinutesToday = 0;
  const tasksCompleted = 0;
  const tasksTotal = 0;

  const stats = [
    {
      icon: Clock,
      label: 'Study time today',
      value:
        studyMinutesToday > 0
          ? `${Math.floor(studyMinutesToday / 60)}h ${studyMinutesToday % 60}m`
          : '0m',
    },
    {
      icon: CheckCircle2,
      label: 'Tasks completed',
      value: `${tasksCompleted}/${tasksTotal}`,
    },
  ];

  return (
    <div className="border-border bg-card/50 rounded-xl border p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="text-primary h-4 w-4" />
          <h2 className="text-foreground text-sm font-semibold">Today&apos;s Overview</h2>
        </div>
        <button
          className="text-muted-foreground hover:text-primary flex items-center gap-1 text-xs transition-colors"
          disabled
        >
          View all
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="border-border bg-background/50 rounded-lg border p-3">
            <div className="flex items-center gap-1.5">
              <Icon className="text-muted-foreground h-3.5 w-3.5" />
              <span className="text-muted-foreground text-xs">{label}</span>
            </div>
            <div className="text-foreground mt-1 text-lg font-semibold">{value}</div>
          </div>
        ))}
      </div>

      {/* Empty state schedule */}
      <div className="border-border bg-background/30 mt-4 rounded-lg border border-dashed p-6 text-center">
        <Calendar className="text-muted-foreground/40 mx-auto h-8 w-8" />
        <p className="text-foreground mt-2 text-sm font-medium">No tasks scheduled for today</p>
        <p className="text-muted-foreground mt-1 text-xs">
          Junova AI will generate a personalized study plan for you in Sprint 4.
        </p>
      </div>
    </div>
  );
}
