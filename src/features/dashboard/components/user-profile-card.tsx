'use client';

/**
 * StudentOS Dashboard — User Profile Card
 *
 * Shows the student's avatar, name, email, level/XP progress bar, and
 * a link to Settings (wired up in Sprint 12). Reads real data from `useAuth()`.
 *
 * @see src/features/auth/hooks/use-auth.ts
 */

import { Pencil, Flame } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/features/auth';
import { getInitials } from '@/utils/format';

// XP needed for each level — simple formula: level * 100
function xpForLevel(level: number): number {
  return level * 100;
}

export function UserProfileCard() {
  const { user, profile } = useAuth();

  const displayName = profile?.displayName ?? user?.displayName ?? 'Student';
  const email = profile?.email ?? user?.email ?? '';
  const initials = getInitials(displayName) || '🎓';
  const level = profile?.level ?? 1;
  const xp = profile?.xp ?? 0;
  const streak = profile?.streak?.current ?? 0;

  const xpNeeded = xpForLevel(level);
  const xpProgress = Math.min((xp / xpNeeded) * 100, 100);

  return (
    <div className="border-border bg-card/50 rounded-xl border p-5 backdrop-blur-sm">
      {/* Avatar + name */}
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 text-primary ring-primary/20 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-semibold ring-2">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-foreground truncate font-semibold">{displayName}</p>
          <p className="text-muted-foreground truncate text-xs">{email}</p>
        </div>
      </div>

      {/* Level + XP */}
      <div className="mt-5 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground font-medium">Level {level}</span>
          <span className="text-muted-foreground text-xs">
            {xp} / {xpNeeded} XP
          </span>
        </div>
        <Progress value={xpProgress} className="h-2" />
        <p className="text-muted-foreground text-xs">
          {xpNeeded - xp} XP to Level {level + 1}
        </p>
      </div>

      {/* Streak */}
      <div className="border-border bg-background/50 mt-5 flex items-center justify-between rounded-lg border px-4 py-3">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-amber-500" />
          <span className="text-foreground text-sm font-medium">{streak} day streak</span>
        </div>
        <span className="text-muted-foreground text-xs">Keep it up!</span>
      </div>

      {/* Edit profile (links to settings — doesn't exist yet) */}
      <button
        className="border-border bg-background/50 text-foreground hover:bg-accent hover:text-accent-foreground mt-5 flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
        disabled
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit profile
      </button>
      <p className="text-muted-foreground/60 mt-1.5 text-center text-xs">
        Profile editing available in Sprint 12
      </p>
    </div>
  );
}
