/**
 * StudentOS Exam Center — Constants
 */

import type { QuestionType, Difficulty } from './types';

export const QUESTION_TYPES: { value: QuestionType; label: string; description: string }[] = [
  { value: 'mcq', label: 'Multiple Choice', description: 'Select one answer from options.' },
  { value: 'true-false', label: 'True / False', description: 'Binary choice.' },
  {
    value: 'fill-blank',
    label: 'Fill in the Blanks',
    description: 'Type the missing word/phrase.',
  },
  { value: 'short-answer', label: 'Short Answer', description: '1-2 sentence response.' },
  { value: 'long-answer', label: 'Long Answer', description: 'Paragraph-length response.' },
];

export const DIFFICULTIES: { value: Difficulty; label: string; color: string }[] = [
  { value: 'easy', label: 'Easy', color: 'text-emerald-500' },
  { value: 'medium', label: 'Medium', color: 'text-amber-500' },
  { value: 'hard', label: 'Hard', color: 'text-destructive' },
];

export const QUESTION_COUNT_OPTIONS = [5, 10, 15, 20, 25];

export const TIME_LIMIT_OPTIONS = [
  { value: 0, label: 'No limit' },
  { value: 5, label: '5 minutes' },
  { value: 10, label: '10 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '60 minutes' },
];

export const PRACTICE_MODES: { value: string; label: string; description: string; icon: string }[] =
  [
    {
      value: 'daily',
      label: 'Daily Practice',
      description: 'A quick daily quiz to keep your skills sharp.',
      icon: 'calendar',
    },
    {
      value: 'weak-topics',
      label: 'Practice Weak Topics',
      description: 'Focus on areas where you struggle.',
      icon: 'alert-circle',
    },
    {
      value: 'strong-topics',
      label: 'Practice Strong Topics',
      description: 'Reinforce what you already know.',
      icon: 'check-circle',
    },
    {
      value: 'timed',
      label: 'Timed Practice',
      description: 'Practice under time pressure.',
      icon: 'clock',
    },
    {
      value: 'adaptive',
      label: 'Adaptive Difficulty',
      description: 'Questions adjust to your skill level.',
      icon: 'trending-up',
    },
    {
      value: 'retry-incorrect',
      label: 'Retry Incorrect',
      description: 'Redo questions you got wrong before.',
      icon: 'rotate-ccw',
    },
    {
      value: 'ai-suggested',
      label: 'AI Suggested',
      description: 'Junova picks the best practice for you.',
      icon: 'sparkles',
    },
  ];

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'hi', label: 'Hindi' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ar', label: 'Arabic' },
  { code: 'pt', label: 'Portuguese' },
];
