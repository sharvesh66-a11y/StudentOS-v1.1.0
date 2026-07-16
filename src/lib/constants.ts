/**
 * StudentOS App Constants
 *
 * Centralized, strongly-typed constants for the entire application.
 * Importing from here (rather than hardcoding strings/numbers) keeps
 * the codebase DRY and refactor-safe.
 *
 * Keep this file free of runtime logic — pure data only.
 */

export const APP_NAME = 'StudentOS' as const;
export const APP_TAGLINE = 'Learn. Grow. Achieve.' as const;
export const APP_DESCRIPTION =
  'StudentOS is an AI-powered operating system for students — one app to replace many. Powered by Junova AI.' as const;

export const CORE_AI_NAME = 'Junova AI' as const;
export const CORE_AI_SHORT = 'Junova' as const;

/** Semantic version — bump on every sprint completion. */
export const APP_VERSION = '1.3.0' as const;

/** Public URLs (placeholder — wired up in Sprint 13: Deployment). */
export const APP_URLS = {
  production: 'https://studentos.app',
  staging: 'https://staging.studentos.app',
  docs: 'https://docs.studentos.app',
} as const;

/** Social/contact handles (placeholder — update before launch). */
export const APP_SOCIAL = {
  github: 'https://github.com/studentos',
  twitter: 'https://twitter.com/studentos',
  email: 'hello@studentos.app',
} as const;

/**
 * Application modules — the canonical list of StudentOS modules.
 *
 * StudentOS is built around Junova AI (the Core Intelligence Layer). Every
 * module integrates with Junova where appropriate. Future modules ship
 * disabled (`enabled: false`) until their sprint lands. UI navigation,
 * feature flags, and roadmap components all read from this.
 *
 * @see docs/ROADMAP.md for the full sprint plan.
 * @see docs/ARCHITECTURE.md §0 for the module integration contract.
 */
export interface AppModule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  sprint: string;
  icon: string; // lucide icon name (resolved in UI layer)
  /** Whether this module integrates with Junova AI. */
  junovaIntegrated: boolean;
}

export const APP_MODULES: readonly AppModule[] = [
  {
    id: 'junova-ai',
    name: 'Junova AI',
    description:
      'Core Intelligence Layer — chat, memory, personalized teaching. The heart of StudentOS.',
    enabled: true,
    sprint: 'S4',
    icon: 'sparkles',
    junovaIntegrated: true,
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: "Home base — module launcher, today's overview, quick stats.",
    enabled: true,
    sprint: 'S3',
    icon: 'layout-dashboard',
    junovaIntegrated: true,
  },
  {
    id: 'planner',
    name: 'Study Planner',
    description:
      'AI-powered study scheduling with calendar, timeline, goals, and revision tracking.',
    enabled: true,
    sprint: 'S4.6',
    icon: 'calendar',
    junovaIntegrated: true,
  },
  {
    id: 'exam-center',
    name: 'Exam Center',
    description:
      'AI-generated quizzes with instant scoring, detailed explanations, and memory integration.',
    enabled: true,
    sprint: 'S5',
    icon: 'clipboard-list',
    junovaIntegrated: true,
  },
  {
    id: 'notes',
    name: 'Notes Hub',
    description: 'AI-generated notes, flashcards, and doubt solving — powered by Junova AI.',
    enabled: true,
    sprint: 'S6',
    icon: 'notebook-pen',
    junovaIntegrated: true,
  },
  {
    id: 'pdf-ai',
    name: 'PDF AI',
    description: 'Upload any PDF and chat with it. Get summaries, key points, and answers.',
    enabled: true,
    sprint: 'v1.2',
    icon: 'file-text',
    junovaIntegrated: true,
  },
  {
    id: 'flashcards',
    name: 'Flashcards',
    description: 'Create flashcard decks and study with 3D flip cards. AI-generated decks.',
    enabled: true,
    sprint: 'v1.2',
    icon: 'layers',
    junovaIntegrated: true,
  },
  {
    id: 'progress',
    name: 'Progress & Analytics',
    description:
      'Track your learning journey with AI-powered insights, charts, streaks, achievements, and gamification.',
    enabled: true,
    sprint: 'S7',
    icon: 'trending-up',
    junovaIntegrated: true,
  },
  {
    id: 'study-groups',
    name: 'Study Groups',
    description: 'Collaborative learning spaces with group chat, sessions, and shared resources.',
    enabled: true,
    sprint: 'S7',
    icon: 'users',
    junovaIntegrated: true,
  },
  {
    id: 'career-planner',
    name: 'Career Planner',
    description: 'AI-powered career guidance, goals, skills, and college planning.',
    enabled: true,
    sprint: 'S8',
    icon: 'target',
    junovaIntegrated: true,
  },
  {
    id: 'scholarship-finder',
    name: 'Scholarship Finder',
    description: 'AI-powered scholarship discovery, tracking, and application guidance.',
    enabled: true,
    sprint: 'S9',
    icon: 'graduation-cap',
    junovaIntegrated: true,
  },
  {
    id: 'freelancing',
    name: 'Student Freelancing',
    description: 'Find jobs, manage projects, build your portfolio, and earn while studying.',
    enabled: true,
    sprint: 'S10',
    icon: 'briefcase',
    junovaIntegrated: true,
  },
  {
    id: 'community',
    name: 'Student Community',
    description: 'Connect, share knowledge, and learn together with peers.',
    enabled: true,
    sprint: 'S11',
    icon: 'globe',
    junovaIntegrated: true,
  },
  {
    id: 'ai-providers',
    name: 'AI Providers',
    description: 'Connect free + premium AI providers. Multi-provider architecture.',
    enabled: true,
    sprint: 'v1.1',
    icon: 'sparkles',
    junovaIntegrated: false,
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'Account, AI preferences, subscription, and premium features.',
    enabled: true,
    sprint: 'S8',
    icon: 'settings',
    junovaIntegrated: true,
  },
] as const;

