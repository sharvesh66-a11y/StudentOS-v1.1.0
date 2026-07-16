'use client';

/**
 * StudentOS Dashboard — Welcome Header
 *
 * Greets the user by name + time-of-day, shows the current date, and
 * surfaces quick stats (streak, XP, level). Reads real data from `useAuth()`.
 *
 * @see src/features/auth/hooks/use-auth.ts
 */

import { Sparkles, Flame, Zap, Star } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { APP_NAME } from '@/lib/constants';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());
}

export function WelcomeHeader() {
  const { user, profile } = useAuth();
  const displayName = profile?.displayName ?? user?.displayName ?? 'Student';
  const streak = profile?.streak?.current ?? 0;
  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? 1;

  const stats = [
    { icon: Flame, label: 'Day streak', value: streak, color: 'text-amber-500' },
    { icon: Zap, label: 'Total XP', value: xp, color: 'text-primary' },
    { icon: Star, label: 'Level', value: level, color: 'text-secondary' },
  ];

  return (
    <section className="animate-fade-up">
      <div className="flex flex-col gap-1">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Sparkles className="text-primary h-3.5 w-3.5" />
          <span>{APP_NAME}</span>
          <span className="text-muted-foreground/40">·</span>
          <span>{formatDate()}</span>
        </div>
        <h1 className="text-foreground mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          {getGreeting()}, <span className="text-primary">{displayName}</span>
        </h1>
        <p className="text-muted-foreground text-sm">
          Here&apos;s what&apos;s happening with your studies today.
        </p>
      </div>

      {/* Quick stats */}
      <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div
            key={label}
            className="border-border bg-card/50 rounded-xl border p-4 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${color}`} />
              <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                {label}
              </span>
            </div>
            <div className="text-foreground mt-1.5 text-2xl font-semibold">{value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
