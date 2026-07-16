/**
 * StudentOS Junova AI — Validation Schemas (Zod)
 *
 * Schemas for teacher creation/editing and DNA configuration.
 */

import { z } from 'zod';
import { DEFAULT_DNA } from '../types';

// ---------------------------------------------------------------------------
// Teacher DNA schema
// ---------------------------------------------------------------------------

export const teacherDNASchema = z.object({
  friendliness: z.number().min(0).max(100),
  strictness: z.number().min(0).max(100),
  humor: z.number().min(0).max(100),
  explanationDepth: z.number().min(0).max(100),
  patience: z.number().min(0).max(100),
  motivation: z.number().min(0).max(100),
  emojiUsage: z.number().min(0).max(100),
  storytelling: z.number().min(0).max(100),
  realLifeExamples: z.number().min(0).max(100),
  examFocused: z.boolean(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
});

// ---------------------------------------------------------------------------
// Teacher form schema
// ---------------------------------------------------------------------------

export const teacherFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters.')
    .max(50, 'Name must be at most 50 characters.'),
  avatarURL: z.string().url('Please enter a valid URL.').nullable().optional(),
  subject: z.string().min(1, 'Please select a subject.'),
  preset: z.enum([
    'friendly-mentor',
    'strict-professor',
    'study-buddy',
    'exam-coach',
    'creative-guide',
    'custom',
  ]),
  teachingStyle: z.enum(['socratic', 'lecture', 'hands-on', 'visual', 'story-based']),
  bio: z.string().max(300, 'Bio must be at most 300 characters.'),
  themeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Please pick a theme color.'),
  dna: teacherDNASchema,
});

export type TeacherFormValues = z.infer<typeof teacherFormSchema>;

/** Default form values — uses DEFAULT_DNA. */
export const DEFAULT_TEACHER_FORM: TeacherFormValues = {
  name: '',
  avatarURL: null,
  subject: 'Mathematics',
  preset: 'friendly-mentor',
  teachingStyle: 'socratic',
  bio: '',
  themeColor: '#7c3aed',
  dna: DEFAULT_DNA,
};
