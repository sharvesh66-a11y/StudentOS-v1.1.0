/**
 * StudentOS Analytics — Feature Barrel
 */
export { AnalyticsDashboard } from './components/analytics-dashboard';
export { analyticsService } from './services/analytics.service';
export { gamificationService } from './services/gamification.service';
export { useAnalytics } from './hooks/use-analytics';
export type {
  DailyAnalytics,
  AnalyticsSummary,
  SubjectPerformance,
  XPHistoryEntry,
  StreakData,
  Achievement,
  AchievementDefinition,
  Badge,
  Challenge,
  LevelInfo,
  AIAnalyticsInsight,
} from './types';
