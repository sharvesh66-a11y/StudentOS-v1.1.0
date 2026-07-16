/**
 * StudentOS Firebase Constants
 *
 * Canonical Firestore collection paths and Storage paths.
 *
 * Rules:
 * - Import collection names from here ONLY — never hardcode strings.
 * - Keep this file in sync with `firestore.rules` and `firestore.indexes.json`.
 * - When adding a collection, also add the matching security rule.
 *
 * @see docs/DATABASE.md for the full schema reference.
 */

// ---------------------------------------------------------------------------
// Firestore collection paths (top-level)
// ---------------------------------------------------------------------------

export const COLLECTIONS = {
  /** User profiles — one doc per Firebase Auth user, keyed by uid. */
  USERS: 'users',
  /** AI Teacher profiles (Junova AI — Sprint 4.1). */
  JUNOVA_TEACHERS: 'junova_teachers',
  /** Junova AI conversation threads — top-level per user. */
  JUNOVA_CONVERSATIONS: 'junova_conversations',
  /** Long-term memory per user (Junova AI — Sprint 4.4). */
  JUNOVA_MEMORY: 'junova_memory',
  /** AI-generated recommendations per user (Junova AI — Sprint 4.4). */
  JUNOVA_RECOMMENDATIONS: 'junova_recommendations',
  /** Voice preferences per user (Junova AI — Sprint 4.5). */
  JUNOVA_VOICE_PREFERENCES: 'junova_voice_preferences',
  /** Live session settings per user (Junova AI — Sprint 4.5). */
  JUNOVA_LIVE_SESSIONS: 'junova_live_sessions',
  /** Exam Center quizzes (Sprint 5.1). */
  EXAM_QUIZZES: 'exam_quizzes',
  /** Quiz attempts (Sprint 5.1). */
  QUIZ_ATTEMPTS: 'quiz_attempts',
  /** Saved question bank (Sprint 5.1). */
  QUESTION_BANK: 'question_bank',
  /** Practice sessions (Phase 5 — AI Practice). */
  PRACTICE_SESSIONS: 'practice_sessions',
  /** Mistake analysis per user (Phase 5). */
  MISTAKE_ANALYSIS: 'mistake_analysis',
  /** Daily practice tracking (Phase 5). */
  DAILY_PRACTICE: 'daily_practice',
  /** Study plans (Planner — Phase 4). */
  STUDY_PLANS: 'study_plans',
  /** Study sessions — individual time-blocked study periods (Planner — Phase 4). */
  STUDY_SESSIONS: 'study_sessions',
  /** Reminders — scheduled notifications (Planner — Phase 4). */
  REMINDERS: 'reminders',
  /** Goals — trackable study targets (Planner — Phase 4). */
  GOALS: 'goals',
  /** Revisions — spaced-repetition entries (Planner — Phase 4). */
  REVISIONS: 'revisions',
  /** Student notes (Notes Hub — Phase 6). */
  NOTES: 'notes',
  /** Note folder hierarchy (Notes Hub — Phase 6). */
  NOTE_FOLDERS: 'note_folders',
  /** Doubt history (Notes Hub — Phase 6). */
  DOUBT_HISTORY: 'doubt_history',
  /** Study plans (Planner — M5). */
  PLANS: 'plans',
  /** Daily/weekly progress snapshots (Progress — Phase 7). */
  PROGRESS_SNAPSHOTS: 'progress_snapshots',
  /** Gamification achievement unlocks (Phase 7). */
  ACHIEVEMENTS: 'achievements',
  /** XP history entries (Phase 7). */
  XP_HISTORY: 'xp_history',
  /** Daily streak data per user (Phase 7). */
  DAILY_STREAK: 'daily_streak',
  /** Weekly/daily challenges (Phase 7). */
  CHALLENGES: 'challenges',
  /** User badges (Phase 7). */
  BADGES: 'badges',
  /** Daily analytics per user (Phase 7). */
  ANALYTICS: 'analytics',
  /** AI tools usage history (Phase 8). */
  TOOL_USAGE: 'tool_usage',
  /** User subscriptions (Phase 8). */
  SUBSCRIPTIONS: 'subscriptions',
  /** User settings (Phase 8). */
  USER_SETTINGS: 'user_settings',
  /** Study groups (Sprint 7). */
  STUDY_GROUPS: 'study_groups',
  /** Group members (Sprint 7). */
  GROUP_MEMBERS: 'group_members',
  /** Group messages (Sprint 7). */
  GROUP_MESSAGES: 'group_messages',
  /** Group study sessions (Sprint 7). */
  GROUP_SESSIONS: 'group_sessions',
  /** Group shared files (Sprint 7). */
  GROUP_FILES: 'group_files',
  /** Group notifications (Sprint 7). */
  GROUP_NOTIFICATIONS: 'group_notifications',
  /** Career profiles library (Sprint 8). */
  CAREER_PROFILES: 'career_profiles',
  /** Career goals (Sprint 8). */
  CAREER_GOALS: 'career_goals',
  /** Career progress timeline (Sprint 8). */
  CAREER_PROGRESS: 'career_progress',
  /** Career AI recommendations (Sprint 8). */
  CAREER_RECOMMENDATIONS: 'career_recommendations',
  /** Career skill tracker (Sprint 8). */
  CAREER_SKILLS: 'career_skills',
  /** Career college planning (Sprint 8). */
  CAREER_COLLEGES: 'career_colleges',
  /** Scholarships library (Sprint 9). */
  SCHOLARSHIPS: 'scholarships',
  /** Student saved/applied scholarships (Sprint 9). */
  STUDENT_SCHOLARSHIPS: 'student_scholarships',
  /** Student scholarship profile (Sprint 9). */
  SCHOLARSHIP_PROFILES: 'scholarship_profiles',
  /** Scholarship AI recommendations (Sprint 9). */
  SCHOLARSHIP_RECOMMENDATIONS: 'scholarship_recommendations',
  /** Scholarship notifications (Sprint 9). */
  SCHOLARSHIP_NOTIFICATIONS: 'scholarship_notifications',
  /** Freelance student profiles (Sprint 10). */
  FREELANCE_PROFILES: 'freelance_profiles',
  /** Freelance jobs (Sprint 10). */
  FREELANCE_JOBS: 'freelance_jobs',
  /** Job applications (Sprint 10). */
  JOB_APPLICATIONS: 'job_applications',
  /** Freelance projects (Sprint 10). */
  FREELANCE_PROJECTS: 'freelance_projects',
  /** Project messages (Sprint 10). */
  FREELANCE_MESSAGES: 'freelance_messages',
  /** Portfolio items (Sprint 10). */
  PORTFOLIOS: 'portfolios',
  /** Reviews (Sprint 10). */
  REVIEWS: 'reviews',
  /** Earnings (Sprint 10). */
  EARNINGS: 'earnings',
  /** Community posts (Sprint 11). */
  COMMUNITY_POSTS: 'community_posts',
  /** Community comments (Sprint 11). */
  COMMUNITY_COMMENTS: 'community_comments',
  /** Communities (Sprint 11). */
  COMMUNITIES: 'communities',
  /** Community members (Sprint 11). */
  COMMUNITY_MEMBERS: 'community_members',
  /** Community notifications (Sprint 11). */
  COMMUNITY_NOTIFICATIONS: 'community_notifications',
  /** Community reports (Sprint 11). */
  COMMUNITY_REPORTS: 'community_reports',
  /** Community profiles (Sprint 11). */
  COMMUNITY_PROFILES: 'community_profiles',
  /** Community follow entries (Sprint 11). */
  COMMUNITY_FOLLOWERS: 'community_followers',
  /** User preferences (Sprint 12). */
  USER_PREFERENCES: 'user_preferences',
  /** User notification settings (Sprint 12). */
  USER_NOTIFICATIONS: 'user_notifications',
  /** User privacy settings (Sprint 12). */
  USER_PRIVACY: 'user_privacy',
  /** User devices (Sprint 12). */
  USER_DEVICES: 'user_devices',
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

// ---------------------------------------------------------------------------
// User roles
// ---------------------------------------------------------------------------

/**
 * Canonical user roles — gates authorization decisions across the app.
 * Keep in sync with `UserRole` in `src/firebase/types.ts`.
 */
export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
} as const;

