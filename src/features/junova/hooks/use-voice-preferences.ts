'use client';

/**
 * StudentOS Junova AI — useVoicePreferences Hook
 *
 * Real-time subscription to the user's voice preferences, plus update actions.
 *
 * @see src/features/junova/services/voice.service.ts
 */

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/features/auth';
import { voiceService, type VoicePreferencesUpdate } from '../services/voice.service';
import type { VoicePreferences } from '../types';
import type { StudentOSFirebaseError } from '@/firebase';
import { toast } from 'sonner';

export function useVoicePreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<VoicePreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<StudentOSFirebaseError | null>(null);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = voiceService.subscribeToVoicePreferences(
      user.uid,
      (next) => {
        setPreferences(next);
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

  const ensureExists = useCallback(async () => {
    if (!user) return;
    await voiceService.ensureVoicePreferencesExist(user.uid);
  }, [user]);

  const update = useCallback(
    async (updates: VoicePreferencesUpdate) => {
      if (!user) return;
      const result = await voiceService.updateVoicePreferences(user.uid, updates);
      if (!result.success && result.error) {
        toast.error('Failed to update voice preferences', {
          description: result.error.message,
        });
      }
      return result;
    },
    [user],
  );

  return {
    preferences,
    isLoading: user ? isLoading : false,
    error,
    ensureExists,
    update,
  };
}
