/**
 * StudentOS Planner — Domain Types
 *
 * Core types for the Smart Study Planner: StudyPlan, StudySession, Reminder,
 * Goal, Revision, and schedule engine types.
 *
 * @see docs/DATABASE.md for the Firestore schema reference.
 */

// ---------------------------------------------------------------------------
// Plan types
// ---------------------------------------------------------------------------

/** Type of study plan. */
export type PlanType = 'daily' | 'weekly' | 'monthly' | 'custom';

/** Difficulty level for scheduling. */
export type ScheduleDifficulty = 'easy' | 'medium' | 'hard' | 'mixed';

/**
 * A study plan — the top-level container for a period of study.
 * Stored at `study_plans/{planId}`.
 */
export interface StudyPlan {
  id: string;
  uid: string;
  title: string;
  type: PlanType;
  /** ISO date string (yyyy-mm-dd) for the start of the plan period. */
  startDate: string;
  /** ISO date string (yyyy-mm-dd) for the end of the plan period. */
  endDate: string;
  /** Subjects covered by this plan. */
  subjects: string[];
  /** Difficulty-based scheduling preference. */
  difficulty: ScheduleDifficulty;
  /** Whether this plan was AI-generated. */
  aiGenerated: boolean;
  /** Whether the plan is active. */
  isActive: boolean;
  /** Total planned study minutes. */
  totalMinutes: number;
  /** Completed study minutes. */
  completedMinutes: number;
  createdAt: number;
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// Session types
// ---------------------------------------------------------------------------

/** Status of a study session. */
export type SessionStatus = 'scheduled' | 'in-progress' | 'completed' | 'missed' | 'skipped';

/**
 * A single study session — a time-blocked study period.
 * Stored at `study_sessions/{sessionId}`.
 */
export interface StudySession {
  id: string;
  uid: string;
  planId: string | null;
  title: string;
  subject: string;
  /** Chapter or topic being studied. */
  topic: string;
  /** ISO date string (yyyy-mm-dd). */
  date: string;
  /** Start time — HH:mm (24-hour). */
  startTime: string;
  /** End time — HH:mm (24-hour). */
  endTime: string;
  /** Duration in minutes. */
  durationMinutes: number;
  status: SessionStatus;
  /** Difficulty of this session's content. */
  difficulty: 'easy' | 'medium' | 'hard';
  /** Whether this is a revision session. */
  isRevision: boolean;
  /** Whether this is a break. */
  isBreak: boolean;
  /** Notes about the session. */
  notes: string | null;
  /** Focus mode was used. */
  focusModeUsed: boolean;
  createdAt: number;
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// Reminder types
// ---------------------------------------------------------------------------

/** Type of reminder. */
export type ReminderType = 'study' | 'exam' | 'break' | 'revision' | 'goal' | 'custom';

/**
 * A reminder — fires at a specific time.
 * Stored at `reminders/{reminderId}`.
 */
export interface Reminder {
  id: string;
  uid: string;
  title: string;
  message: string;
  type: ReminderType;
  /** ISO date-time string. */
  scheduledAt: string;
  /** Whether the reminder has been dismissed. */
  dismissed: boolean;
  /** Whether the reminder has been acted on. */
  completed: boolean;
  /** Related session ID (optional). */
  sessionId: string | null;
  createdAt: number;
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// Goal types
// ---------------------------------------------------------------------------

/** Type of goal. */
export type GoalType = 'daily' | 'weekly' | 'monthly' | 'exam' | 'subject' | 'custom';

/** Status of a goal. */
export type GoalStatus = 'active' | 'achieved' | 'abandoned';

/**
 * A study goal — trackable target.
 * Stored at `goals/{goalId}`.
 */
export interface Goal {
  id: string;
  uid: string;
  title: string;
  description: string;
  type: GoalType;
  status: GoalStatus;
  /** Current progress (0–100). */
  progress: number;
  /** Target value (e.g. "90%", "10 chapters"). */
  target: string;
  /** Related subject (optional). */
  subject: string | null;
  /** Target completion date (ISO date string). */
  targetDate: string | null;
  /** Whether this goal was AI-suggested. */
  aiSuggested: boolean;
  createdAt: number;
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// Revision types
// ---------------------------------------------------------------------------

/**
 * A revision entry — tracks spaced-repetition review of a topic.
 * Stored at `revisions/{revisionId}`.
 */
export interface Revision {
  id: string;
  uid: string;
  topic: string;
  subject: string;
  /** When this revision was last completed. */
  lastReviewed: string | null;
  /** When the next revision is due (ISO date string). */
  nextReviewDate: string;
  /** Revision interval in days (spaced repetition). */
  intervalDays: number;
  /** Number of times this topic has been reviewed. */
  reviewCount: number;
  /** Confidence level (0–100). */
  confidence: number;
  createdAt: number;
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// Schedule Engine types
// ---------------------------------------------------------------------------

/** Input to the schedule engine. */
export interface ScheduleEngineInput {
  /** Start date (ISO yyyy-mm-dd). */
  startDate: string;
  /** End date (ISO yyyy-mm-dd). */
  endDate: string;
  /** Available study time per day in minutes. */
  dailyAvailableMinutes: number;
  /** Preferred study start time (HH:mm). */
  preferredStartTime: string;
  /** Preferred study end time (HH:mm). */
  preferredEndTime: string;
  /** Break frequency in minutes. */
  breakFrequencyMinutes: number;
  /** Break duration in minutes. */
  breakDurationMinutes: number;
  /** Topics to schedule with priority + difficulty. */
  topics: ScheduleTopic[];
  /** Days of the week that are available (0=Sun, 6=Sat). */
  availableDays: number[];
}

/** A topic to schedule. */
export interface ScheduleTopic {
  topic: string;
  subject: string;
  /** Estimated minutes needed. */
  estimatedMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  /** Whether this is a revision session. */
  isRevision: boolean;
  /** Priority (1=highest). */
  priority: number;
}

/** Output from the schedule engine — a list of sessions. */
export interface ScheduleEngineOutput {
  sessions: Omit<
    StudySession,
    'id' | 'uid' | 'planId' | 'createdAt' | 'updatedAt' | 'status' | 'focusModeUsed' | 'notes'
  >[];
  /** Total scheduled minutes. */
  totalMinutes: number;
  /** Number of sessions. */
  sessionCount: number;
}

// ---------------------------------------------------------------------------
// Planner view types
// ---------------------------------------------------------------------------

export type PlannerView = 'calendar' | 'timeline' | 'today';
