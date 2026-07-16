'use client';

/**
 * StudentOS Junova AI — useLiveTeacher Hook
 *
 * Real-time subscription to live session settings + avatar state management.
 * Controls avatar expression, animation speed, and classroom layout toggles.
 *
 * @see src/features/junova/services/live-teacher.service.ts
 */

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/features/auth';
import { liveTeacherService, type LiveSessionUpdate } from '../services/live-teacher.service';
import type { LiveSessionSettings, AvatarExpression } from '../types';
import type { StudentOSFirebaseError } from '@/firebase';
import { toast } from 'sonner';

export function useLiveTeacher() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<LiveSessionSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<StudentOSFirebaseError | null>(null);
  const [currentExpression, setCurrentExpression] = useState<AvatarExpression>('neutral');

  // Subscribe to settings in real-time
  useEffect(() => {
    if (!user) return;

    const unsubscribe = liveTeacherService.subscribeToLiveSessionSettings(
      user.uid,
      (next) => {
        setSettings(next);
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

  // Ensure settings doc exists
  const ensureExists = useCallback(async () => {
    if (!user) return;
    await liveTeacherService.ensureLiveSessionExists(user.uid);
  }, [user]);

  // Update specific settings
  const update = useCallback(
    async (updates: LiveSessionUpdate) => {
      if (!user) return;
      const result = await liveTeacherService.updateLiveSessionSettings(user.uid, updates);
      if (!result.success && result.error) {
        toast.error('Failed to update live session settings', {
          description: result.error.message,
        });
      }
      return result;
    },
    [user],
  );

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(async () => {
    if (!settings) return;
    await update({ fullscreenMode: !settings.fullscreenMode });
  }, [settings, update]);

  // Toggle whiteboard
  const toggleWhiteboard = useCallback(async () => {
    if (!settings) return;
    await update({ whiteboardEnabled: !settings.whiteboardEnabled });
  }, [settings, update]);

  // Set avatar expression
  const setExpression = useCallback((expression: AvatarExpression) => {
    setCurrentExpression(expression);
  }, []);

  return {
    settings,
    isLoading: user ? isLoading : false,
    error,
    currentExpression,
    setExpression,
    ensureExists,
    update,
    toggleFullscreen,
    toggleWhiteboard,
  };
}
