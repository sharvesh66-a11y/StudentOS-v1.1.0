'use client';

/**
 * StudentOS Junova AI — useMemory Hook
 *
 * Real-time subscription to the student's long-term memory, plus update
 * actions. The memory document lives at `junova_memory/{uid}`.
 *
 * @see src/features/junova/services/memory.service.ts
 */

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/features/auth';
import { memoryService, type MemoryUpdate } from '../services/memory.service';
import type { StudentMemory } from '../types';
import type { StudentOSFirebaseError } from '@/firebase';
import { toast } from 'sonner';

export function useMemory() {
  const { user } = useAuth();
  const [memory, setMemory] = useState<StudentMemory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<StudentOSFirebaseError | null>(null);

  // Subscribe to memory in real-time when user is available
  useEffect(() => {
    if (!user) return;

    const unsubscribe = memoryService.subscribeToMemory(
      user.uid,
      (next) => {
        setMemory(next);
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

  // Ensure memory doc exists (called once when user signs in)
  const ensureExists = useCallback(async () => {
    if (!user) return;
    await memoryService.ensureMemoryExists(user.uid);
  }, [user]);

  // Update specific memory fields
  const update = useCallback(
    async (updates: MemoryUpdate) => {
      if (!user) return;
      const result = await memoryService.updateMemory(user.uid, updates);
      if (!result.success && result.error) {
        toast.error('Failed to update memory', { description: result.error.message });
      }
      return result;
    },
    [user],
  );

  // Add a weak topic (deduplicates)
  const addWeakTopic = useCallback(
    async (topic: string) => {
      if (!user) return;
      return memoryService.addWeakTopic(user.uid, topic);
    },
    [user],
  );

  // Add a strong topic (deduplicates)
  const addStrongTopic = useCallback(
    async (topic: string) => {
      if (!user) return;
      return memoryService.addStrongTopic(user.uid, topic);
    },
    [user],
  );

  // Add a recent topic (keeps last 10)
  const addRecentTopic = useCallback(
    async (topic: string) => {
      if (!user) return;
      return memoryService.addRecentTopic(user.uid, topic);
    },
    [user],
  );

  // Record a revision entry
  const recordRevision = useCallback(
    async (entry: { topic: string; subject: string; confidence: number }) => {
      if (!user) return;
      return memoryService.recordRevision(user.uid, entry);
    },
    [user],
  );

  return {
    memory,
    isLoading: user ? isLoading : false,
    error,
    ensureExists,
    update,
    addWeakTopic,
    addStrongTopic,
    addRecentTopic,
    recordRevision,
  };
}
