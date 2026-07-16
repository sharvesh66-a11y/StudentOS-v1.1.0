'use client';
/**
 * StudentOS Analytics — useAnalytics Hook
 * Real-time analytics subscription + event tracking.
 */
import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth';
import { analyticsService } from '../services/analytics.service';
import { gamificationService, computeLevel } from '../services/gamification.service';
import type {
  DailyAnalytics,
  StreakData,
  Achievement,
  Challenge,
  XPHistoryEntry,
  LevelInfo,
} from '../types';

export function useAnalytics() {
  const { user, profile } = useAuth();
  const [dailyData, setDailyData] = useState<DailyAnalytics[]>([]);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [xpHistory, setXPHistory] = useState<XPHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsubAnalytics = analyticsService.subscribeToAnalytics(user.uid, (data) => {
      setDailyData(data);
      setIsLoading(false);
    });
    const unsubStreak = gamificationService.subscribeToStreak(user.uid, setStreak);
    const unsubAch = gamificationService.subscribeToAchievements(user.uid, setAchievements);
    const unsubCh = gamificationService.subscribeToChallenges(user.uid, setChallenges);
    const unsubXP = gamificationService.subscribeToXPHistory(user.uid, setXPHistory);
    // Update streak on load
    void gamificationService.updateStreak(user.uid);
    return () => {
      unsubAnalytics();
      unsubStreak();
      unsubAch();
      unsubCh();
      unsubXP();
    };
  }, [user]);

  const summary = dailyData.length > 0 ? analyticsService.computeSummary(dailyData) : null;
  const levelInfo: LevelInfo = computeLevel(profile?.xp ?? 0);

  const trackEvent = async (event: Parameters<typeof analyticsService.trackEvent>[1]) => {
    if (!user) return;
    await analyticsService.trackEvent(user.uid, event);
  };

  return {
    dailyData,
    summary,
    streak,
    achievements,
    challenges,
    xpHistory,
    levelInfo,
    isLoading: user ? isLoading : false,
    trackEvent,
  };
}
