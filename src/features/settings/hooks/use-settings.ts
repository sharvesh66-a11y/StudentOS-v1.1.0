'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth';
import { settingsService } from '../services/settings.service';
import type { UserSettings } from '../../tools/types';
import { DEFAULT_USER_SETTINGS } from '../../tools/types';

export function useSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub = settingsService.subscribeToSettings(user.uid, (next) => {
      setSettings(next);
      setIsLoading(false);
    });
    void settingsService.ensureSettings(user.uid);
    return unsub;
  }, [user]);

  const update = async (updates: Partial<UserSettings>) => {
    if (!user) return;
    await settingsService.updateSettings(user.uid, updates);
  };

  return {
    settings: settings ?? { ...DEFAULT_USER_SETTINGS, uid: user?.uid ?? '' },
    isLoading: user ? isLoading : false,
    update,
  };
}
