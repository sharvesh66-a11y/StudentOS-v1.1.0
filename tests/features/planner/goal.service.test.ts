/**
 * Unit tests for the Planner Goal Service.
 *
 * The goal.service.ts file uses the raw Firestore SDK (NOT firestoreHelpers),
 * so we mock `firebase/firestore` AND the `db` singleton directly.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// --- Mocks --------------------------------------------------------------

const firestoreMocks = vi.hoisted(() => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  serverTimestamp: vi.fn(() => ({ _serverTimestamp: true })),
  onSnapshot: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn((field: string, op: string, val: unknown) => ({ kind: 'where', field, op, val })),
  orderBy: vi.fn((field: string, dir: string) => ({ kind: 'orderBy', field, dir })),
  getDocs: vi.fn(),
}));

vi.mock('firebase/firestore', () => firestoreMocks);

vi.mock('@/firebase', () => ({
  db: { id: 'mock-db' },
  COLLECTIONS: {
    GOALS: 'goals',
    REVISIONS: 'revisions',
  },
}));

import {
  createGoal,
  updateGoal,
  updateGoalProgress,
  deleteGoal,
} from '@/features/planner/services/goal.service';

// --- Reset ---------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
});

// --- Tests ---------------------------------------------------------------

describe('createGoal', () => {
  it('creates a goal with default status=active, progress=0, and server timestamps', async () => {
    const ref = { id: 'g1' };
    firestoreMocks.doc.mockReturnValue(ref);
    firestoreMocks.collection.mockReturnValue('coll-ref');
    firestoreMocks.setDoc.mockResolvedValue(undefined);

    const result = await createGoal('u1', {
      title: 'Master Algebra',
      description: 'Practice daily',
      type: 'subject',
      target: '90%',
      subject: 'Mathematics',
      targetDate: '2026-12-31',
    });

    expect(firestoreMocks.collection).toHaveBeenCalledWith({ id: 'mock-db' }, 'goals');
    expect(firestoreMocks.doc).toHaveBeenCalledWith('coll-ref');
    expect(firestoreMocks.setDoc).toHaveBeenCalledWith(
      ref,
      expect.objectContaining({
        uid: 'u1',
        title: 'Master Algebra',
        description: 'Practice daily',
        type: 'subject',
        status: 'active',
        progress: 0,
        target: '90%',
        subject: 'Mathematics',
        targetDate: '2026-12-31',
        aiSuggested: false,
        createdAt: { _serverTimestamp: true },
        updatedAt: { _serverTimestamp: true },
      }),
    );

    expect(result.success).toBe(true);
    expect(result.data?.id).toBe('g1');
    expect(result.data?.uid).toBe('u1');
    expect(result.data?.status).toBe('active');
    expect(result.data?.progress).toBe(0);
  });

  it('uses sensible defaults when optional fields are omitted', async () => {
    firestoreMocks.doc.mockReturnValue({ id: 'g2' });
    firestoreMocks.collection.mockReturnValue('coll-ref');
    firestoreMocks.setDoc.mockResolvedValue(undefined);

    const result = await createGoal('u1', {
      title: 'Quick goal',
      description: '',
      type: 'daily',
      target: '5 pages',
    });

    expect(result.data?.subject).toBeNull();
    expect(result.data?.targetDate).toBeNull();
    expect(result.data?.aiSuggested).toBe(false);
  });

  it('returns a normalized error envelope when setDoc throws', async () => {
    const err = new Error('permission-denied');
    (err as { code?: string }).code = 'permission-denied';
    firestoreMocks.doc.mockReturnValue({ id: 'x' });
    firestoreMocks.collection.mockReturnValue('coll-ref');
    firestoreMocks.setDoc.mockRejectedValue(err);

    const result = await createGoal('u1', {
      title: 'X',
      description: '',
      type: 'daily',
      target: 'x',
    });

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('permission-denied');
  });
});

describe('updateGoal', () => {
  it('calls updateDoc with the right ref + payload + server timestamp', async () => {
    const ref = { id: 'g1' };
    firestoreMocks.doc.mockReturnValue(ref);
    firestoreMocks.updateDoc.mockResolvedValue(undefined);

    const result = await updateGoal('g1', { progress: 50 });

    expect(firestoreMocks.doc).toHaveBeenCalledWith({ id: 'mock-db' }, 'goals', 'g1');
    expect(firestoreMocks.updateDoc).toHaveBeenCalledWith(
      ref,
      expect.objectContaining({ progress: 50, updatedAt: { _serverTimestamp: true } }),
    );
    expect(result.success).toBe(true);
  });

  it('returns a failure envelope when updateDoc throws', async () => {
    const err = new Error('not-found');
    (err as { code?: string }).code = 'not-found';
    firestoreMocks.doc.mockReturnValue({ id: 'x' });
    firestoreMocks.updateDoc.mockRejectedValue(err);

    const result = await updateGoal('g1', { progress: 50 });
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('not-found');
  });
});

describe('updateGoalProgress', () => {
  it('clamps progress to [0, 100] and sets status=achieved when progress=100', async () => {
    firestoreMocks.doc.mockReturnValue({ id: 'g1' });
    firestoreMocks.updateDoc.mockResolvedValue(undefined);

    await updateGoalProgress('g1', 150);

    expect(firestoreMocks.updateDoc).toHaveBeenCalledWith(
      { id: 'g1' },
      expect.objectContaining({
        progress: 100,
        status: 'achieved',
        updatedAt: { _serverTimestamp: true },
      }),
    );
  });

  it('keeps status=active when progress < 100', async () => {
    firestoreMocks.doc.mockReturnValue({ id: 'g1' });
    firestoreMocks.updateDoc.mockResolvedValue(undefined);

    await updateGoalProgress('g1', 50);

    expect(firestoreMocks.updateDoc).toHaveBeenCalledWith(
      { id: 'g1' },
      expect.objectContaining({ progress: 50, status: 'active' }),
    );
  });

  it('clamps negative progress to 0', async () => {
    firestoreMocks.doc.mockReturnValue({ id: 'g1' });
    firestoreMocks.updateDoc.mockResolvedValue(undefined);

    await updateGoalProgress('g1', -10);

    expect(firestoreMocks.updateDoc).toHaveBeenCalledWith(
      { id: 'g1' },
      expect.objectContaining({ progress: 0 }),
    );
  });
});

describe('deleteGoal', () => {
  it('calls deleteDoc with the right ref', async () => {
    const ref = { id: 'g1' };
    firestoreMocks.doc.mockReturnValue(ref);
    firestoreMocks.deleteDoc.mockResolvedValue(undefined);

    const result = await deleteGoal('g1');

    expect(firestoreMocks.doc).toHaveBeenCalledWith({ id: 'mock-db' }, 'goals', 'g1');
    expect(firestoreMocks.deleteDoc).toHaveBeenCalledWith(ref);
    expect(result.success).toBe(true);
  });

  it('returns a failure envelope when deleteDoc throws', async () => {
    const err = new Error('permission-denied');
    (err as { code?: string }).code = 'permission-denied';
    firestoreMocks.doc.mockReturnValue({ id: 'x' });
    firestoreMocks.deleteDoc.mockRejectedValue(err);

    const result = await deleteGoal('g1');
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('permission-denied');
  });
});
