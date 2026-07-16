/**
 * StudentOS Exam Center — Quiz Config Validation Schema (Zod)
 */

import { z } from 'zod';

export const quizConfigSchema = z.object({
  subject: z.string().min(1, 'Please select a subject.'),
  chapter: z.string().min(1, 'Please enter a chapter or topic.'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  questionCount: z.number().min(1).max(50),
  questionTypes: z
    .array(z.enum(['mcq', 'true-false', 'fill-blank', 'short-answer', 'long-answer']))
    .min(1, 'Select at least one question type.'),
  timeLimitMinutes: z.number().min(0),
});

export type QuizConfigValues = z.infer<typeof quizConfigSchema>;
