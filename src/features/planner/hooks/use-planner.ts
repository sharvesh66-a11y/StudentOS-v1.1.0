'use client';

/**
 * StudentOS Planner — usePlanner Hook
 *
 * Real-time subscription to study plans + sessions, plus CRUD actions.
 * Also exposes AI plan generation via the /api/planner/generate endpoint.
 */

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/features/auth';
import { authedFetch } from '@/lib/api-client';
import { plannerService, type CreatePlanInput } from '../services/planner.service';
import { sessionService, type CreateSessionInput } from '../services/session.service';
import type { StudyPlan, StudySession, SessionStatus, ScheduleEngineOutput } from '../types';
import type { StudentOSFirebaseError } from '@/firebase';
import { toast } from 'sonner';

export function usePlanner() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<StudentOSFirebaseError | null>(null);

  useEffect(() => {
    if (!user) return;

    const unsubPlans = plannerService.subscribeToPlans(
      user.uid,
      (next) => setPlans(next),
      (err) => setError(err),
    );
    const unsubSessions = sessionService.subscribeToSessions(
      user.uid,
      (next) => {
        setSessions(next);
        setIsLoading(false);
      },
      (err) => setError(err),
    );

    return () => {
      unsubPlans();
      unsubSessions();
    };
  }, [user]);

  const createPlan = useCallback(
    async (input: CreatePlanInput) => {
      if (!user) return null;
      const result = await plannerService.createPlan(user.uid, input);
      if (result.success && result.data) return result.data;
      if (result.error) toast.error('Failed to create plan', { description: result.error.message });
      return null;
    },
    [user],
  );

  const createSessions = useCallback(
    async (inputs: CreateSessionInput[], planId: string | null) => {
      if (!user) return;
      const result = await sessionService.createSessions(user.uid, inputs);
      if (result.success && planId) {
        // Update plan's totalMinutes
        const total = inputs
          .filter((i) => !i.isBreak)
          .reduce((sum, i) => sum + i.durationMinutes, 0);
        await plannerService.updatePlan(planId, { totalMinutes: total });
      }
      if (!result.success && result.error) {
        toast.error('Failed to create sessions', { description: result.error.message });
      }
    },
    [user],
  );

  const updateSessionStatus = useCallback(async (sessionId: string, status: SessionStatus) => {
    const result = await sessionService.updateSessionStatus(sessionId, status);
    if (!result.success && result.error) {
      toast.error('Failed to update session', { description: result.error.message });
    }
    return result;
  }, []);

  const deletePlan = useCallback(async (planId: string) => {
    const result = await plannerService.deletePlan(planId);
    if (result.success) toast.success('Plan deleted');
    return result;
  }, []);

  const deleteSession = useCallback(async (sessionId: string) => {
    return sessionService.deleteSession(sessionId);
  }, []);

  /** Generate an AI-powered study plan */
  const generateAIPlan = useCallback(
    async (params: {
      memory: unknown;
      startDate: string;
      endDate: string;
      dailyAvailableMinutes: number;
      preferredStartTime: string;
      preferredEndTime: string;
      examDates?: { subject: string; date: string }[];
    }) => {
      setIsGenerating(true);
      try {
        const response = await authedFetch('/api/planner/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });
        const data = await response.json();

        if (data.success) {
          toast.success('AI plan generated', {
            description: `${data.sessionCount} sessions scheduled (${Math.floor(data.totalMinutes / 60)}h ${data.totalMinutes % 60}m)`,
          });
          return data as ScheduleEngineOutput & {
            goals: { title: string; type: string; target: string }[];
          };
        } else {
          toast.error('AI generation failed', { description: data.error });
          return null;
        }
      } catch (err) {
        toast.error('Failed to generate plan', {
          description: err instanceof Error ? err.message : 'Unknown error',
        });
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [],
  );

  return {
    plans,
    sessions,
    isLoading: user ? isLoading : false,
    isGenerating,
    error,
    createPlan,
    createSessions,
    updateSessionStatus,
    deletePlan,
    deleteSession,
    generateAIPlan,
  };
}
