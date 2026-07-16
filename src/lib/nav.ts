/**
 * StudentOS Navigation Configuration
 *
 * Centralized route paths + nav item definitions. The sidebar, mobile nav,
 * and quick-action cards all read from this single source — no hardcoded
 * paths scattered across components.
 *
 * @see src/components/layout/sidebar.tsx
 * @see src/components/layout/mobile-nav.tsx
 * @see src/features/dashboard/components/quick-actions.tsx
 */

import { APP_MODULES, type AppModule } from './constants';

/** Canonical route paths. */
export const ROUTES = {
  // Public
  login: '/login',
  signup: '/signup',
  forgotPassword: '/forgot-password',

  // App (authenticated)
  dashboard: '/dashboard',
  profile: '/profile',
  planner: '/planner',
  junovaAI: '/junova-ai',
  examCenter: '/exam-center',
  exams: '/exams',
  notes: '/notes',
  pdfAi: '/pdf-ai',
  flashcards: '/flashcards',
  progress: '/progress',
  studyGroups: '/study-groups',
  careerPlanner: '/career-planner',
  scholarshipFinder: '/scholarship-finder',
  freelancing: '/freelancing',
  community: '/community',
  aiTools: '/ai-tools',
  providers: '/providers',
  settings: '/settings',
} as const;

/** Map module IDs to their route paths. */
const MODULE_ROUTES: Record<string, string> = {
  'junova-ai': ROUTES.junovaAI,
  dashboard: ROUTES.dashboard,
  planner: ROUTES.planner,
  'exam-center': ROUTES.examCenter,
  'ai-providers': ROUTES.providers,
  notes: ROUTES.notes,
  'pdf-ai': ROUTES.pdfAi,
  flashcards: ROUTES.flashcards,
  progress: ROUTES.progress,
  'study-groups': ROUTES.studyGroups,
  'career-planner': ROUTES.careerPlanner,
  'scholarship-finder': ROUTES.scholarshipFinder,
  freelancing: ROUTES.freelancing,
  community: ROUTES.community,
  'ai-tools': ROUTES.aiTools,
  settings: ROUTES.settings,
};

/** Get the route path for a module ID. */
export function getModuleRoute(moduleId: string): string {
  return MODULE_ROUTES[moduleId] ?? `/dashboard`;
}

/** Nav item — used by sidebar + mobile nav. */
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  /** Sprint badge — shown when the module isn't enabled yet. */
  sprint: string;
  enabled: boolean;
  /** Whether this is a primary nav item (always shown) vs. module card. */
  primary?: boolean;
}

/** Build nav items from APP_MODULES. */
function buildNavItems(): NavItem[] {
  const items: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: ROUTES.dashboard,
      icon: 'layout-dashboard',
      sprint: 'S3',
      enabled: true,
      primary: true,
    },
    {
      id: 'profile',
      label: 'Profile',
      href: ROUTES.profile,
      icon: 'user',
      sprint: 'S1.2',
      enabled: true,
      primary: true,
    },
  ];

  // Add all modules from APP_MODULES (includes Settings at the end)
  for (const mod of APP_MODULES) {
    if (mod.id === 'dashboard') continue;
    items.push({
      id: mod.id,
      label: mod.name,
      href: getModuleRoute(mod.id),
      icon: mod.icon,
      sprint: mod.sprint,
      enabled: mod.enabled,
    });
  }

  return items;
}

export const NAV_ITEMS: readonly NavItem[] = buildNavItems();

/** Get a module by ID from APP_MODULES. */
export function getModule(id: string): AppModule | undefined {
  return APP_MODULES.find((m) => m.id === id);
}
