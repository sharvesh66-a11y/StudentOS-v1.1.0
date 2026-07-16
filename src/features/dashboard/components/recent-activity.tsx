'use client';

/**
 * StudentOS Dashboard — Recent Activity
 *
 * Shows a feed of the student's recent actions across modules. Since no
 * modules are enabled yet, this shows an empty state with a clear
 * call-to-action.
 */

import { Activity, ArrowRight } from 'lucide-react';

export function RecentActivity() {
  // No activity yet — empty state
  const hasActivity = false;

  return (
    <div className="border-border bg-card/50 rounded-xl border p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="text-primary h-4 w-4" />
          <h2 className="text-foreground text-sm font-semibold">Recent Activity</h2>
        </div>
        <button
          className="text-muted-foreground hover:text-primary flex items-center gap-1 text-xs transition-colors"
          disabled
        >
          View all
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {hasActivity ? (
        <div className="space-y-3">{/* Activity items will go here once modules ship */}</div>
      ) : (
        <div className="border-border bg-background/30 rounded-lg border border-dashed py-10 text-center">
          <Activity className="text-muted-foreground/40 mx-auto h-8 w-8" />
          <p className="text-foreground mt-2 text-sm font-medium">No activity yet</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Your recent actions across modules will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
