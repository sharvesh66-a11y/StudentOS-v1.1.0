'use client';
/**
 * StudentOS Exam Center — useQuizzes Hook
 * Real-time subscription to user's quizzes + CRUD.
 */
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/features/auth';
import { quizService } from '../services/quiz.service';
import type { Quiz } from '../types';
import type { StudentOSFirebaseError } from '@/firebase';
import { toast } from 'sonner';

export function useQuizzes() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<StudentOSFirebaseError | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = quizService.subscribeToQuizzes(
      user.uid,
      (next) => {
        setQuizzes(next);
        setIsLoading(false);
      },
      (e) => {
        setError(e);
        setIsLoading(false);
      },
    );
    return unsub;
  }, [user]);

  const remove = useCallback(async (quizId: string) => {
    const result = await quizService.deleteQuiz(quizId);
    if (result.success) toast.success('Quiz deleted');
    else if (result.error)
      toast.error('Failed to delete quiz', { description: result.error.message });
    return result;
  }, []);

  return { quizzes: user ? quizzes : [], isLoading: user ? isLoading : false, error, remove };
}
