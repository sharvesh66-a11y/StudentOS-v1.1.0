'use client';

/**
 * Revision Timer Card
 *
 * Pomodoro-style timer for revision sessions. Start/pause/reset controls,
 * circular progress indicator. Default 25-minute work / 5-minute break cycle.
 */

import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type TimerMode = 'work' | 'break';
const WORK_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

export function RevisionTimer() {
  const [mode, setMode] = useState<TimerMode>('work');
  const [secondsLeft, setSecondsLeft] = useState(WORK_SECONDS);
  const [isRunning, setIsRunning] = useState(false);

  const totalSeconds = mode === 'work' ? WORK_SECONDS : BREAK_SECONDS;
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          // Switch mode
          const nextMode: TimerMode = mode === 'work' ? 'break' : 'work';
          setMode(nextMode);
          return nextMode === 'work' ? WORK_SECONDS : BREAK_SECONDS;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, mode]);

  const handleToggle = useCallback(() => setIsRunning((v) => !v), []);
  const handleReset = useCallback(() => {
    setIsRunning(false);
    setMode('work');
    setSecondsLeft(WORK_SECONDS);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-muted-foreground text-sm font-medium">Revision Timer</CardTitle>
        <Timer className="h-4 w-4 text-orange-400" />
      </CardHeader>
      <CardContent>
        {/* Mode toggle */}
        <div className="mb-4 flex justify-center gap-2">
          <Button
            size="sm"
            variant={mode === 'work' ? 'default' : 'outline'}
            onClick={() => {
              setMode('work');
              setSecondsLeft(WORK_SECONDS);
              setIsRunning(false);
            }}
          >
            Work (25m)
          </Button>
          <Button
            size="sm"
            variant={mode === 'break' ? 'default' : 'outline'}
            onClick={() => {
              setMode('break');
              setSecondsLeft(BREAK_SECONDS);
              setIsRunning(false);
            }}
          >
            Break (5m)
          </Button>
        </div>

        {/* Circular timer */}
        <div className="relative mx-auto h-32 w-32">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-muted/30"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#timer-grad)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className="transition-all duration-1000 ease-linear"
            />
            <defs>
              <linearGradient id="timer-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold tabular-nums">{timeStr}</span>
            <span
              className={cn(
                'text-[10px] tracking-wider uppercase',
                mode === 'work' ? 'text-purple-400' : 'text-green-400',
              )}
            >
              {mode}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-4 flex justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleToggle}
            aria-label={isRunning ? 'Pause' : 'Start'}
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button size="sm" variant="outline" onClick={handleReset} aria-label="Reset">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
