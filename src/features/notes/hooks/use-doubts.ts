'use client';
/**
 * StudentOS Notes Hub — useDoubts Hook
 * Doubt history subscription + AI doubt solving.
 */
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/features/auth';
import { authedFetch } from '@/lib/api-client';
import { doubtService } from '../services/doubt.service';
import type { Doubt, DoubtConfig } from '../types';
import type { StudentOSFirebaseError } from '@/firebase';
import { toast } from 'sonner';

export function useDoubts() {
  const { user } = useAuth();
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSolving, setIsSolving] = useState(false);
  const [error, setError] = useState<StudentOSFirebaseError | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = doubtService.subscribeToDoubts(
      user.uid,
      (next) => {
        setDoubts(next);
        setIsLoading(false);
      },
      (e) => {
        setError(e);
        setIsLoading(false);
      },
    );
    return unsub;
  }, [user]);

  const solveDoubt = useCallback(
    async (config: DoubtConfig) => {
      if (!user) return null;
      setIsSolving(true);
      try {
        const response = await authedFetch('/api/notes/doubt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...config, uid: user.uid }),
        });
        const data = await response.json();
        setIsSolving(false);
        if (data.success && data.doubt) {
          // Save to Firestore
          const result = await doubtService.createDoubt(user.uid, {
            question: config.question,
            subject: config.subject,
            topic: config.topic,
            solution: data.doubt.solution,
            solutionMethods: data.doubt.solutionMethods,
            commonMistakes: data.doubt.commonMistakes,
            examTips: data.doubt.examTips,
            relatedTopics: data.doubt.relatedTopics,
            followUpQuestions: data.doubt.followUpQuestions,
            teacherId: config.teacherId,
            isResolved: true,
          });
          if (result.success) {
            toast.success('Doubt solved!', { description: 'Solution saved to history.' });
          }
          return data.doubt;
        }
        toast.error('Failed to solve doubt', {
          description: data.error ?? 'Unknown error',
        });
        return null;
      } catch (err) {
        setIsSolving(false);
        toast.error('Failed to solve doubt', {
          description: err instanceof Error ? err.message : 'Unknown error',
        });
        return null;
      }
    },
    [user],
  );

  const deleteDoubt = useCallback(async (doubtId: string) => {
    return doubtService.deleteDoubt(doubtId);
  }, []);

  return {
    doubts: user ? doubts : [],
    isLoading: user ? isLoading : false,
    isSolving,
    error,
    solveDoubt,
    deleteDoubt,
  };
}
