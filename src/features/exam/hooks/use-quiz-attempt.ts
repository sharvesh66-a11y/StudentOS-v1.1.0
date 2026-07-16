'use client';
/**
 * StudentOS Exam Center — useQuizAttempt Hook
 * Manages active quiz state: create attempt, save answers, navigate, submit, grade.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/features/auth';
import { attemptService } from '../services/attempt.service';
import { quizService } from '../services/quiz.service';
import type { Quiz, QuizAttempt, QuizResult } from '../types';
import { toast } from 'sonner';

export function useQuizAttempt() {
  const { user } = useAuth();
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const submitRef = useRef<(() => void) | null>(null);

  const startQuiz = useCallback(
    async (quiz: Quiz) => {
      if (!user) return;
      const result = await attemptService.createAttempt(user.uid, quiz);
      if (result.success && result.data) {
        setActiveQuiz(quiz);
        setAttempt(result.data);
        setCurrentIndex(0);
        setAnswers({});
        setResult(null);
        if (quiz.timeLimitMinutes > 0) setTimeRemaining(quiz.timeLimitMinutes * 60);
      }
    },
    [user],
  );

  const setAnswer = useCallback(
    (questionId: string, answer: string) => {
      setAnswers((prev) => ({ ...prev, [questionId]: answer }));
      if (attempt) {
        void attemptService.saveAnswer(attempt.id, questionId, answer, currentIndex);
      }
    },
    [attempt, currentIndex],
  );

  const goToQuestion = useCallback((index: number) => setCurrentIndex(index), []);
  const nextQuestion = useCallback(() => {
    if (activeQuiz && currentIndex < activeQuiz.questions.length - 1)
      setCurrentIndex(currentIndex + 1);
  }, [activeQuiz, currentIndex]);
  const prevQuestion = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  }, [currentIndex]);

  const submitQuiz = useCallback(async () => {
    if (!activeQuiz || !attempt || !user || isSubmitting) return;
    setIsSubmitting(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const result = await attemptService.submitAttempt(attempt.id, activeQuiz, user.uid);
    setIsSubmitting(false);
    if (result.success && result.data) {
      setResult(result.data);
      await quizService.updateQuiz(activeQuiz.id, { status: 'completed' });
      toast.success('Quiz submitted!', { description: `Score: ${result.data.score}%` });
    } else {
      toast.error('Failed to submit quiz');
    }
  }, [activeQuiz, attempt, user, isSubmitting]);

  // Keep ref updated for timer
  useEffect(() => {
    submitRef.current = submitQuiz;
  }, [submitQuiz]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (timeRemaining !== null && timeRemaining <= 0) {
        toast.info('Time is up! Auto-submitting...');
        submitRef.current?.();
      }
      return;
    }
    timerRef.current = setInterval(() => setTimeRemaining((prev) => (prev ?? 0) - 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeRemaining]);

  const retryQuiz = useCallback(() => {
    setResult(null);
    setAnswers({});
    setCurrentIndex(0);
    if (activeQuiz) startQuiz(activeQuiz);
  }, [activeQuiz, startQuiz]);

  const exitQuiz = useCallback(() => {
    setActiveQuiz(null);
    setAttempt(null);
    setResult(null);
    setAnswers({});
    setCurrentIndex(0);
    setTimeRemaining(null);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return {
    activeQuiz,
    attempt,
    currentIndex,
    answers,
    result,
    isSubmitting,
    timeRemaining,
    startQuiz,
    setAnswer,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    submitQuiz,
    retryQuiz,
    exitQuiz,
  };
}
