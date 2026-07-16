/**
 * StudentOS Planner — Feature Barrel
 */

// Components
export { PlannerView } from './components/planner-view';
export { TodayTasks } from './components/today-tasks';
export { CalendarView } from './components/calendar-view';
export { TimelineView } from './components/timeline-view';
export { GoalsCard } from './components/goals-card';
export { CountdownWidget } from './components/countdown-widget';

// Services
export { plannerService } from './services/planner.service';
export { sessionService } from './services/session.service';
export { reminderService } from './services/reminder.service';
export { goalService } from './services/goal.service';
export { generateSchedule } from './services/schedule-engine';

// Hooks
export { usePlanner } from './hooks/use-planner';
export { useReminders } from './hooks/use-reminders';
export { useGoals } from './hooks/use-goals';

// Store
export { usePlannerStore } from './store/planner.store';

// Schemas
export {
  createPlanSchema,
  createGoalSchema,
  createReminderSchema,
  type CreatePlanValues,
  type CreateGoalValues,
  type CreateReminderValues,
} from './schemas/planner.schema';

// Types
export type {
  StudyPlan,
  StudySession,
  Reminder,
  Goal,
  Revision,
  PlanType,
  ScheduleDifficulty,
  SessionStatus,
  GoalType,
  GoalStatus,
  ReminderType,
  PlannerView as PlannerViewType,
  ScheduleEngineInput,
  ScheduleEngineOutput,
  ScheduleTopic,
} from './types';

// Constants
export {
  PLAN_TYPES,
  SCHEDULE_DIFFICULTIES,
  SESSION_STATUSES,
  GOAL_TYPES,
  GOAL_STATUSES,
  REMINDER_TYPES,
  PLANNER_VIEWS,
  DEFAULT_AVAILABLE_DAYS,
  DEFAULT_DAILY_MINUTES,
  WEEKDAYS,
  MONTHS,
} from './constants';
