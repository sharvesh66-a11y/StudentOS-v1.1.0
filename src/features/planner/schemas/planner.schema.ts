/**
 * StudentOS Planner — Validation Schemas (Zod)
 *
 * Schemas for plan creation, goal creation, and reminder creation.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Plan creation schema
// ---------------------------------------------------------------------------

export const createPlanSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters.').max(100, 'Title is too long.'),
  type: z.enum(['daily', 'weekly', 'monthly', 'custom']),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD.'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD.'),
  subjects: z.array(z.string()).min(1, 'Select at least one subject.'),
  difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']),
});

export type CreatePlanValues = z.infer<typeof createPlanSchema>;

// ---------------------------------------------------------------------------
// Goal creation schema
// ---------------------------------------------------------------------------

export const createGoalSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters.').max(100, 'Title is too long.'),
  description: z.string().max(500, 'Description is too long.').optional().default(''),
  type: z.enum(['daily', 'weekly', 'monthly', 'exam', 'subject', 'custom']),
  target: z.string().min(1, 'Target is required.'),
  subject: z.string().nullable().optional(),
  targetDate: z.string().nullable().optional(),
});

export type CreateGoalValues = z.infer<typeof createGoalSchema>;

// ---------------------------------------------------------------------------
// Reminder creation schema
// ---------------------------------------------------------------------------

export const createReminderSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters.').max(100, 'Title is too long.'),
  message: z.string().max(300, 'Message is too long.').optional().default(''),
  type: z.enum(['study', 'exam', 'break', 'revision', 'goal', 'custom']),
  scheduledAt: z.string().min(1, 'Scheduled time is required.'),
});

export type CreateReminderValues = z.infer<typeof createReminderSchema>;
