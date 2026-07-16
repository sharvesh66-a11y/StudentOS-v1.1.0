/**
 * StudentOS Exam Center — Mistake Analysis Service
 * Detects weak areas from quiz attempts and stores analysis at `mistake_analysis/{uid}`.
 */
import { COLLECTIONS, type StudentOSFirebaseError } from '@/firebase';
import { normalizeFirebaseError } from '@/firebase/error-handler';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { memoryService } from '@/features/junova/services/memory.service';
import type { MistakeAnalysis, QuizResult } from '../types';

export interface MistakeAnalysisResult<T> {
  success: boolean;
  data?: T;
  error?: StudentOSFirebaseError;
}

export async function getMistakeAnalysis(
  uid: string,
): Promise<MistakeAnalysisResult<MistakeAnalysis | null>> {
  try {
    const ref = doc(db, COLLECTIONS.MISTAKE_ANALYSIS, uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: true, data: null };
    return { success: true, data: snap.data() as MistakeAnalysis };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

/**
 * Analyze a quiz result and update the user's mistake analysis.
 * Also updates Junova Memory with weak/strong topics.
 */
export async function analyzeQuizResult(
  uid: string,
  result: QuizResult,
  _quizTitle: string,
): Promise<MistakeAnalysisResult<MistakeAnalysis>> {
  try {
    // Fetch existing analysis
    const existing = await getMistakeAnalysis(uid);
    const prev = existing.success ? existing.data : null;

    const _wrongTopics = result.questionResults
      .filter((r) => !r.isCorrect && !r.isSkipped)
      .map((r) => {
        const q = result.questionResults.find((qr) => qr.questionId === r.questionId);
        return q?.questionId ?? 'unknown';
      });
    const skippedCount = result.questionResults.filter((r) => r.isSkipped).length;
    const avgTimePerQ = result.timeSpentSeconds / result.totalQuestions;

    const analysis: MistakeAnalysis = {
      uid,
      weakChapters: [...new Set([...(prev?.weakChapters ?? []), ...result.weakTopics])].slice(
        0,
        20,
      ),
      weakConcepts: [...new Set([...(prev?.weakConcepts ?? []), ...result.weakTopics])].slice(
        0,
        30,
      ),
      frequentlyIncorrectTopics: [
        ...new Set([...(prev?.frequentlyIncorrectTopics ?? []), ...result.weakTopics]),
      ].slice(0, 15),
      timeManagementIssues: avgTimePerQ > 120 || skippedCount > result.totalQuestions * 0.2,
      averageTimePerQuestion: prev
        ? Math.round((prev.averageTimePerQuestion + avgTimePerQ) / 2)
        : Math.round(avgTimePerQ),
      accuracyRate: prev ? Math.round((prev.accuracyRate + result.score) / 2) : result.score,
      totalQuizzes: (prev?.totalQuizzes ?? 0) + 1,
      totalQuestions: (prev?.totalQuestions ?? 0) + result.totalQuestions,
      totalCorrect: (prev?.totalCorrect ?? 0) + result.correctCount,
      totalWrong:
        (prev?.totalWrong ?? 0) + (result.totalQuestions - result.correctCount - skippedCount),
      totalSkipped: (prev?.totalSkipped ?? 0) + skippedCount,
      lastAnalyzedAt: Date.now(),
      updatedAt: Date.now(),
    };

    const ref = doc(db, COLLECTIONS.MISTAKE_ANALYSIS, uid);
    await setDoc(ref, { ...analysis, updatedAt: serverTimestamp() }, { merge: true });

    // Update Junova Memory with weak topics
    for (const topic of [...new Set(result.weakTopics)]) {
      await memoryService.addWeakTopic(uid, topic);
    }
    for (const topic of [...new Set(result.strongTopics)]) {
      await memoryService.addStrongTopic(uid, topic);
    }

    return { success: true, data: analysis };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export const mistakeAnalysisService = { getMistakeAnalysis, analyzeQuizResult } as const;
