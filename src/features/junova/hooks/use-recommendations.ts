'use client';

/**
 * StudentOS Junova AI — useRecommendations Hook
 *
 * Real-time subscription to the student's AI recommendations, plus a refresh
 * action that calls the recommendations API to generate new recommendations.
 *
 * @see src/features/junova/services/recommendation.service.ts
 * @see src/app/api/junova/recommendations/route.ts
 */

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/features/auth';
import { authedFetch } from '@/lib/api-client';
import { recommendationService } from '../services/recommendation.service';
import { useTeachers } from './use-teachers';
import { useMemory } from './use-memory';
import type { AIRecommendations } from '../types';
import type { StudentOSFirebaseError } from '@/firebase';
import { toast } from 'sonner';

export function useRecommendations() {
  const { user } = useAuth();
  const { teachers } = useTeachers();
  const { memory } = useMemory();

  const [recommendations, setRecommendations] = useState<AIRecommendations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<StudentOSFirebaseError | null>(null);

  // Subscribe to recommendations in real-time
  useEffect(() => {
    if (!user) return;

    const unsubscribe = recommendationService.subscribeToRecommendations(
      user.uid,
      (next) => {
        setRecommendations(next);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        setError(err);
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, [user]);

  // Refresh recommendations — calls the AI API with current memory + teachers
  const refresh = useCallback(async () => {
    if (!user || !memory) {
      toast.error('Cannot generate recommendations', {
        description: 'Memory not yet loaded. Please try again in a moment.',
      });
      return;
    }

    setIsRefreshing(true);
    try {
      const response = await authedFetch('/api/junova/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memory,
          teachers,
        }),
      });

      const data = await response.json();

      if (data.success && data.recommendations) {
        // Save to Firestore
        const saveResult = await recommendationService.saveRecommendations(
          user.uid,
          data.recommendations,
        );

        if (saveResult.success) {
          toast.success('Recommendations updated', {
            description: 'Your study plan has been refreshed.',
          });
        } else if (saveResult.error) {
          toast.error('Failed to save recommendations', {
            description: saveResult.error.message,
          });
        }
      } else {
        toast.error('Failed to generate recommendations', {
          description: data.error ?? 'Unknown error',
        });
      }
    } catch (err) {
      toast.error('Failed to refresh recommendations', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [user, memory, teachers]);

  return {
    recommendations,
    isLoading: user ? isLoading : false,
    isRefreshing,
    error,
    refresh,
  };
}
