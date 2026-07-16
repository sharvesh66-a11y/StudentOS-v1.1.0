/**
 * StudentOS Junova AI — Constants
 *
 * Personality presets, teaching styles, subjects, DNA trait metadata,
 * and theme colors. Used by the teacher form, DNA editor, and prompt builder.
 */

import type { PersonalityPreset, TeacherDNA, TeachingStyle } from './types';

// ---------------------------------------------------------------------------
// Personality presets — starting DNA templates
// ---------------------------------------------------------------------------

export const PERSONALITY_PRESETS: Record<
  PersonalityPreset,
  { label: string; description: string; dna: TeacherDNA }
> = {
  'friendly-mentor': {
    label: 'Friendly Mentor',
    description: 'Warm, patient, and encouraging. Great for beginners.',
    dna: {
      friendliness: 85,
      strictness: 35,
      humor: 50,
      explanationDepth: 70,
      patience: 90,
      motivation: 80,
      emojiUsage: 30,
      storytelling: 60,
      realLifeExamples: 70,
      examFocused: false,
      difficulty: 'beginner',
    },
  },
  'strict-professor': {
    label: 'Strict Professor',
    description: 'Rigorous and demanding. Pushes you to master the details.',
    dna: {
      friendliness: 40,
      strictness: 85,
      humor: 15,
      explanationDepth: 85,
      patience: 60,
      motivation: 55,
      emojiUsage: 5,
      storytelling: 30,
      realLifeExamples: 50,
      examFocused: true,
      difficulty: 'advanced',
    },
  },
  'study-buddy': {
    label: 'Study Buddy',
    description: 'Casual, fun, and relatable. Makes learning feel social.',
    dna: {
      friendliness: 80,
      strictness: 30,
      humor: 75,
      explanationDepth: 50,
      patience: 85,
      motivation: 70,
      emojiUsage: 60,
      storytelling: 55,
      realLifeExamples: 65,
      examFocused: false,
      difficulty: 'intermediate',
    },
  },
  'exam-coach': {
    label: 'Exam Coach',
    description: 'Focused on marks, past papers, and exam technique.',
    dna: {
      friendliness: 60,
      strictness: 75,
      humor: 30,
      explanationDepth: 70,
      patience: 70,
      motivation: 85,
      emojiUsage: 15,
      storytelling: 40,
      realLifeExamples: 50,
      examFocused: true,
      difficulty: 'advanced',
    },
  },
  'creative-guide': {
    label: 'Creative Guide',
    description: 'Inspiring and imaginative. Uses stories and analogies.',
    dna: {
      friendliness: 75,
      strictness: 40,
      humor: 60,
      explanationDepth: 65,
      patience: 80,
      motivation: 75,
      emojiUsage: 40,
      storytelling: 85,
      realLifeExamples: 80,
      examFocused: false,
      difficulty: 'intermediate',
    },
  },
  custom: {
    label: 'Custom',
    description: 'Start from scratch and tune every trait yourself.',
    dna: {
      friendliness: 50,
      strictness: 50,
      humor: 50,
      explanationDepth: 50,
      patience: 50,
      motivation: 50,
      emojiUsage: 50,
      storytelling: 50,
      realLifeExamples: 50,
      examFocused: false,
      difficulty: 'intermediate',
    },
  },
};

// ---------------------------------------------------------------------------
// Teaching styles
// ---------------------------------------------------------------------------

export const TEACHING_STYLES: Record<TeachingStyle, { label: string; description: string }> = {
  socratic: {
    label: 'Socratic',
    description: 'Asks guiding questions to help you discover answers yourself.',
  },
  lecture: {
    label: 'Lecture',
    description: 'Delivers structured explanations in a clear, academic tone.',
  },
  'hands-on': {
    label: 'Hands-on',
    description: 'Uses exercises and examples you can try immediately.',
  },
  visual: {
    label: 'Visual',
    description: 'Uses diagrams, tables, and visual metaphors.',
  },
  'story-based': {
    label: 'Story-based',
    description: 'Teaches through narratives and real-world scenarios.',
  },
};

// ---------------------------------------------------------------------------
// Subjects
// ---------------------------------------------------------------------------

export const SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'English Literature',
  'English Language',
  'History',
  'Geography',
  'Economics',
  'Business Studies',
  'Psychology',
  'Sociology',
  'Philosophy',
  'Art & Design',
  'Music',
  'Foreign Languages',
  'General Studies',
  'Other',
] as const;

// ---------------------------------------------------------------------------
// DNA trait metadata — used by the DNA editor UI
// ---------------------------------------------------------------------------

export interface DNATraitMeta {
  key: keyof TeacherDNA;
  label: string;
  description: string;
  /** When true, the trait is a boolean (not a 0–100 slider). */
  isBoolean?: boolean;
}

export const DNA_TRAITS: DNATraitMeta[] = [
  {
    key: 'friendliness',
    label: 'Friendliness',
    description: 'How warm and approachable the teacher is.',
  },
  {
    key: 'strictness',
    label: 'Strictness',
    description: 'How demanding the teacher is about correctness.',
  },
  {
    key: 'humor',
    label: 'Humor',
    description: 'How often the teacher uses humor.',
  },
  {
    key: 'explanationDepth',
    label: 'Explanation Depth',
    description: 'How detailed explanations are.',
  },
  {
    key: 'patience',
    label: 'Patience',
    description: 'How patient the teacher is with repeated questions.',
  },
  {
    key: 'motivation',
    label: 'Motivation',
    description: 'How much the teacher encourages and motivates.',
  },
  {
    key: 'emojiUsage',
    label: 'Emoji Usage',
    description: 'How often the teacher uses emojis.',
  },
  {
    key: 'storytelling',
    label: 'Storytelling',
    description: 'How often the teacher uses stories and analogies.',
  },
  {
    key: 'realLifeExamples',
    label: 'Real-life Examples',
    description: 'How often the teacher connects to real-world examples.',
  },
  {
    key: 'examFocused',
    label: 'Exam-focused Mode',
    description: 'Prioritize exam-style questions and marking schemes.',
    isBoolean: true,
  },
];

// ---------------------------------------------------------------------------
// Theme colors — teacher accent colors
// ---------------------------------------------------------------------------

export const THEME_COLORS = [
  '#7c3aed', // purple (brand)
  '#3b82f6', // blue (brand secondary)
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
] as const;

// ---------------------------------------------------------------------------
// Difficulty levels
// ---------------------------------------------------------------------------

export const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner', description: 'Simple language, foundational concepts.' },
  {
    value: 'intermediate',
    label: 'Intermediate',
    description: 'Moderate depth, some technical terms.',
  },
  { value: 'advanced', label: 'Advanced', description: 'Full rigor, technical vocabulary.' },
] as const;