/**
 * Roadmap sprints — mirrors docs/ROADMAP.md.
 * Update both this file and the doc together when the roadmap changes.
 *
 * Note: Sprint codes use 'S' prefix (S1, S2, ... S13) to reflect the
 * revised sprint-based roadmap (was 'M' for milestones in the old roadmap).
 */
export interface Milestone {
  id: number;
  code: string;
  name: string;
  status: 'planned' | 'in-progress' | 'done' | 'blocked';
}

export const MILESTONES: readonly Milestone[] = [
  { id: 1, code: 'S1', name: 'Project Initialization + Firebase Foundation', status: 'done' },
  { id: 2, code: 'S2', name: 'Authentication', status: 'done' },
  { id: 3, code: 'S3', name: 'Dashboard Foundation', status: 'planned' },
  { id: 4, code: 'S4', name: 'Junova AI Core', status: 'planned' },
  { id: 5, code: 'S5', name: 'Exam Center', status: 'planned' },
  { id: 6, code: 'S6', name: 'Notes Hub', status: 'planned' },
  { id: 7, code: 'S7', name: 'Study Groups', status: 'planned' },
  { id: 8, code: 'S8', name: 'Career Planner', status: 'planned' },
  { id: 9, code: 'S9', name: 'Scholarship Finder', status: 'planned' },
  { id: 10, code: 'S10', name: 'Student Freelancing', status: 'planned' },
  { id: 11, code: 'S11', name: 'Student Community', status: 'planned' },
  { id: 12, code: 'S12', name: 'Settings', status: 'planned' },
  { id: 13, code: 'S13', name: 'Testing, Optimization & Production Deployment', status: 'planned' },
] as const;

/** Design tokens (mirror of globals.css — kept here for TS-side access). */
export const DESIGN_TOKENS = {
  theme: 'dark' as const,
  primaryColor: 'purple' as const,
  secondaryColor: 'blue' as const,
  radius: '0.75rem' as const,
} as const;

/** Storage keys — single source of truth for localStorage / sessionStorage. */
export const STORAGE_KEYS = {
  theme: 'studentos:theme',
  sidebar: 'studentos:sidebar-state',
  onboardingComplete: 'studentos:onboarding-complete',
} as const;

/** Default route after login (wired up in Sprint 2: Authentication). */
export const DEFAULT_AUTH_REDIRECT = '/dashboard' as const;
