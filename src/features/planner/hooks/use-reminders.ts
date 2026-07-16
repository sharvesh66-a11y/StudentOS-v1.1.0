'use client';

/**
 * StudentOS Planner — useReminders Hook
 */

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/features/auth';
import { reminderService, type CreateReminderInput } from '../services/reminder.service';
import type { Reminder } from '../types';
import { toast } from 'sonner';

export function useReminders() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = reminderService.subscribeToReminders(user.uid, (next) => {
      setReminders(next);
      setIsLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const createReminder = useCallback(
    async (input: CreateReminderInput) => {
      if (!user) return;
      const result = await reminderService.createReminder(user.uid, input);
      if (result.success) toast.success('Reminder created');
      return result;
    },
    [user],
  );

  const dismiss = useCallback(async (reminderId: string) => {
    return reminderService.dismissReminder(reminderId);
  }, []);

  const complete = useCallback(async (reminderId: string) => {
    return reminderService.completeReminder(reminderId);
  }, []);

  const remove = useCallback(async (reminderId: string) => {
    return reminderService.deleteReminder(reminderId);
  }, []);

  return {
    reminders,
    isLoading: user ? isLoading : false,
    createReminder,
    dismiss,
    complete,
    remove,
  };
}
