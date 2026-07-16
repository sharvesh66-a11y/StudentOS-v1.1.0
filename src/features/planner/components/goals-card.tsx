'use client';

/**
 * StudentOS Planner — Goals Card
 *
 * Shows active goals with progress bars. Supports updating progress.
 */

import { Target, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { Goal } from '../types';

export interface GoalsCardProps {
  goals: Goal[];
  onUpdateProgress: (goalId: string, progress: number) => void;
}

export function GoalsCard({ goals, onUpdateProgress }: GoalsCardProps) {
  const activeGoals = goals.filter((g) => g.status === 'active');

  return (
    <div className="border-border bg-card/50 rounded-xl border p-5">
      <div className="mb-4 flex items-center gap-2">
        <Target className="text-primary h-4 w-4" />
        <h2 className="text-foreground text-sm font-semibold">Goals</h2>
      </div>

      {activeGoals.length === 0 ? (
        <div className="py-6 text-center">
          <Target className="text-muted-foreground/40 mx-auto h-8 w-8" />
          <p className="text-muted-foreground mt-2 text-xs">No active goals yet.</p>
          <p className="text-muted-foreground text-xs">Generate an AI plan to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeGoals.map((goal) => (
            <div key={goal.id}>
              <div className="mb-1.5 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate text-sm font-medium">{goal.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {goal.target} · {goal.type}
                  </p>
                </div>
                <span className="text-primary ml-2 text-xs font-semibold">{goal.progress}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={goal.progress}
                onChange={(e) => onUpdateProgress(goal.id, Number(e.target.value))}
                className="w-full"
                aria-label={`Progress for ${goal.title}`}
              />
              <Progress value={goal.progress} className="mt-1 h-1.5" />
              {goal.aiSuggested && (
                <span className="text-primary mt-1 inline-flex items-center gap-1 text-[10px]">
                  <TrendingUp className="h-2.5 w-2.5" />
                  AI suggested
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
