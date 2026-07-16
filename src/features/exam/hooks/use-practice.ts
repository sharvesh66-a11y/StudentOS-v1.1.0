'use client';
/**
 * StudentOS Exam Center — usePractice Hook
 * Practice session management + AI practice generation.
 */
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/features/auth';
import { authedFetch } from '@/lib/api-client';
import { practiceService } from '../services/practice.service';
import { mistakeAnalysisService } from '../services/mistake-analysis.service';
import type { PracticeSession, MistakeAnalysis, PracticeMode } from '../types';
import type { StudentOSFirebaseError } from '@/firebase';
import { toast } from 'sonner';

export function usePractice() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [analysis, setAnalysis] = useState<MistakeAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<StudentOSFirebaseError | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = practiceService.subscribeToPracticeSessions(
      user.uid,
      (next) => {
        setSessions(next);
        setIsLoading(false);
      },
      (e) => {
        setError(e);
        setIsLoading(false);
      },
    );
    // Also fetch mistake analysis
    void mistakeAnalysisService.getMistakeAnalysis(user.uid).then((r) => {
      if (r.success) setAnalysis(r.data ?? null);
    });
    return unsub;
  }, [user]);

  const generatePractice = useCallback(
    async (
      mode: PracticeMode,
      subject: string,
      topic: string,
      difficulty: string,
      questionCount: number,
    ) => {
      if (!user) return null;
      setIsGenerating(true);
      try {
        // Create practice session record
        const sessionResult = await practiceService.createPracticeSession(user.uid, {
          mode,
          subject,
          topic,
          difficulty: difficulty as never,
          questionCount,
        });
        // Generate questions via API
        const response = await authedFetch('/api/exam/generate-practice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: user.uid, mode, subject, topic, difficulty, questionCount }),
        });
        const data = await response.json();
        setIsGenerating(false);
        if (data.success && data.questions) {
          return { session: sessionResult.data, questions: data.questions };
        }
        toast.error('Failed to generate practice', { description: data.error ?? 'Unknown error' });
        return null;
      } catch (err) {
        setIsGenerating(false);
        toast.error('Failed to generate practice', {
          description: err instanceof Error ? err.message : 'Unknown error',
        });
        return null;
      }
    },
    [user],
  );

  const completeSession = useCallback(
    async (sessionId: string, score: number, correctCount: number, timeSpent: number) => {
      return practiceService.completePracticeSession(sessionId, score, correctCount, timeSpent);
    },
    [],
  );

  return {
    sessions: user ? sessions : [],
    analysis,
    isLoading: user ? isLoading : false,
    isGenerating,
    error,
    generatePractice,
    completeSession,
  };
}
