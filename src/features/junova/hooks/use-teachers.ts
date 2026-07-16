'use client';

/**
 * StudentOS Junova AI — useTeachers Hook
 *
 * Real-time subscription to the user's AI teachers, plus CRUD actions.
 * Uses the teacher service layer — no direct Firestore calls.
 *
 * @see src/features/junova/services/teacher.service.ts
 */

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/features/auth';
import {
  teacherService,
  type CreateTeacherInput,
  type UpdateTeacherInput,
} from '../services/teacher.service';
import type { AITeacher } from '../types';
import type { StudentOSFirebaseError } from '@/firebase';
import { toast } from 'sonner';

export function useTeachers() {
  const { user } = useAuth();
  const [internalTeachers, setInternalTeachers] = useState<AITeacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<StudentOSFirebaseError | null>(null);

  // Subscribe to teachers in real-time when user is available
  useEffect(() => {
    if (!user) return;

    const unsubscribe = teacherService.subscribeToTeachers(
      user.uid,
      (next) => {
        setInternalTeachers(next);
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

  // Derived state: empty list when no user
  const teachers = user ? internalTeachers : [];

  const create = useCallback(
    async (input: CreateTeacherInput) => {
      if (!user) {
        return {
          success: false,
          error: { code: 'no-user', message: 'Not signed in', service: 'auth' as const },
        };
      }
      const result = await teacherService.createTeacher(user.uid, input);
      if (result.success) {
        toast.success('Teacher created', { description: `${input.name} is ready to chat.` });
      } else if (result.error) {
        toast.error('Failed to create teacher', { description: result.error.message });
      }
      return result;
    },
    [user],
  );

  const update = useCallback(async (teacherId: string, updates: UpdateTeacherInput) => {
    const result = await teacherService.updateTeacher(teacherId, updates);
    if (result.success) {
      toast.success('Teacher updated');
    } else if (result.error) {
      toast.error('Failed to update teacher', { description: result.error.message });
    }
    return result;
  }, []);

  const remove = useCallback(async (teacherId: string) => {
    const result = await teacherService.deleteTeacher(teacherId);
    if (result.success) {
      toast.success('Teacher deleted');
    } else if (result.error) {
      toast.error('Failed to delete teacher', { description: result.error.message });
    }
    return result;
  }, []);

  return {
    teachers,
    isLoading: user ? isLoading : false,
    error,
    create,
    update,
    remove,
  };
}
