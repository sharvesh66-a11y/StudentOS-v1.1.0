/**
 * Unit tests for the Settings Service.
 *
 * settings.service.ts uses raw Firestore SDK calls (not firestoreHelpers)
 * for the getSettings/ensureSettings/updateSettings path — we mock both
 * `firebase/firestore` and the `db` singleton.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// --- Mocks --------------------------------------------------------------

const firestoreMocks = vi.hoisted(() => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  serverTimestamp: vi.fn(() => ({ _serverTimestamp: true })),
  onSnapshot: vi.fn(),
}));

vi.mock('firebase/firestore', () => firestoreMocks);

vi.mock('@/firebase', () => ({
  db: { id: 'mock-db' },
  COLLECTIONS: { USER_SETTINGS: 'user_settings' },
}));

import {
  getSettings,
  ensureSettings,
  updateSettings,
} from '@/features/settings/services/settings.service';
import { DEFAULT_USER_SETTINGS } from '@/features/tools/types';

// --- Reset ---------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
});

// --- Tests ---------------------------------------------------------------

describe('getSettings', () => {
  it('returns the existing settings document when it exists', async () => {
    const doc = { uid: 'u1', ...DEFAULT_USER_SETTINGS };
    firestoreMocks.doc.mockReturnValue('ref');
    firestoreMocks.getDoc.mockResolvedValue({
      exists: () => true,
      data: () => doc,
    });

    const result = await getSettings('u1');

    expect(firestoreMocks.doc).toHaveBeenCalledWith({ id: 'mock-db' }, 'user_settings', 'u1');
    expect(firestoreMocks.getDoc).toHaveBeenCalledWith('ref');
    expect(result.success).toBe(true);
    expect(result.data).toEqual(doc);
  });

  it('returns null data when the settings document does not exist', async () => {
    firestoreMocks.doc.mockReturnValue('ref');
    firestoreMocks.getDoc.mockResolvedValue({ exists: () => false, data: () => null });

    const result = await getSettings('u1');
    expect(result.success).toBe(true);
    expect(result.data).toBeNull();
  });

  it('returns a normalized error envelope when getDoc throws', async () => {
    const err = new Error('permission-denied');
    (err as { code?: string }).code = 'permission-denied';
    firestoreMocks.doc.mockReturnValue('ref');
    firestoreMocks.getDoc.mockRejectedValue(err);

    const result = await getSettings('u1');
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('permission-denied');
  });
});

describe('ensureSettings', () => {
  it('returns the existing settings when the document exists', async () => {
    const existing = { uid: 'u1', ...DEFAULT_USER_SETTINGS };
    firestoreMocks.doc.mockReturnValue('ref');
    firestoreMocks.getDoc.mockResolvedValue({
      exists: () => true,
      data: () => existing,
    });

    const result = await ensureSettings('u1');

    expect(result.success).toBe(true);
    expect(result.data).toEqual(existing);
    // Should NOT have called setDoc since the doc already exists.
    expect(firestoreMocks.setDoc).not.toHaveBeenCalled();
  });

  it('creates the default settings document when it does not exist', async () => {
    firestoreMocks.doc.mockReturnValue('ref');
    firestoreMocks.getDoc.mockResolvedValue({ exists: () => false });
    firestoreMocks.setDoc.mockResolvedValue(undefined);

    const result = await ensureSettings('u1');

    expect(firestoreMocks.setDoc).toHaveBeenCalledWith(
      'ref',
      expect.objectContaining({
        uid: 'u1',
        defaultAIProvider: 'zai',
        theme: 'dark',
        updatedAt: { _serverTimestamp: true },
      }),
    );
    expect(result.success).toBe(true);
    expect(result.data?.uid).toBe('u1');
    expect(result.data?.defaultAIProvider).toBe('zai');
  });
});

describe('updateSettings', () => {
  it('ensures the doc exists, then writes the partial update with merge:true', async () => {
    // First getDoc (from ensureSettings) returns existing doc.
    firestoreMocks.doc.mockReturnValue('ref');
    firestoreMocks.getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ uid: 'u1', ...DEFAULT_USER_SETTINGS }),
    });
    firestoreMocks.setDoc.mockResolvedValue(undefined);

    const result = await updateSettings('u1', { theme: 'light' });

    expect(firestoreMocks.setDoc).toHaveBeenCalledWith(
      'ref',
      expect.objectContaining({
        theme: 'light',
        updatedAt: { _serverTimestamp: true },
      }),
      { merge: true },
    );
    expect(result.success).toBe(true);
  });

  it('creates the doc first if it does not exist, then applies the update', async () => {
    firestoreMocks.doc.mockReturnValue('ref');
    // First getDoc returns "does not exist" → ensureSettings writes default doc.
    // Second getDoc (none — updateSettings calls ensureSettings once).
    firestoreMocks.getDoc.mockResolvedValue({ exists: () => false });
    firestoreMocks.setDoc.mockResolvedValue(undefined);

    const result = await updateSettings('u1', { theme: 'light' });

    expect(result.success).toBe(true);
    // setDoc called twice: once by ensureSettings (full doc) and once by updateSettings (merge).
    expect(firestoreMocks.setDoc).toHaveBeenCalledTimes(2);

    // Second call should be the merge update.
    const secondCall = firestoreMocks.setDoc.mock.calls[1];
    expect(secondCall[0]).toBe('ref');
    expect(secondCall[1]).toMatchObject({ theme: 'light', updatedAt: { _serverTimestamp: true } });
    expect(secondCall[2]).toEqual({ merge: true });
  });

  it('returns a normalized error envelope when setDoc throws', async () => {
    const err = new Error('permission-denied');
    (err as { code?: string }).code = 'permission-denied';
    firestoreMocks.doc.mockReturnValue('ref');
    firestoreMocks.getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ uid: 'u1', ...DEFAULT_USER_SETTINGS }),
    });
    firestoreMocks.setDoc.mockRejectedValue(err);

    const result = await updateSettings('u1', { theme: 'light' });
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('permission-denied');
  });
});
