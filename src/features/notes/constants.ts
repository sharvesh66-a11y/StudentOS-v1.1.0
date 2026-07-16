/**
 * StudentOS Notes Hub — Constants
 */
import type { NoteType } from './types';

export const NOTE_TYPES: { value: NoteType; label: string; description: string }[] = [
  {
    value: 'chapter',
    label: 'Chapter Notes',
    description: 'Comprehensive notes for an entire chapter.',
  },
  { value: 'topic', label: 'Topic Notes', description: 'Focused notes on a specific topic.' },
  { value: 'short', label: 'Short Notes', description: 'Quick reference — key points only.' },
  {
    value: 'detailed',
    label: 'Detailed Notes',
    description: 'In-depth with examples, formulas, definitions.',
  },
  { value: 'revision', label: 'Revision Notes', description: 'Condensed for last-minute review.' },
];