/** Public route paths — accessible without authentication. */
export const PUBLIC_PATHS = ['/login', '/signup', '/forgot-password', '/verify-email'] as const;

/** Routes that authenticated users should NOT see (login/signup/etc). */
export const GUEST_ONLY_PATHS = ['/login', '/signup'] as const;

// ---------------------------------------------------------------------------
// Firestore subcollection paths
// ---------------------------------------------------------------------------

/**
 * Build a subcollection path under a conversation.
 * Usage: `junovaConversationMessages(conversationId)`
 */
export const junovaConversationMessages = (conversationId: string) =>
  `${COLLECTIONS.JUNOVA_CONVERSATIONS}/${conversationId}/messages` as const;

/** Build a subcollection path under a plan. */
export const planItems = (planId: string) => `${COLLECTIONS.PLANS}/${planId}/items` as const;

// ---------------------------------------------------------------------------
// Storage paths
// ---------------------------------------------------------------------------

export const STORAGE_PATHS = {
  /** User profile pictures: `users/{uid}/avatar.jpg` */
  userAvatar: (uid: string) => `users/${uid}/avatar` as const,
  /** Note attachments: `users/{uid}/notes/{noteId}/{filename}` */
  noteAttachment: (uid: string, noteId: string, filename: string) =>
    `users/${uid}/notes/${noteId}/${filename}` as const,
  /** Quiz media: `users/{uid}/quizzes/{quizId}/{filename}` */
  quizMedia: (uid: string, quizId: string, filename: string) =>
    `users/${uid}/quizzes/${quizId}/${filename}` as const,
} as const;

// ---------------------------------------------------------------------------
// Firebase emulator config (local dev only — controlled by env)
// ---------------------------------------------------------------------------

export const EMULATOR_CONFIG = {
  /** Set NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true in .env.local to enable. */
  enabled: process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true',
  authPort: Number(process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT ?? 9099),
  firestorePort: Number(process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT ?? 8080),
  storagePort: Number(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_PORT ?? 9199),
} as const;
