/**
 * StudentOS App Configuration
 *
 * Runtime configuration that's safe to expose to the client.
 * NEVER put secrets here — secrets live in `.env.local` (Sprint 1.2).
 *
 * All values fall back to safe defaults so the app boots even when
 * environment variables are missing (useful for local dev & previews).
 */

type Environment = 'development' | 'staging' | 'production' | 'test';

interface AppConfig {
  readonly env: Environment;
  readonly isProd: boolean;
  readonly isDev: boolean;
  readonly isTest: boolean;
  readonly version: string;
  readonly siteUrl: string;
}

function detectEnv(): Environment {
  const raw = (process.env.NODE_ENV ?? 'development').toLowerCase();
  if (raw === 'production') return 'production';
  if (raw === 'staging') return 'staging';
  if (raw === 'test') return 'test';
  return 'development';
}

const env = detectEnv();

export const config: AppConfig = {
  env,
  isProd: env === 'production',
  isDev: env === 'development',
  isTest: env === 'test',
  version: process.env.NEXT_PUBLIC_APP_VERSION ?? '0.1.0',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
} as const;

/**
 * Feature flags — gate incomplete features per environment.
 * All flags default to `false` so unreleased code never ships enabled.
 */
export const featureFlags = {
  // Sprint 1.x — foundation (no features yet)
  enableAuth: false,
  enableDashboard: false,
  enableJunovaAI: false,
  enablePlanner: false,
  enableNotes: false,
  enableQuiz: false,
  enableExam: false,
  enableProgress: false,
  enableGamification: false,
  enableSettings: false,
} as const;

export type FeatureFlag = keyof typeof featureFlags;
