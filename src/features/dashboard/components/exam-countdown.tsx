'use client';

/**
 * Exam Countdown Card
 *
 * Shows days/hours/minutes until the next upcoming exam. Animated flip-style
 * counter with a gradient background.
 */

import { useEffect, useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Demo next exam date — in production this would come from Firestore
const NEXT_EXAM = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000); // 14 days 6 hours from now

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(target: Date): TimeLeft {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function ExamCountdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(NEXT_EXAM));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(NEXT_EXAM));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const units = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-muted-foreground text-sm font-medium">Exam Countdown</CardTitle>
        <CalendarClock className="h-4 w-4 text-red-400" />
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-3 text-xs">
          Mathematics Final · {NEXT_EXAM.toLocaleDateString()}
        </p>
        <div className="grid grid-cols-4 gap-2">
          {units.map((unit) => (
            <div
              key={unit.label}
              className="border-border/50 from-primary/10 to-secondary/10 rounded-lg border bg-gradient-to-br p-2 text-center"
            >
              <div className="text-foreground text-xl font-bold tabular-nums sm:text-2xl">
                {String(unit.value).padStart(2, '0')}
              </div>
              <div className="text-muted-foreground text-[9px] tracking-wider uppercase">
                {unit.label}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
