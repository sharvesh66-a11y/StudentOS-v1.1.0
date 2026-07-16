/**
 * Unit tests for the Exam Center Quiz Service.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// --- Mocks --------------------------------------------------------------

const firestoreHelpers = vi.hoisted(() => ({
  createDocument: vi.fn(),
  getDocument: vi.fn(),
  queryCollection: vi.fn(),
  subscribeToDocument: vi.fn(),
  subscribeToQuery: vi.fn(),
  updateDocument: vi.fn(),
  setDocument: vi.fn(),
  deleteDocument: vi.fn(),
}));

vi.mock('@/firebase', () => ({
  COLLECTIONS: {
    EXAM_QUIZZES: 'exam_quizzes',
  },
  firestoreHelpers,
}));

vi.mock('firebase/firestore', () => ({
  where: (field: string, op: string, val: unknown) => ({ kind: 'where', field, op, val }),
  orderBy: (field: string, dir: string) => ({ kind: 'orderBy', field, dir }),
}));

import { createQuiz, getQuiz, updateQuiz, deleteQuiz } from '@/features/exam/services/quiz.service';
import type { QuestionType, QuizStatus, Difficulty } from '@/features/exam/types';

// --- Fixtures ------------------------------------------------------------

const quizInput: {
  title: string;
  subject: string;
  chapter: string;
  difficulty: Difficulty;
  questionCount: number;
  questionTypes: QuestionType[];
  timeLimitMinutes: number;
  aiGenerated: boolean;
  status: QuizStatus;
  questions: [];
} = {
  title: 'Algebra Basics',
  subject: 'Mathematics',
  chapter: 'Ch 1',
  difficulty: 'easy',
  questionCount: 5,
  questionTypes: ['mcq'],
  timeLimitMinutes: 10,
  aiGenerated: true,
  status: 'ready',
  questions: [],
};

// --- Reset ---------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
});

// --- Tests ---------------------------------------------------------------

describe('createQuiz', () => {
  it('calls createDocument with the right collection + payload + returns the quiz', async () => {
    firestoreHelpers.createDocument.mockResolvedValue({ success: true, data: 'new-quiz-id' });

    const result = await createQuiz('u1', quizInput);

    expect(firestoreHelpers.createDocument).toHaveBeenCalledTimes(1);
    const [collectionName, payload] = firestoreHelpers.createDocument.mock.calls[0];
    expect(collectionName).toBe('exam_quizzes');
    expect(payload).toMatchObject({
      uid: 'u1',
      title: 'Algebra Basics',
      subject: 'Mathematics',
      chapter: 'Ch 1',
      difficulty: 'easy',
      questionCount: 5,
      timeLimitMinutes: 10,
      aiGenerated: true,
      status: 'ready',
    });
    expect(payload.createdAt).toBeTypeOf('number');
    expect(payload.updatedAt).toBeTypeOf('number');

    expect(result.success).toBe(true);
    expect(result.data?.id).toBe('new-quiz-id');
    expect(result.data?.uid).toBe('u1');
  });

  it('returns a failure envelope when createDocument reports failure', async () => {
    firestoreHelpers.createDocument.mockResolvedValue({
      success: false,
      error: { code: 'permission-denied', message: 'denied', service: 'firestore' },
    });

    const result = await createQuiz('u1', quizInput);
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('permission-denied');
  });

  it('returns a failure envelope when createDocument throws', async () => {
    const err = new Error('unavailable');
    (err as { code?: string }).code = 'unavailable';
    firestoreHelpers.createDocument.mockRejectedValue(err);

    const result = await createQuiz('u1', quizInput);
    expect(result.success).toBe(false);
    expect(result.error?.service).toBe('firestore');
  });
});

describe('getQuiz', () => {
  it('returns the quiz when it exists', async () => {
    const quiz = { id: 'q1', uid: 'u1', title: 'X' };
    firestoreHelpers.getDocument.mockResolvedValue({ success: true, data: quiz });

    const result = await getQuiz('q1');
    expect(firestoreHelpers.getDocument).toHaveBeenCalledWith('exam_quizzes', 'q1');
    expect(result.success).toBe(true);
    expect(result.data).toEqual(quiz);
  });

  it('returns null when the quiz does not exist', async () => {
    firestoreHelpers.getDocument.mockResolvedValue({ success: true, data: null });
    const result = await getQuiz('missing');
    expect(result.success).toBe(true);
    expect(result.data).toBeNull();
  });

  it('returns a failure envelope on error', async () => {
    firestoreHelpers.getDocument.mockResolvedValue({
      success: false,
      error: { code: 'not-found', message: 'missing', service: 'firestore' },
    });
    const result = await getQuiz('q1');
    expect(result.success).toBe(false);
  });
});

describe('updateQuiz', () => {
  it('calls updateDocument with the right collection + id + payload + bumped updatedAt', async () => {
    firestoreHelpers.updateDocument.mockResolvedValue({ success: true });

    const result = await updateQuiz('q1', { title: 'New Title' });

    expect(firestoreHelpers.updateDocument).toHaveBeenCalledWith(
      'exam_quizzes',
      'q1',
      expect.objectContaining({ title: 'New Title', updatedAt: expect.any(Number) }),
    );
    expect(result.success).toBe(true);
  });
});

describe('deleteQuiz', () => {
  it('calls deleteDocument with the right collection + id', async () => {
    firestoreHelpers.deleteDocument.mockResolvedValue({ success: true });

    const result = await deleteQuiz('q1');

    expect(firestoreHelpers.deleteDocument).toHaveBeenCalledWith('exam_quizzes', 'q1');
    expect(result.success).toBe(true);
  });

  it('returns a failure envelope when deleteDocument reports failure', async () => {
    firestoreHelpers.deleteDocument.mockResolvedValue({
      success: false,
      error: { code: 'permission-denied', message: 'denied', service: 'firestore' },
    });

    const result = await deleteQuiz('q1');
    expect(result.success).toBe(false);
  });
});
