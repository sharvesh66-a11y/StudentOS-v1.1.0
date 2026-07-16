/**
 * Unit tests for `src/firebase/firestore-helpers.ts`.
 *
 * The Firestore SDK is mocked — no real Firebase project is contacted.
 * Each test asserts that the helper:
 *   - Calls the right SDK function
 *   - Passes the right collection / id / payload
 *   - Wraps the result in the `FirestoreHelperResult<T>` envelope
 *   - Normalizes thrown errors via `normalizeFirebaseError`
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// --- Mocks --------------------------------------------------------------
//
// `vi.mock` factories are hoisted to the top of the file by vitest's
// transformer — so they can't reference variables declared with `const`
// at module scope. We use `vi.hoisted()` to declare the mock map in a
// hoisted scope that runs before the mock factory.
const firestoreMocks = vi.hoisted(() => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  collection: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  onSnapshot: vi.fn(),
  serverTimestamp: vi.fn(() => ({ _serverTimestamp: true })),
}));

vi.mock('firebase/firestore', () => firestoreMocks);

// `db` is a stub object — helpers only pass it to doc()/collection().
vi.mock('@/firebase/firestore', () => ({
  db: { id: 'mock-db' },
}));

// Real error-handler — we want to verify the error envelope shape.
// (No mock needed — it's a pure function.)

// Import AFTER mocks are registered.
import {
  getDocument,
  queryCollection,
  createDocument,
  updateDocument,
  setDocument,
  deleteDocument,
  subscribeToDocument,
  subscribeToQuery,
} from '@/firebase/firestore-helpers';

// --- Reset call history between tests -----------------------------------

beforeEach(() => {
  vi.clearAllMocks();
});

// --- Tests ---------------------------------------------------------------

describe('getDocument', () => {
  it('returns the document data with id merged in when the doc exists', async () => {
    const ref = { path: 'users/123' };
    (firestoreMocks.doc as ReturnType<typeof vi.fn>).mockReturnValue(ref);
    (firestoreMocks.getDoc as ReturnType<typeof vi.fn>).mockResolvedValue({
      exists: () => true,
      id: '123',
      data: () => ({ name: 'Ada' }),
    });

    const res = await getDocument('users', '123');

    expect(firestoreMocks.doc).toHaveBeenCalledWith({ id: 'mock-db' }, 'users', '123');
    expect(firestoreMocks.getDoc).toHaveBeenCalledWith(ref);
    expect(res.success).toBe(true);
    expect(res.data).toEqual({ id: '123', name: 'Ada' });
  });

  it('returns null data when the doc does not exist', async () => {
    (firestoreMocks.doc as ReturnType<typeof vi.fn>).mockReturnValue({});
    (firestoreMocks.getDoc as ReturnType<typeof vi.fn>).mockResolvedValue({
      exists: () => false,
      id: 'missing',
      data: () => null,
    });

    const res = await getDocument('users', 'missing');

    expect(res.success).toBe(true);
    expect(res.data).toBeNull();
  });

  it('returns a normalized error envelope when getDoc throws', async () => {
    const err = new Error('permission denied');
    (err as { code?: string }).code = 'permission-denied';
    (firestoreMocks.doc as ReturnType<typeof vi.fn>).mockReturnValue({});
    (firestoreMocks.getDoc as ReturnType<typeof vi.fn>).mockRejectedValue(err);

    const res = await getDocument('users', '123');

    expect(res.success).toBe(false);
    expect(res.data).toBeUndefined();
    expect(res.error).toBeDefined();
    expect(res.error?.service).toBe('firestore');
    expect(res.error?.code).toBe('permission-denied');
  });
});

describe('queryCollection', () => {
  it('returns an array of documents with ids merged in', async () => {
    (firestoreMocks.collection as ReturnType<typeof vi.fn>).mockReturnValue('coll-ref');
    (firestoreMocks.query as ReturnType<typeof vi.fn>).mockReturnValue('q-ref');
    (firestoreMocks.getDocs as ReturnType<typeof vi.fn>).mockResolvedValue({
      docs: [
        { id: 'a', data: () => ({ x: 1 }) },
        { id: 'b', data: () => ({ x: 2 }) },
      ],
    });

    const res = await queryCollection('notes');

    expect(firestoreMocks.collection).toHaveBeenCalledWith({ id: 'mock-db' }, 'notes');
    expect(firestoreMocks.getDocs).toHaveBeenCalledWith('q-ref');
    expect(res.success).toBe(true);
    expect(res.data).toEqual([
      { id: 'a', x: 1 },
      { id: 'b', x: 2 },
    ]);
  });

  it('passes query constraints through to query()', async () => {
    (firestoreMocks.collection as ReturnType<typeof vi.fn>).mockReturnValue('coll-ref');
    (firestoreMocks.query as ReturnType<typeof vi.fn>).mockReturnValue('q-ref');
    (firestoreMocks.getDocs as ReturnType<typeof vi.fn>).mockResolvedValue({ docs: [] });

    // Cast the sentinel strings to QueryConstraint — the helper passes them
    // through opaquely to query(), and we only care that the args are forwarded.
    const c1 = 'constraint-1' as unknown as Parameters<typeof queryCollection>[1];
    const c2 = 'constraint-2' as unknown as Parameters<typeof queryCollection>[1];
    await queryCollection('notes', c1, c2);

    expect(firestoreMocks.query).toHaveBeenCalledWith('coll-ref', c1, c2);
  });

  it('returns an empty array when the query yields no docs', async () => {
    (firestoreMocks.collection as ReturnType<typeof vi.fn>).mockReturnValue('coll-ref');
    (firestoreMocks.query as ReturnType<typeof vi.fn>).mockReturnValue('q-ref');
    (firestoreMocks.getDocs as ReturnType<typeof vi.fn>).mockResolvedValue({ docs: [] });

    const res = await queryCollection('notes');
    expect(res.success).toBe(true);
    expect(res.data).toEqual([]);
  });

  it('returns a normalized error envelope when getDocs throws', async () => {
    const err = new Error('unavailable');
    (err as { code?: string }).code = 'unavailable';
    (firestoreMocks.collection as ReturnType<typeof vi.fn>).mockReturnValue('coll-ref');
    (firestoreMocks.query as ReturnType<typeof vi.fn>).mockReturnValue('q-ref');
    (firestoreMocks.getDocs as ReturnType<typeof vi.fn>).mockRejectedValue(err);

    const res = await queryCollection('notes');
    expect(res.success).toBe(false);
    expect(res.error?.code).toBe('unavailable');
  });
});

describe('createDocument', () => {
  it('calls setDoc with the payload + server timestamps and returns the new id', async () => {
    const ref = { id: 'new-doc-id' };
    (firestoreMocks.doc as ReturnType<typeof vi.fn>).mockReturnValue(ref);
    (firestoreMocks.setDoc as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    (firestoreMocks.collection as ReturnType<typeof vi.fn>).mockReturnValue('coll-ref');

    const res = await createDocument('notes', { title: 'Hi', uid: 'u1' });

    // setDoc should be called with the payload plus createdAt/updatedAt timestamps.
    expect(firestoreMocks.setDoc).toHaveBeenCalledWith(ref, {
      title: 'Hi',
      uid: 'u1',
      createdAt: { _serverTimestamp: true },
      updatedAt: { _serverTimestamp: true },
    });
    expect(res.success).toBe(true);
    expect(res.data).toBe('new-doc-id');
  });

  it('uses the customId when provided', async () => {
    const ref = { id: 'my-id' };
    (firestoreMocks.doc as ReturnType<typeof vi.fn>).mockReturnValue(ref);
    (firestoreMocks.setDoc as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const res = await createDocument('notes', { x: 1 }, 'my-id');

    // doc(db, collectionName, customId) — explicit-id variant.
    expect(firestoreMocks.doc).toHaveBeenCalledWith({ id: 'mock-db' }, 'notes', 'my-id');
    expect(res.data).toBe('my-id');
  });

  it('returns a normalized error envelope when setDoc throws', async () => {
    const err = new Error('permission-denied');
    (err as { code?: string }).code = 'permission-denied';
    (firestoreMocks.doc as ReturnType<typeof vi.fn>).mockReturnValue({ id: 'x' });
    (firestoreMocks.setDoc as ReturnType<typeof vi.fn>).mockRejectedValue(err);

    const res = await createDocument('notes', { x: 1 });
    expect(res.success).toBe(false);
    expect(res.error?.code).toBe('permission-denied');
  });
});

describe('updateDocument', () => {
  it('calls updateDoc with the patch + updatedAt server timestamp', async () => {
    const ref = { id: 'doc-1' };
    (firestoreMocks.doc as ReturnType<typeof vi.fn>).mockReturnValue(ref);
    (firestoreMocks.updateDoc as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const res = await updateDocument<{ title?: string }>('notes', 'doc-1', { title: 'New' });

    expect(firestoreMocks.doc).toHaveBeenCalledWith({ id: 'mock-db' }, 'notes', 'doc-1');
    expect(firestoreMocks.updateDoc).toHaveBeenCalledWith(ref, {
      title: 'New',
      updatedAt: { _serverTimestamp: true },
    });
    expect(res.success).toBe(true);
  });

  it('returns a normalized error envelope when updateDoc throws', async () => {
    const err = new Error('not-found');
    (err as { code?: string }).code = 'not-found';
    (firestoreMocks.doc as ReturnType<typeof vi.fn>).mockReturnValue({ id: 'x' });
    (firestoreMocks.updateDoc as ReturnType<typeof vi.fn>).mockRejectedValue(err);

    const res = await updateDocument('notes', 'x', { title: 'New' });
    expect(res.success).toBe(false);
    expect(res.error?.code).toBe('not-found');
  });
});

describe('setDocument', () => {
  it('calls setDoc without merge option by default', async () => {
    const ref = { id: 'doc-1' };
    (firestoreMocks.doc as ReturnType<typeof vi.fn>).mockReturnValue(ref);
    (firestoreMocks.setDoc as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    await setDocument('notes', 'doc-1', { title: 'Hi' });

    expect(firestoreMocks.setDoc).toHaveBeenCalledWith(ref, { title: 'Hi' });
  });

  it('passes { merge: true } when the merge flag is set', async () => {
    const ref = { id: 'doc-1' };
    (firestoreMocks.doc as ReturnType<typeof vi.fn>).mockReturnValue(ref);
    (firestoreMocks.setDoc as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    await setDocument('notes', 'doc-1', { title: 'Hi' }, true);

    expect(firestoreMocks.setDoc).toHaveBeenCalledWith(ref, { title: 'Hi' }, { merge: true });
  });

  it('does NOT auto-add timestamps (caller controls payload)', async () => {
    const ref = { id: 'doc-1' };
    (firestoreMocks.doc as ReturnType<typeof vi.fn>).mockReturnValue(ref);
    (firestoreMocks.setDoc as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    await setDocument('notes', 'doc-1', { title: 'Hi' });
    const call = (firestoreMocks.setDoc as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[1]).toEqual({ title: 'Hi' }); // no createdAt / updatedAt added
  });

  it('returns a normalized error envelope when setDoc throws', async () => {
    const err = new Error('already-exists');
    (err as { code?: string }).code = 'already-exists';
    (firestoreMocks.doc as ReturnType<typeof vi.fn>).mockReturnValue({ id: 'x' });
    (firestoreMocks.setDoc as ReturnType<typeof vi.fn>).mockRejectedValue(err);

    const res = await setDocument('notes', 'x', { title: 'Hi' });
    expect(res.success).toBe(false);
    expect(res.error?.code).toBe('already-exists');
  });
});

describe('deleteDocument', () => {
  it('calls deleteDoc with the doc ref', async () => {
    const ref = { id: 'doc-1' };
    (firestoreMocks.doc as ReturnType<typeof vi.fn>).mockReturnValue(ref);
    (firestoreMocks.deleteDoc as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const res = await deleteDocument('notes', 'doc-1');

    expect(firestoreMocks.doc).toHaveBeenCalledWith({ id: 'mock-db' }, 'notes', 'doc-1');
    expect(firestoreMocks.deleteDoc).toHaveBeenCalledWith(ref);
    expect(res.success).toBe(true);
  });

  it('returns a normalized error envelope when deleteDoc throws', async () => {
    const err = new Error('permission-denied');
    (err as { code?: string }).code = 'permission-denied';
    (firestoreMocks.doc as ReturnType<typeof vi.fn>).mockReturnValue({ id: 'x' });
    (firestoreMocks.deleteDoc as ReturnType<typeof vi.fn>).mockRejectedValue(err);

    const res = await deleteDocument('notes', 'x');
    expect(res.success).toBe(false);
    expect(res.error?.code).toBe('permission-denied');
  });
});

describe('subscribeToDocument', () => {
  it('returns the unsubscribe function from onSnapshot', () => {
    const unsub = vi.fn();
    (firestoreMocks.doc as ReturnType<typeof vi.fn>).mockReturnValue('ref');
    (firestoreMocks.onSnapshot as ReturnType<typeof vi.fn>).mockReturnValue(unsub);

    const result = subscribeToDocument(
      'users',
      '123',
      () => {},
      () => {},
    );

    expect(result).toBe(unsub);
    expect(firestoreMocks.onSnapshot).toHaveBeenCalled();
  });

  it('calls onNext with the doc data (id-merged) when the doc exists', () => {
    (firestoreMocks.doc as ReturnType<typeof vi.fn>).mockReturnValue('ref');
    const onNext = vi.fn();
    const onError = vi.fn();

    (firestoreMocks.onSnapshot as ReturnType<typeof vi.fn>).mockImplementation(
      (_ref: unknown, next: (snap: unknown) => void) => {
        next({
          exists: () => true,
          id: '123',
          data: () => ({ name: 'Ada' }),
        });
        return vi.fn();
      },
    );

    subscribeToDocument('users', '123', onNext, onError);
    expect(onNext).toHaveBeenCalledWith({ id: '123', name: 'Ada' });
    expect(onError).not.toHaveBeenCalled();
  });

  it('calls onNext with null when the doc does not exist', () => {
    (firestoreMocks.doc as ReturnType<typeof vi.fn>).mockReturnValue('ref');
    const onNext = vi.fn();

    (firestoreMocks.onSnapshot as ReturnType<typeof vi.fn>).mockImplementation(
      (_ref: unknown, next: (snap: unknown) => void) => {
        next({ exists: () => false, id: 'x', data: () => null });
        return vi.fn();
      },
    );

    subscribeToDocument('users', 'x', onNext);
    expect(onNext).toHaveBeenCalledWith(null);
  });

  it('routes onSnapshot errors through normalizeFirebaseError', () => {
    (firestoreMocks.doc as ReturnType<typeof vi.fn>).mockReturnValue('ref');
    const onError = vi.fn();

    (firestoreMocks.onSnapshot as ReturnType<typeof vi.fn>).mockImplementation(
      (_ref: unknown, _next: unknown, err: (e: Error) => void) => {
        const error = new Error('denied');
        (error as { code?: string }).code = 'permission-denied';
        err(error);
        return vi.fn();
      },
    );

    subscribeToDocument('users', 'x', () => {}, onError);
    expect(onError).toHaveBeenCalled();
    const normalized = onError.mock.calls[0][0];
    expect(normalized.code).toBe('permission-denied');
    expect(normalized.service).toBe('firestore');
  });
});

describe('subscribeToQuery', () => {
  it('calls onNext with an array of docs', () => {
    (firestoreMocks.collection as ReturnType<typeof vi.fn>).mockReturnValue('coll-ref');
    (firestoreMocks.query as ReturnType<typeof vi.fn>).mockReturnValue('q-ref');
    const onNext = vi.fn();

    (firestoreMocks.onSnapshot as ReturnType<typeof vi.fn>).mockImplementation(
      (_q: unknown, next: (snap: unknown) => void) => {
        next({
          docs: [
            { id: 'a', data: () => ({ x: 1 }) },
            { id: 'b', data: () => ({ x: 2 }) },
          ],
        });
        return vi.fn();
      },
    );

    subscribeToQuery('notes', onNext, undefined);
    expect(onNext).toHaveBeenCalledWith([
      { id: 'a', x: 1 },
      { id: 'b', x: 2 },
    ]);
  });

  it('returns the unsubscribe function', () => {
    const unsub = vi.fn();
    (firestoreMocks.collection as ReturnType<typeof vi.fn>).mockReturnValue('coll-ref');
    (firestoreMocks.query as ReturnType<typeof vi.fn>).mockReturnValue('q-ref');
    (firestoreMocks.onSnapshot as ReturnType<typeof vi.fn>).mockReturnValue(unsub);

    const result = subscribeToQuery('notes', () => {}, undefined);
    expect(result).toBe(unsub);
  });
});
