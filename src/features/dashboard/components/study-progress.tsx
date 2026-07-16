'use client';

/**
 * StudentOS Dashboard — Study Progress
 *
 * Shows a weekly study-time chart and subject mastery overview. Since
 * progress data comes from module usage (Exam Center, Notes, etc.), this
 * shows a placeholder visualization for now.
 */

import { TrendingUp, BarChart3 } from 'lucide-react';

// Placeholder: 7 days of study minutes (all 0 until modules ship)
const WEEKLY_DATA = [
  { day: 'Mon', minutes: 0 },
  { day: 'Tue', minutes: 0 },
  { day: 'Wed', minutes: 0 },
  { day: 'Thu', minutes: 0 },
  { day: 'Fri', minutes: 0 },
  { day: 'Sat', minutes: 0 },
  { day: 'Sun', minutes: 0 },
];

const MAX_MINUTES = 120; // for bar scaling

export function StudyProgress() {
  const totalMinutes = WEEKLY_DATA.reduce((sum, d) => sum + d.minutes, 0);
  const hasData = totalMinutes > 0;

  return (
    <div className="border-border bg-card/50 rounded-xl border p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-primary h-4 w-4" />
          <h2 className="text-foreground text-sm font-semibold">Study Progress</h2>
        </div>
        <span className="text-muted-foreground text-xs">This week</span>
      </div>

      {/* Total */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-foreground text-2xl font-semibold">
            {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
          </span>
          <span className="text-muted-foreground text-xs">total study time</span>
        </div>
      </div>

      {/* Weekly bar chart */}
      <div className="flex h-32 items-end justify-between gap-2">
        {WEEKLY_DATA.map(({ day, minutes }) => {
          const heightPct = hasData ? Math.max((minutes / MAX_MINUTES) * 100, 4) : 4;
          return (
            <div key={day} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex w-full flex-1 items-end">
                <div
                  className="from-primary/40 to-primary w-full rounded-t-md bg-gradient-to-t transition-all duration-500"
                  style={{ height: `${heightPct}%` }}
                  aria-label={`${day}: ${minutes} minutes`}
                />
              </div>
              <span className="text-muted-foreground text-[10px] font-medium">{day}</span>
            </div>
          );
        })}
      </div>

      {!hasData && (
        <div className="border-border bg-background/30 mt-4 flex items-center gap-2 rounded-lg border border-dashed px-3 py-2">
          <BarChart3 className="text-muted-foreground/60 h-3.5 w-3.5" />
          <p className="text-muted-foreground text-xs">
            Your study time will populate here as you use modules.
          </p>
        </div>
      )}
    </div>
  );
}
