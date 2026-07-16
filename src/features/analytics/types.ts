/**
 * StudentOS Analytics & Gamification — Domain Types
 * @see docs/DATABASE.md for the Firestore schema reference.
 */

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

export interface DailyAnalytics {
  uid: string;
  date: string;
  studyTimeMinutes: number;
  quizScore: number | null;
  quizzesTaken: number;
  practiceSessions: number;
  notesCreated: number;
  doubtsSolved: number;
  aiChats: number;
  voiceSessions: number;
  xpEarned: number;
  createdAt: number;
  updatedAt: number;
}

export interface AnalyticsSummary {
  uid: string;
  totalStudyMinutes: number;
  totalQuizzes: number;
  totalPractice: number;
  totalNotes: number;
  totalDoubts: number;
  totalAIChats: number;
  averageScore: number;
  accuracyRate: number;
  completionRate: number;
  learningSpeed: number;
  productivityScore: number;
  examReadiness: number;
  subjectPerformance: SubjectPerformance[];
  weeklyData: DailyAnalytics[];
  monthlyData: DailyAnalytics[];
  updatedAt: number;
}

export interface SubjectPerformance {
  subject: string;
  quizzesTaken: number;
  averageScore: number;
  studyMinutes: number;
  accuracy: number;
}

// ---------------------------------------------------------------------------
// Gamification
// ---------------------------------------------------------------------------

export interface XPHistoryEntry {
  id: string;
  uid: string;
  amount: number;
  reason: string;
  source:
    | 'quiz'
    | 'practice'
    | 'notes'
    | 'doubt'
    | 'chat'
    | 'voice'
    | 'planner'
    | 'login'
    | 'achievement'
    | 'challenge';
  createdAt: number;
}

export interface StreakData {
  uid: string;
  currentStreak: number;
  longestStreak: number;
  weeklyStreak: number;
  monthlyStreak: number;
  lastActiveDate: string;
  lastWeekActive: string;
  lastMonthActive: string;
  freezeCount: number;
  updatedAt: number;
}

export type AchievementCategory =
  'study' | 'quiz' | 'practice' | 'notes' | 'streak' | 'social' | 'milestone';
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
  id: string;
  uid: string;
  achievementId: string;
  title: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string;
  xpReward: number;
  unlockedAt: number;
}

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string;
  xpReward: number;
  condition: string;
}

export interface Badge {
  id: string;
  uid: string;
  badgeId: string;
  name: string;
  icon: string;
  color: string;
  earnedAt: number;
}

export type ChallengeType = 'daily' | 'weekly';
export type ChallengeStatus = 'active' | 'completed' | 'expired';

export interface Challenge {
  id: string;
  uid: string;
  type: ChallengeType;
  title: string;
  description: string;
  xpReward: number;
  target: number;
  progress: number;
  status: ChallengeStatus;
  expiresAt: number;
  createdAt: number;
  updatedAt: number;
}

export interface LevelInfo {
  level: number;
  currentXP: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  progressPercent: number;
}

// ---------------------------------------------------------------------------
// AI Insights
// ---------------------------------------------------------------------------

export interface AIAnalyticsInsight {
  summary: string;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  motivationalMessage: string;
}
