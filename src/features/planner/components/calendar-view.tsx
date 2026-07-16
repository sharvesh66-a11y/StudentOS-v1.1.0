'use client';

/**
 * StudentOS Planner — Calendar View
 *
 * Monthly calendar showing study sessions per day.
 */

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MONTHS, WEEKDAYS } from '../constants';
import type { StudySession } from '../types';

export interface CalendarViewProps {
  sessions: StudySession[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export function CalendarView({ sessions, selectedDate, onSelectDate }: CalendarViewProps) {
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date(selectedDate);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const today = new Date().toISOString().split('T')[0];

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (string | null)[] = [];

  // Empty cells before the 1st
  for (let i = 0; i < firstDay; i++) days.push(null);
  // Days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    days.push(dateStr);
  }

  const prevMonth = () => setViewMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setViewMonth(new Date(year, month + 1, 1));

  return (
    <div className="border-border bg-card/50 rounded-xl border p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-foreground text-lg font-semibold">
          {MONTHS[month]} {year}
        </h2>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={prevMonth}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={nextMonth}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Weekday header */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-muted-foreground text-center text-xs font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((dateStr, i) => {
          if (!dateStr) return <div key={i} className="min-h-[60px]" />;

          const daySessions = sessions.filter((s) => s.date === dateStr && !s.isBreak);
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === today;
          const hasSessions = daySessions.length > 0;

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={cn(
                'flex min-h-[60px] flex-col items-start rounded-lg border p-1.5 text-left transition-all',
                isSelected
                  ? 'border-primary bg-primary/10'
                  : isToday
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-border hover:bg-accent/50',
              )}
            >
              <span
                className={cn(
                  'text-xs font-medium',
                  isToday ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {parseInt(dateStr.split('-')[2], 10)}
              </span>
              {hasSessions && (
                <div className="mt-1 flex flex-wrap gap-0.5">
                  {daySessions.slice(0, 3).map((s) => (
                    <div
                      key={s.id}
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        s.status === 'completed' ? 'bg-emerald-500' : 'bg-primary',
                      )}
                    />
                  ))}
                  {daySessions.length > 3 && (
                    <span className="text-muted-foreground text-[10px]">
                      +{daySessions.length - 3}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
