/**
 * StudentOS Planner — Constants
 *
 * Plan types, session statuses, goal types, reminder types, priorities.
 */

import type {
  PlanType,
  ScheduleDifficulty,
  SessionStatus,
  GoalType,
  GoalStatus,
  ReminderType,
  PlannerView,
} from './types';

export const PLAN_TYPES: { value: PlanType; label: string; description: string }[] = [
  { value: 'daily', label: 'Daily', description: 'Plan for a single day.' },
  { value: 'weekly', label: 'Weekly', description: 'Plan for a 7-day period.' },
  { value: 'monthly', label: 'Monthly', description: 'Plan for a 30-day period.' },
  { value: 'custom', label: 'Custom', description: 'Custom date range.' },
];

export const SCHEDULE_DIFFICULTIES: { value: ScheduleDifficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
  { value: 'mixed', label: 'Mixed' },
];

export const SESSION_STATUSES: Record<SessionStatus, { label: string; color: string }> = {
  scheduled: { label: 'Scheduled', color: 'text-muted-foreground' },
  'in-progress': { label: 'In Progress', color: 'text-primary' },
  completed: { label: 'Completed', color: 'text-emerald-500' },
  missed: { label: 'Missed', color: 'text-destructive' },
  skipped: { label: 'Skipped', color: 'text-amber-500' },
};

export const GOAL_TYPES: { value: GoalType; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'exam', label: 'Exam' },
  { value: 'subject', label: 'Subject' },
  { value: 'custom', label: 'Custom' },
];

export const GOAL_STATUSES: Record<GoalStatus, { label: string; color: string }> = {
  active: { label: 'Active', color: 'text-primary' },
  achieved: { label: 'Achieved', color: 'text-emerald-500' },
  abandoned: { label: 'Abandoned', color: 'text-muted-foreground' },
};

export const REMINDER_TYPES: Record<ReminderType, { label: string; icon: string }> = {
  study: { label: 'Study', icon: 'book-open' },
  exam: { label: 'Exam', icon: 'clipboard-list' },
  break: { label: 'Break', icon: 'coffee' },
  revision: { label: 'Revision', icon: 'refresh-cw' },
  goal: { label: 'Goal', icon: 'target' },
  custom: { label: 'Custom', icon: 'bell' },
};

export const PLANNER_VIEWS: { value: PlannerView; label: string; icon: string }[] = [
  { value: 'today', label: 'Today', icon: 'list' },
  { value: 'calendar', label: 'Calendar', icon: 'calendar' },
  { value: 'timeline', label: 'Timeline', icon: 'clock' },
];

/** Default available study days (Mon–Fri). */
export const DEFAULT_AVAILABLE_DAYS = [1, 2, 3, 4, 5];

/** Default daily available study time (minutes). */
export const DEFAULT_DAILY_MINUTES = 180; // 3 hours

/** Default break frequency (minutes). */
export const DEFAULT_BREAK_FREQUENCY = 50;

/** Default break duration (minutes). */
export const DEFAULT_BREAK_DURATION = 10;

/** Days of the week. */
export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

/** Month names. */
export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;
