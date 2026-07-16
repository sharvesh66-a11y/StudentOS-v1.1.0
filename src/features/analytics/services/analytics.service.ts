/**
 * StudentOS Analytics — Analytics Service
 * Tracks daily study metrics + computes summaries.
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
  limit,
  type Unsubscribe,
} from 'firebase/firestore';
import type { DailyAnalytics, AnalyticsSummary } from '../types';

export interface AnalyticsResult<T> {
  success: boolean;
  data?: T;
  error?: StudentOSFirebaseError;
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

/** Track an event — increments daily analytics counters. */
export async function trackEvent(
  uid: string,
  event: {
    studyMinutes?: number;
    quizScore?: number;
    quizzesTaken?: number;
    practiceSessions?: number;
    notesCreated?: number;
    doubtsSolved?: number;
    aiChats?: number;
    voiceSessions?: number;
    xpEarned?: number;
  },
): Promise<AnalyticsResult<void>> {
  try {
    const date = todayStr();
    const ref = doc(db, COLLECTIONS.ANALYTICS, `${uid}_${date}`);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const payload: DailyAnalytics = {
        uid,
        date,
        studyTimeMinutes: event.studyMinutes ?? 0,
        quizScore: event.quizScore ?? null,
        quizzesTaken: event.quizzesTaken ?? 0,
        practiceSessions: event.practiceSessions ?? 0,
        notesCreated: event.notesCreated ?? 0,
        doubtsSolved: event.doubtsSolved ?? 0,
        aiChats: event.aiChats ?? 0,
        voiceSessions: event.voiceSessions ?? 0,
        xpEarned: event.xpEarned ?? 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await setDoc(ref, { ...payload, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    } else {
      const existing = snap.data() as DailyAnalytics;
      const updates: Partial<DailyAnalytics> = {
        studyTimeMinutes: existing.studyTimeMinutes + (event.studyMinutes ?? 0),
        quizzesTaken: existing.quizzesTaken + (event.quizzesTaken ?? 0),
        practiceSessions: existing.practiceSessions + (event.practiceSessions ?? 0),
        notesCreated: existing.notesCreated + (event.notesCreated ?? 0),
        doubtsSolved: existing.doubtsSolved + (event.doubtsSolved ?? 0),
        aiChats: existing.aiChats + (event.aiChats ?? 0),
        voiceSessions: existing.voiceSessions + (event.voiceSessions ?? 0),
        xpEarned: existing.xpEarned + (event.xpEarned ?? 0),
        quizScore: event.quizScore ?? existing.quizScore,
        updatedAt: Date.now(),
      };
      await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

/** Get analytics for a specific date. */
export async function getDailyAnalytics(
  uid: string,
  date: string,
): Promise<AnalyticsResult<DailyAnalytics | null>> {
  try {
    const ref = doc(db, COLLECTIONS.ANALYTICS, `${uid}_${date}`);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: true, data: null };
    return { success: true, data: snap.data() as DailyAnalytics };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

/** Subscribe to recent daily analytics (last 30 days). */
export function subscribeToAnalytics(
  uid: string,
  onNext: (data: DailyAnalytics[]) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<DailyAnalytics>(
    COLLECTIONS.ANALYTICS,
    onNext,
    onError,
    where('uid', '==', uid),
    orderBy('date', 'desc'),
    limit(90),
  );
}

/** Compute a summary from daily analytics data. */
export function computeSummary(
  dailyData: DailyAnalytics[],
): Omit<AnalyticsSummary, 'uid' | 'updatedAt'> {
  const totalStudyMinutes = dailyData.reduce((s, d) => s + d.studyTimeMinutes, 0);
  const totalQuizzes = dailyData.reduce((s, d) => s + d.quizzesTaken, 0);
  const totalPractice = dailyData.reduce((s, d) => s + d.practiceSessions, 0);
  const totalNotes = dailyData.reduce((s, d) => s + d.notesCreated, 0);
  const totalDoubts = dailyData.reduce((s, d) => s + d.doubtsSolved, 0);
  const totalAIChats = dailyData.reduce((s, d) => s + d.aiChats, 0);
  const scores = dailyData.filter((d) => d.quizScore !== null).map((d) => d.quizScore!);
  const averageScore =
    scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const accuracyRate = averageScore;
  const completionRate =
    totalQuizzes > 0 ? Math.round((totalQuizzes / (totalQuizzes + totalPractice * 0.5)) * 100) : 0;
  const learningSpeed =
    totalStudyMinutes > 0
      ? Math.round((totalQuizzes + totalNotes + totalDoubts) / (totalStudyMinutes / 60))
      : 0;
  const productivityScore = Math.min(
    100,
    Math.round(
      (totalStudyMinutes / 60 +
        totalQuizzes * 5 +
        totalNotes * 3 +
        totalDoubts * 2 +
        totalAIChats) /
        3,
    ),
  );
  const examReadiness = Math.min(
    100,
    Math.round(averageScore * 0.6 + completionRate * 0.2 + productivityScore * 0.2),
  );

  return {
    totalStudyMinutes,
    totalQuizzes,
    totalPractice,
    totalNotes,
    totalDoubts,
    totalAIChats,
    averageScore,
    accuracyRate,
    completionRate,
    learningSpeed,
    productivityScore,
    examReadiness,
    subjectPerformance: [],
    weeklyData: dailyData.slice(0, 7).reverse(),
    monthlyData: dailyData.slice(0, 30).reverse(),
  };
}

export const analyticsService = {
  trackEvent,
  getDailyAnalytics,
  subscribeToAnalytics,
  computeSummary,
} as const;
