/**
 * StudentOS Gamification Service
 * XP, levels, streaks, achievements, badges, challenges.
 */
import { db, COLLECTIONS, firestoreHelpers, type StudentOSFirebaseError } from '@/firebase';
import { normalizeFirebaseError } from '@/firebase/error-handler';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  where,
  orderBy,
  type Unsubscribe,
} from 'firebase/firestore';
import type {
  XPHistoryEntry,
  StreakData,
  Achievement,
  Badge,
  Challenge,
  LevelInfo,
  AchievementDefinition,
} from '../types';

export interface GamificationResult<T> {
  success: boolean;
  data?: T;
  error?: StudentOSFirebaseError;
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}
function weekStr(): string {
  const d = new Date();
  const onejan = new Date(d.getFullYear(), 0, 1);
  return `${d.getFullYear()}-W${Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7)}`;
}
function monthStr(): string {
  return new Date().toISOString().slice(0, 7);
}

function xpForLevel(level: number): number {
  return level * 100;
}
export function computeLevel(totalXP: number): LevelInfo {
  let level = 1;
  let remaining = totalXP;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level++;
  }
  const xpForCurrent = xpForLevel(level - 1);
  const xpForNext = xpForLevel(level);
  return {
    level,
    currentXP: remaining,
    xpForCurrentLevel: xpForCurrent,
    xpForNextLevel: xpForNext,
    progressPercent: Math.round((remaining / xpForNext) * 100),
  };
}

// --- XP ---

