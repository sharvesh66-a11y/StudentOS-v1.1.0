/**
 * Unit tests for the Junova Teacher Service.
 *
 * The Firestore layer is mocked — these tests verify that the service:
 *   - Calls the right firestoreHelpers method with the right collection
 *   - Builds the correct payload (default DNA, timestamps, uid scoping)
 *   - Wraps results in the TeacherServiceResult envelope
 *   - Routes errors through normalizeFirebaseError
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// --- Mocks --------------------------------------------------------------
//
// `vi.mock` factories are hoisted to the top of the file. We use
// `vi.hoisted()` so the mock map is available when the factory runs.
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
    JUNOVA_TEACHERS: 'junova_teachers',
  },
  firestoreHelpers,
}));

// `where` and `orderBy` are passed through to queryCollection/subscribeToQuery
// as opaque constraints — return sentinel objects so we can assert identity.
vi.mock('firebase/firestore', () => ({
  where: (field: string, op: string, val: unknown) => ({ kind: 'where', field, op, val }),
  orderBy: (field: string, dir: string) => ({ kind: 'orderBy', field, dir }),
}));

// Import AFTER mocks are registered.
import {
  createTeacher,
  getTeacher,
  getTeachers,
  updateTeacher,
  deleteTeacher,
} from '@/features/junova/services/teacher.service';
import { PERSONALITY_PRESETS } from '@/features/junova/constants';

// --- Reset between tests ------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
});

// --- Tests ---------------------------------------------------------------

describe('createTeacher', () => {
  it('creates a teacher with a preset DNA when no DNA is supplied', async () => {
    firestoreHelpers.createDocument.mockResolvedValue({ success: true, data: 'new-id' });

    const result = await createTeacher('u1', {
      name: 'Ada',
      avatarURL: null,
      subject: 'Mathematics',
      preset: 'friendly-mentor',
      teachingStyle: 'socratic',
      bio: 'Bio',
      themeColor: '#7c3aed',
    });

    expect(result.success).toBe(true);
    expect(result.data?.id).toBe('new-id');
    expect(result.data?.uid).toBe('u1');
    expect(result.data?.dna).toEqual(PERSONALITY_PRESETS['friendly-mentor'].dna);
    expect(result.data?.createdAt).toBeTypeOf('number');

    // Verify firestoreHelpers was called with the right collection + payload.
    expect(firestoreHelpers.createDocument).toHaveBeenCalledTimes(1);
    const [collectionName, payload] = firestoreHelpers.createDocument.mock.calls[0];
    expect(collectionName).toBe('junova_teachers');
    expect(payload).toMatchObject({
      uid: 'u1',
      name: 'Ada',
      subject: 'Mathematics',
      preset: 'friendly-mentor',
      teachingStyle: 'socratic',
      bio: 'Bio',
      themeColor: '#7c3aed',
      avatarURL: null,
    });
    expect(payload.dna).toEqual(PERSONALITY_PRESETS['friendly-mentor'].dna);
  });

  it('uses the caller-supplied DNA when provided', async () => {
    firestoreHelpers.createDocument.mockResolvedValue({ success: true, data: 'new-id' });
    const customDna = { ...PERSONALITY_PRESETS['custom'].dna, friendliness: 99 };

    await createTeacher('u1', {
      name: 'X',
      subject: 'Physics',
      preset: 'custom',
      teachingStyle: 'lecture',
      bio: '',
      themeColor: '#000000',
      dna: customDna,
    });

    const payload = firestoreHelpers.createDocument.mock.calls[0][1];
    expect(payload.dna).toEqual(customDna);
  });

  it('returns a failure envelope when firestoreHelpers reports failure', async () => {
    firestoreHelpers.createDocument.mockResolvedValue({
      success: false,
      error: { code: 'permission-denied', message: 'denied', service: 'firestore' },
    });

    const result = await createTeacher('u1', {
      name: 'X',
      subject: 'Physics',
      preset: 'custom',
      teachingStyle: 'lecture',
      bio: '',
      themeColor: '#000000',
    });

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('permission-denied');
  });

  it('returns a failure envelope when firestoreHelpers throws', async () => {
    const err = new Error('network');
    (err as { code?: string }).code = 'auth/network-request-failed';
    firestoreHelpers.createDocument.mockRejectedValue(err);

    const result = await createTeacher('u1', {
      name: 'X',
      subject: 'Physics',
      preset: 'custom',
      teachingStyle: 'lecture',
      bio: '',
      themeColor: '#000000',
    });

    expect(result.success).toBe(false);
    expect(result.error?.service).toBe('auth');
  });
});

describe('getTeacher', () => {
  it('returns the teacher document when it exists', async () => {
    const teacher = {
      id: 't1',
      uid: 'u1',
      name: 'Ada',
      subject: 'Mathematics',
      preset: 'friendly-mentor',
      teachingStyle: 'socratic',
      bio: '',
      themeColor: '#fff',
      avatarURL: null,
      dna: PERSONALITY_PRESETS['friendly-mentor'].dna,
      createdAt: 0,
      updatedAt: 0,
    };
    firestoreHelpers.getDocument.mockResolvedValue({ success: true, data: teacher });

    const result = await getTeacher('t1');

    expect(firestoreHelpers.getDocument).toHaveBeenCalledWith('junova_teachers', 't1');
    expect(result.success).toBe(true);
    expect(result.data).toEqual(teacher);
  });

  it('returns null data when the teacher does not exist', async () => {
    firestoreHelpers.getDocument.mockResolvedValue({ success: true, data: null });

    const result = await getTeacher('missing');
    expect(result.success).toBe(true);
    expect(result.data).toBeNull();
  });

  it('returns a failure envelope when firestoreHelpers reports failure', async () => {
    firestoreHelpers.getDocument.mockResolvedValue({
      success: false,
      error: { code: 'permission-denied', message: 'denied', service: 'firestore' },
    });

    const result = await getTeacher('t1');
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('permission-denied');
  });
});

describe('getTeachers', () => {
  it('queries the junova_teachers collection scoped to the user uid', async () => {
    const teachers = [{ id: 't1', uid: 'u1', name: 'A' }];
    firestoreHelpers.queryCollection.mockResolvedValue({ success: true, data: teachers });

    const result = await getTeachers('u1');

    expect(firestoreHelpers.queryCollection).toHaveBeenCalledTimes(1);
    const args = firestoreHelpers.queryCollection.mock.calls[0];
    expect(args[0]).toBe('junova_teachers');
    // Constraint 1: where('uid', '==', uid)
    expect(args[1]).toMatchObject({ kind: 'where', field: 'uid', op: '==', val: 'u1' });
    // Constraint 2: orderBy('createdAt', 'desc')
    expect(args[2]).toMatchObject({ kind: 'orderBy', field: 'createdAt', dir: 'desc' });
    expect(result.success).toBe(true);
    expect(result.data).toEqual(teachers);
  });

  it('returns a failure envelope when firestoreHelpers reports failure', async () => {
    firestoreHelpers.queryCollection.mockResolvedValue({
      success: false,
      error: { code: 'unavailable', message: 'busy', service: 'firestore' },
    });

    const result = await getTeachers('u1');
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('unavailable');
  });
});

describe('updateTeacher', () => {
  it('calls updateDocument with the teacher id + payload + bumped updatedAt', async () => {
    firestoreHelpers.updateDocument.mockResolvedValue({ success: true });

    const result = await updateTeacher('t1', { name: 'New Name' });

    expect(firestoreHelpers.updateDocument).toHaveBeenCalledWith(
      'junova_teachers',
      't1',
      expect.objectContaining({ name: 'New Name', updatedAt: expect.any(Number) }),
    );
    expect(result.success).toBe(true);
  });

  it('returns a failure envelope when firestoreHelpers reports failure', async () => {
    firestoreHelpers.updateDocument.mockResolvedValue({
      success: false,
      error: { code: 'not-found', message: 'missing', service: 'firestore' },
    });

    const result = await updateTeacher('t1', { name: 'X' });
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('not-found');
  });
});

describe('deleteTeacher', () => {
  it('calls deleteDocument with the right collection + id', async () => {
    firestoreHelpers.deleteDocument.mockResolvedValue({ success: true });

    const result = await deleteTeacher('t1');

    expect(firestoreHelpers.deleteDocument).toHaveBeenCalledWith('junova_teachers', 't1');
    expect(result.success).toBe(true);
  });

  it('returns a failure envelope when firestoreHelpers reports failure', async () => {
    firestoreHelpers.deleteDocument.mockResolvedValue({
      success: false,
      error: { code: 'permission-denied', message: 'denied', service: 'firestore' },
    });

    const result = await deleteTeacher('t1');
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('permission-denied');
  });
});
