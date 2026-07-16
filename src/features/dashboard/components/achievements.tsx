'use client';

/**
 * Achievements Card
 *
 * Shows user's badges and achievements with a progress bar to next level.
 */

import { Trophy, Star, Flame, BookOpen, Target, Zap, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const ACHIEVEMENTS = [
  { icon: Flame, label: '7-Day Streak', earned: true, color: 'text-orange-400' },
  { icon: BookOpen, label: 'First Note', earned: true, color: 'text-blue-400' },
  { icon: Target, label: 'Goal Crusher', earned: true, color: 'text-green-400' },
  { icon: Star, label: 'Quiz Master', earned: true, color: 'text-yellow-400' },
  { icon: Zap, label: 'Speed Learner', earned: false, color: 'text-purple-400' },
  { icon: Crown, label: 'Top 10%', earned: false, color: 'text-violet-400' },
];

export function Achievements() {
  const earned = ACHIEVEMENTS.filter((a) => a.earned).length;
  const total = ACHIEVEMENTS.length;
  const progress = (earned / total) * 100;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-muted-foreground text-sm font-medium">Achievements</CardTitle>
        <Trophy className="h-4 w-4 text-yellow-400" />
      </CardHeader>
      <CardContent>
        {/* Progress */}
        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {earned} of {total} earned
            </span>
            <span className="text-primary font-medium">Level 4</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Badge grid */}
        <div className="grid grid-cols-3 gap-2">
          {ACHIEVEMENTS.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <div
                key={achievement.label}
                className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-center transition-all ${
                  achievement.earned
                    ? 'border-border/50 bg-card/40'
                    : 'border-border/20 bg-muted/20 opacity-40'
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${achievement.earned ? achievement.color : 'text-muted-foreground'}`}
                />
                <span className="text-muted-foreground text-[9px] leading-tight">
                  {achievement.label}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