export async function awardXP(
  uid: string,
  amount: number,
  reason: string,
  source: XPHistoryEntry['source'],
): Promise<GamificationResult<void>> {
  try {
    // Save XP history entry
    await firestoreHelpers.createDocument(COLLECTIONS.XP_HISTORY, {
      uid,
      amount,
      reason,
      source,
      createdAt: Date.now(),
    });
    // Update user profile XP (non-blocking — the profile update happens via Firestore rules + client)
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export function subscribeToXPHistory(
  uid: string,
  onNext: (entries: XPHistoryEntry[]) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<XPHistoryEntry>(
    COLLECTIONS.XP_HISTORY,
    onNext,
    onError,
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
  );
}

// --- Streaks ---

export async function updateStreak(uid: string): Promise<GamificationResult<StreakData>> {
  try {
    const ref = doc(db, COLLECTIONS.DAILY_STREAK, uid);
    const snap = await getDoc(ref);
    const today = todayStr();
    const week = weekStr();
    const month = monthStr();
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (!snap.exists()) {
      const data: StreakData = {
        uid,
        currentStreak: 1,
        longestStreak: 1,
        weeklyStreak: 1,
        monthlyStreak: 1,
        lastActiveDate: today,
        lastWeekActive: week,
        lastMonthActive: month,
        freezeCount: 0,
        updatedAt: Date.now(),
      };
      await setDoc(ref, { ...data, updatedAt: serverTimestamp() });
      return { success: true, data };
    }

    const existing = snap.data() as StreakData;
    if (existing.lastActiveDate === today) return { success: true, data: existing };

    const newCurrent = existing.lastActiveDate === yesterday ? existing.currentStreak + 1 : 1;
    const newWeekly = existing.lastWeekActive === week ? existing.weeklyStreak + 1 : 1;
    const newMonthly = existing.lastMonthActive === month ? existing.monthlyStreak + 1 : 1;
    const data: StreakData = {
      ...existing,
      currentStreak: newCurrent,
      longestStreak: Math.max(existing.longestStreak, newCurrent),
      weeklyStreak: newWeekly,
      monthlyStreak: newMonthly,
      lastActiveDate: today,
      lastWeekActive: week,
      lastMonthActive: month,
      updatedAt: Date.now(),
    };
    await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
    return { success: true, data };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export async function getStreak(uid: string): Promise<GamificationResult<StreakData | null>> {
  try {
    const ref = doc(db, COLLECTIONS.DAILY_STREAK, uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: true, data: null };
    return { success: true, data: snap.data() as StreakData };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export function subscribeToStreak(
  uid: string,
  onNext: (data: StreakData | null) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToDocument<StreakData>(
    COLLECTIONS.DAILY_STREAK,
    uid,
    onNext,
    onError,
  );
}

// --- Achievements ---

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: 'first-quiz',
    title: 'First Quiz',
    description: 'Complete your first quiz',
    category: 'quiz',
    rarity: 'common',
    icon: 'clipboard-check',
    xpReward: 50,
    condition: 'quizzes_taken >= 1',
  },
  {
    id: 'quiz-master',
    title: 'Quiz Master',
    description: 'Complete 50 quizzes',
    category: 'quiz',
    rarity: 'epic',
    icon: 'award',
    xpReward: 500,
    condition: 'quizzes_taken >= 50',
  },
  {
    id: 'perfect-score',
    title: 'Perfect Score',
    description: 'Get 100% on a quiz',
    category: 'quiz',
    rarity: 'rare',
    icon: 'star',
    xpReward: 200,
    condition: 'perfect_quiz',
  },
  {
    id: 'first-note',
    title: 'Note Taker',
    description: 'Create your first note',
    category: 'notes',
    rarity: 'common',
    icon: 'notebook-pen',
    xpReward: 50,
    condition: 'notes_created >= 1',
  },
  {
    id: 'note-scholar',
    title: 'Note Scholar',
    description: 'Create 100 notes',
    category: 'notes',
    rarity: 'epic',
    icon: 'book-open',
    xpReward: 500,
    condition: 'notes_created >= 100',
  },
  {
    id: 'first-doubt',
    title: 'Curious Mind',
    description: 'Ask your first doubt',
    category: 'notes',
    rarity: 'common',
    icon: 'help-circle',
    xpReward: 50,
    condition: 'doubts_solved >= 1',
  },
  {
    id: 'streak-7',
    title: 'Week Warrior',
    description: '7-day study streak',
    category: 'streak',
    rarity: 'rare',
    icon: 'flame',
    xpReward: 150,
    condition: 'streak >= 7',
  },
  {
    id: 'streak-30',
    title: 'Monthly Master',
    description: '30-day study streak',
    category: 'streak',
    rarity: 'epic',
    icon: 'zap',
    xpReward: 500,
    condition: 'streak >= 30',
  },
  {
    id: 'streak-100',
    title: 'Centurion',
    description: '100-day study streak',
    category: 'streak',
    rarity: 'legendary',
    icon: 'crown',
    xpReward: 2000,
    condition: 'streak >= 100',
  },
  {
    id: 'ai-explorer',
    title: 'AI Explorer',
    description: 'Use Junova AI 50 times',
    category: 'study',
    rarity: 'rare',
    icon: 'sparkles',
    xpReward: 200,
    condition: 'ai_chats >= 50',
  },
  {
    id: 'voice-pioneer',
    title: 'Voice Pioneer',
    description: 'Complete 10 voice sessions',
    category: 'study',
    rarity: 'rare',
    icon: 'mic',
    xpReward: 200,
    condition: 'voice_sessions >= 10',
  },
  {
    id: 'level-10',
    title: 'Rising Star',
    description: 'Reach level 10',
    category: 'milestone',
    rarity: 'epic',
    icon: 'trending-up',
    xpReward: 1000,
    condition: 'level >= 10',
  },
  {
    id: 'level-25',
    title: 'Scholar',
    description: 'Reach level 25',
    category: 'milestone',
    rarity: 'legendary',
    icon: 'graduation-cap',
    xpReward: 5000,
    condition: 'level >= 25',
  },
];

export async function unlockAchievement(
  uid: string,
  def: AchievementDefinition,
): Promise<GamificationResult<void>> {
  try {
    // Check if already unlocked
    const existing = await firestoreHelpers.queryCollection<Achievement>(
      COLLECTIONS.ACHIEVEMENTS,
      where('uid', '==', uid),
      where('achievementId', '==', def.id),
    );
    if (!existing.success || (existing.data && existing.data.length > 0)) return { success: true };

    const payload = {
      uid,
      achievementId: def.id,
      title: def.title,
      description: def.description,
      category: def.category,
      rarity: def.rarity,
      icon: def.icon,
      xpReward: def.xpReward,
      unlockedAt: Date.now(),
    };
    await firestoreHelpers.createDocument(COLLECTIONS.ACHIEVEMENTS, payload);
    await awardXP(uid, def.xpReward, `Achievement: ${def.title}`, 'achievement');
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export function subscribeToAchievements(
  uid: string,
  onNext: (data: Achievement[]) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<Achievement>(
    COLLECTIONS.ACHIEVEMENTS,
    onNext,
    onError,
    where('uid', '==', uid),
    orderBy('unlockedAt', 'desc'),
  );
}

export function subscribeToBadges(
  uid: string,
  onNext: (data: Badge[]) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<Badge>(
    COLLECTIONS.BADGES,
    onNext,
    onError,
    where('uid', '==', uid),
    orderBy('earnedAt', 'desc'),
  );
}

// --- Challenges ---

export function subscribeToChallenges(
  uid: string,
  onNext: (data: Challenge[]) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<Challenge>(
    COLLECTIONS.CHALLENGES,
    onNext,
    onError,
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
  );
}

export async function updateChallengeProgress(
  challengeId: string,
  progress: number,
): Promise<GamificationResult<void>> {
  try {
    return firestoreHelpers.updateDocument(COLLECTIONS.CHALLENGES, challengeId, {
      progress,
      updatedAt: Date.now(),
    });
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export const gamificationService = {
  awardXP,
  subscribeToXPHistory,
  computeLevel,
  updateStreak,
  getStreak,
  subscribeToStreak,
  unlockAchievement,
  subscribeToAchievements,
  subscribeToBadges,
  subscribeToChallenges,
  updateChallengeProgress,
  ACHIEVEMENT_DEFINITIONS,
} as const;
