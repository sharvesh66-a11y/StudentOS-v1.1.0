/**
 * StudentOS Shared Types
 *
 * Global, cross-feature TypeScript types live here.
 * Feature-specific types stay inside `src/features/<feature>/types.ts`.
 *
 * Keep this file lean — only types that span multiple modules belong here.
 */

/** Branded type for IDs — prevents accidental cross-assignment. */
export type ID<T extends string = string> = string & { readonly __brand: `ID:${T}` };

export type UserID = ID<'User'>;
export type NoteID = ID<'Note'>;
export type QuizID = ID<'Quiz'>;
export type PlanID = ID<'Plan'>;
export type SessionID = ID<'Session'>;

/** ISO 8601 timestamp string. */
export type ISODateString = string;

/** Standard API response envelope. */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/** Paginated response envelope. */
export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/** Generic loading state — used by hooks and stores. */
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T = unknown, E = Error> {
  status: AsyncStatus;
  data?: T;
  error?: E;
}

/** Priority enum — used by tasks, planner items, todos. */
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

/** Difficulty enum — used by quizzes, exams, learning content. */
export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

/** Subject category — extensible via Firestore in future sprints. */
export interface Subject {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

/** Empty placeholder for future Junova AI message types (Sprint 4). */
export interface JunovaMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: ISODateString;
  metadata?: Record<string, unknown>;
}
