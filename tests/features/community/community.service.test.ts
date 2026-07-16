/**
 * Unit tests for the Community Service.
 *
 * Verifies the key social-graph operations: createPost, toggleReaction,
 * createCommunity (which also creates an owner membership), leaveCommunity
 * (which deletes all matching member docs in parallel).
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

const rawFirestore = vi.hoisted(() => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  serverTimestamp: vi.fn(() => ({ _serverTimestamp: true })),
  where: vi.fn((field: string, op: string, val: unknown) => ({ kind: 'where', field, op, val })),
  orderBy: vi.fn((field: string, dir: string) => ({ kind: 'orderBy', field, dir })),
  limit: vi.fn((n: number) => ({ kind: 'limit', n })),
}));

vi.mock('firebase/firestore', () => rawFirestore);

vi.mock('@/firebase', () => ({
  db: { id: 'mock-db' },
  COLLECTIONS: {
    COMMUNITY_POSTS: 'community_posts',
    COMMUNITY_COMMENTS: 'community_comments',
    COMMUNITIES: 'communities',
    COMMUNITY_MEMBERS: 'community_members',
    COMMUNITY_PROFILES: 'community_profiles',
    COMMUNITY_FOLLOWERS: 'community_followers',
    COMMUNITY_NOTIFICATIONS: 'community_notifications',
    COMMUNITY_REPORTS: 'community_reports',
  },
  firestoreHelpers,
}));

import {
  createPost,
  toggleReaction,
  createCommunity,
  leaveCommunity,
  followUser,
  unfollowUser,
} from '@/features/community/services/community.service';

// --- Reset ---------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
});

// --- Tests ---------------------------------------------------------------

describe('createPost', () => {
  it('creates a post with sensible defaults and the caller uid', async () => {
    firestoreHelpers.createDocument.mockResolvedValue({ success: true, data: 'post-id' });

    const result = await createPost('u1', {
      content: 'Hello world',
      authorName: 'Ada',
      tags: ['math'],
    });

    expect(result.success).toBe(true);
    expect(firestoreHelpers.createDocument).toHaveBeenCalledTimes(1);
    const [collectionName, payload] = firestoreHelpers.createDocument.mock.calls[0];
    expect(collectionName).toBe('community_posts');
    expect(payload).toMatchObject({
      uid: 'u1',
      type: 'text',
      content: 'Hello world',
      mediaURL: null,
      mediaType: null,
      linkURL: null,
      pollOptions: [],
      communityId: null,
      isPinned: false,
      isBookmarked: false,
      reactions: {},
      commentsCount: 0,
      tags: ['math'],
      authorName: 'Ada',
      authorPhotoURL: null,
    });
    expect(payload.createdAt).toBeTypeOf('number');
    expect(payload.updatedAt).toBeTypeOf('number');
  });

  it('returns a failure envelope when createDocument throws', async () => {
    const err = new Error('permission-denied');
    (err as { code?: string }).code = 'permission-denied';
    firestoreHelpers.createDocument.mockRejectedValue(err);

    const result = await createPost('u1', { content: 'x' });
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('permission-denied');
  });
});

describe('toggleReaction', () => {
  it('adds the user uid to the emoji reaction list when not present', async () => {
    firestoreHelpers.updateDocument.mockResolvedValue({ success: true });

    const result = await toggleReaction('p1', '🔥', 'u1', {});

    expect(result.success).toBe(true);
    expect(firestoreHelpers.updateDocument).toHaveBeenCalledWith(
      'community_posts',
      'p1',
      expect.objectContaining({ reactions: { '🔥': ['u1'] } }),
    );
  });

  it('removes the user uid when already present', async () => {
    firestoreHelpers.updateDocument.mockResolvedValue({ success: true });

    const result = await toggleReaction('p1', '🔥', 'u1', { '🔥': ['u1', 'u2'] });

    expect(result.success).toBe(true);
    const payload = firestoreHelpers.updateDocument.mock.calls[0][2];
    expect(payload.reactions).toEqual({ '🔥': ['u2'] });
  });

  it('deletes the emoji key when the list becomes empty', async () => {
    firestoreHelpers.updateDocument.mockResolvedValue({ success: true });

    await toggleReaction('p1', '🔥', 'u1', { '🔥': ['u1'] });

    const payload = firestoreHelpers.updateDocument.mock.calls[0][2];
    expect(payload.reactions).toEqual({});
    expect('🔥' in payload.reactions).toBe(false);
  });
});

describe('createCommunity', () => {
  it('creates the community document AND an owner member document', async () => {
    firestoreHelpers.createDocument
      .mockResolvedValueOnce({ success: true, data: 'community-1' })
      .mockResolvedValueOnce({ success: true, data: 'member-1' });

    const result = await createCommunity('u1', 'Math Geeks', {
      description: 'A group for math lovers',
      subject: 'Mathematics',
      privacy: 'public',
      createdByName: 'Ada',
      tags: ['math'],
      rules: ['Be kind'],
    });

    expect(result.success).toBe(true);
    expect(firestoreHelpers.createDocument).toHaveBeenCalledTimes(2);

    const [c1Collection, c1Payload] = firestoreHelpers.createDocument.mock.calls[0];
    expect(c1Collection).toBe('communities');
    expect(c1Payload).toMatchObject({
      name: 'Math Geeks',
      description: 'A group for math lovers',
      subject: 'Mathematics',
      privacy: 'public',
      memberCount: 1,
      createdBy: 'u1',
      createdByName: 'Ada',
      tags: ['math'],
      rules: ['Be kind'],
    });

    const [c2Collection, c2Payload] = firestoreHelpers.createDocument.mock.calls[1];
    expect(c2Collection).toBe('community_members');
    expect(c2Payload).toMatchObject({
      communityId: 'community-1',
      uid: 'u1',
      displayName: 'Ada',
      role: 'owner',
    });
  });
});

describe('leaveCommunity', () => {
  it('queries for matching member docs and deletes them all in parallel', async () => {
    firestoreHelpers.queryCollection.mockResolvedValue({
      success: true,
      data: [
        { id: 'm1', communityId: 'c1', uid: 'u1' },
        { id: 'm2', communityId: 'c1', uid: 'u1' },
      ],
    });
    firestoreHelpers.deleteDocument.mockResolvedValue({ success: true });

    const result = await leaveCommunity('c1', 'u1');

    expect(result.success).toBe(true);
    expect(firestoreHelpers.queryCollection).toHaveBeenCalled();
    // Both deletes should have been issued.
    expect(firestoreHelpers.deleteDocument).toHaveBeenCalledTimes(2);
    expect(firestoreHelpers.deleteDocument.mock.calls[0]).toEqual(['community_members', 'm1']);
    expect(firestoreHelpers.deleteDocument.mock.calls[1]).toEqual(['community_members', 'm2']);
  });

  it('returns success when no matching member docs are found', async () => {
    firestoreHelpers.queryCollection.mockResolvedValue({ success: true, data: [] });

    const result = await leaveCommunity('c1', 'u1');
    expect(result.success).toBe(true);
    expect(firestoreHelpers.deleteDocument).not.toHaveBeenCalled();
  });
});

describe('followUser', () => {
  it('creates a follower document with the right payload', async () => {
    firestoreHelpers.createDocument.mockResolvedValue({ success: true, data: 'f1' });

    const result = await followUser('u1', 'Ada', 'u2', 'Bob');

    expect(result.success).toBe(true);
    const [collectionName, payload] = firestoreHelpers.createDocument.mock.calls[0];
    expect(collectionName).toBe('community_followers');
    expect(payload).toMatchObject({
      followerUid: 'u1',
      followerName: 'Ada',
      followingUid: 'u2',
      followingName: 'Bob',
    });
  });
});

describe('unfollowUser', () => {
  it('queries for matching follow docs and deletes them all', async () => {
    firestoreHelpers.queryCollection.mockResolvedValue({
      success: true,
      data: [{ id: 'f1' }],
    });
    firestoreHelpers.deleteDocument.mockResolvedValue({ success: true });

    const result = await unfollowUser('u1', 'u2');

    expect(result.success).toBe(true);
    expect(firestoreHelpers.deleteDocument).toHaveBeenCalledWith('community_followers', 'f1');
  });
});
