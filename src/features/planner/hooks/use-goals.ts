'use client';

/**
 * StudentOS Planner — useGoals Hook
 *
 * Real-time subscription to goals + revisions, plus CRUD actions.
 */

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/features/auth';
import { goalService, type CreateGoalInput } from '../services/goal.service';
import type { Goal, Revision } from '../types';
import { toast } from 'sonner';

export function useGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubGoals = goalService.subscribeToGoals(user.uid, (next) => {
      setGoals(next);
      setIsLoading(false);
    });
    const unsubRevisions = goalService.subscribeToRevisions(user.uid, (next) => {
      setRevisions(next);
    });

    return () => {
      unsubGoals();
      unsubRevisions();
    };
  }, [user]);

  const createGoal = useCallback(
    async (input: CreateGoalInput) => {
      if (!user) return null;
      const result = await goalService.createGoal(user.uid, input);
      if (result.success && result.data) return result.data;
      return null;
    },
    [user],
  );

  const updateProgress = useCallback(async (goalId: string, progress: number) => {
    const result = await goalService.updateGoalProgress(goalId, progress);
    if (result.success && progress >= 100) toast.success('Goal achieved! 🎉');
    return result;
  }, []);

  const deleteGoal = useCallback(async (goalId: string) => {
    return goalService.deleteGoal(goalId);
  }, []);

  const completeRevision = useCallback(async (revisionId: string, confidence: number) => {
    const result = await goalService.completeRevision(revisionId, confidence);
    if (result.success) toast.success('Revision completed');
    return result;
  }, []);

  const deleteRevision = useCallback(async (revisionId: string) => {
    return goalService.deleteRevision(revisionId);
  }, []);

  return {
    goals,
    revisions,
    isLoading: user ? isLoading : false,
    createGoal,
    updateProgress,
    deleteGoal,
    completeRevision,
    deleteRevision,
  };
}
