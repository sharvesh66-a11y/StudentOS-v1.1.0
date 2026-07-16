/**
 * StudentOS Notes Hub — Domain Types
 * @see docs/DATABASE.md for the Firestore schema reference.
 */

// ---------------------------------------------------------------------------
// Note types
// ---------------------------------------------------------------------------

export type NoteType = 'chapter' | 'topic' | 'short' | 'detailed' | 'revision';

export interface KeyPoint {
  text: string;
}
export interface Definition {
  term: string;
  definition: string;
}
export interface Formula {
  name: string;
  formula: string;
  description: string;
}
export interface Example {
  title: string;
  content: string;
}
export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

/**
 * A note — stored at `notes/{noteId}`.
 */
export interface Note {
  id: string;
  uid: string;
  title: string;
  subject: string;
  chapter: string;
  type: NoteType;
  content: string; // Markdown
  summary: string | null;
  keyPoints: KeyPoint[];
  definitions: Definition[];
  formulas: Formula[];
  examples: Example[];
  flashcards: Flashcard[];
  tags: string[];
  labels: string[];
  folderId: string | null;
  isPinned: boolean;
  isFavourite: boolean;
  isBookmarked: boolean;
  isArchived: boolean;
  aiGenerated: boolean;
  attachments: NoteAttachment[];
  createdAt: number;
  updatedAt: number;
}

export interface NoteAttachment {
  id: string;
  type: 'image' | 'pdf' | 'document';
  url: string;
  filename: string;
  uploadedAt: number;
}

// ---------------------------------------------------------------------------
// Note Folder
// ---------------------------------------------------------------------------

export interface NoteFolder {
  id: string;
  uid: string;
  name: string;
  parentId: string | null;
  createdAt: number;
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// Doubt History
// ---------------------------------------------------------------------------

export interface Doubt {
  id: string;
  uid: string;
  question: string;
  subject: string;
  topic: string;
  solution: string; // Markdown
  solutionMethods: string[];
  commonMistakes: string[];
  examTips: string[];
  relatedTopics: string[];
  followUpQuestions: string[];
  teacherId: string | null;
  isResolved: boolean;
  createdAt: number;
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// AI Generation Config
// ---------------------------------------------------------------------------

export interface NoteGenerationConfig {
  subject: string;
  chapter: string;
  topic: string;
  type: NoteType;
  teacherId: string | null;
}

export const DEFAULT_NOTE_CONFIG: NoteGenerationConfig = {
  subject: 'Mathematics',
  chapter: '',
  topic: '',
  type: 'detailed',
  teacherId: null,
};

export interface DoubtConfig {
  question: string;
  subject: string;
  topic: string;
  teacherId: string | null;
}
