/**
 * StudentOS Community — Service
 */
import { COLLECTIONS, firestoreHelpers, type StudentOSFirebaseError } from '@/firebase';
import { normalizeFirebaseError } from '@/firebase/error-handler';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  where,
  orderBy,
  limit,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/firebase';
import type {
  CommunityProfile,
  CommunityPost,
  CommunityComment,
  Community,
  CommunityMember,
  FollowEntry,
  CommunityNotification,
  CommunityReport,
} from '../types';

export interface CommunityResult<T> {
  success: boolean;
  data?: T;
  error?: StudentOSFirebaseError;
}

// --- Profile ---
export async function getProfile(uid: string): Promise<CommunityResult<CommunityProfile | null>> {
  try {
    const ref = doc(db, COLLECTIONS.COMMUNITY_PROFILES, uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: true, data: null };
    return { success: true, data: snap.data() as CommunityProfile };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}
export async function updateProfile(
  uid: string,
  data: Partial<CommunityProfile>,
): Promise<CommunityResult<void>> {
  try {
    const ref = doc(db, COLLECTIONS.COMMUNITY_PROFILES, uid);
    await setDoc(ref, { ...data, uid, updatedAt: serverTimestamp() }, { merge: true });
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}
export function subscribeToProfile(
  uid: string,
  onNext: (p: CommunityProfile | null) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToDocument<CommunityProfile>(
    COLLECTIONS.COMMUNITY_PROFILES,
    uid,
    onNext,
    onError,
  );
}

// --- Posts ---
export async function createPost(
  uid: string,
  data: Partial<CommunityPost>,
): Promise<CommunityResult<void>> {
  try {
    await firestoreHelpers.createDocument(COLLECTIONS.COMMUNITY_POSTS, {
      uid,
      type: data.type ?? 'text',
      content: data.content ?? '',
      mediaURL: data.mediaURL ?? null,
      mediaType: data.mediaType ?? null,
      linkURL: data.linkURL ?? null,
      pollOptions: data.pollOptions ?? [],
      communityId: data.communityId ?? null,
      isPinned: false,
      isBookmarked: false,
      reactions: {},
      commentsCount: 0,
      tags: data.tags ?? [],
      authorName: data.authorName ?? 'Student',
      authorPhotoURL: data.authorPhotoURL ?? null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}
export function subscribeToPosts(
  onNext: (p: CommunityPost[]) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<CommunityPost>(
    COLLECTIONS.COMMUNITY_POSTS,
    onNext,
    onError,
    orderBy('createdAt', 'desc'),
    limit(50),
  );
}
export function subscribeToUserPosts(
  uid: string,
  onNext: (p: CommunityPost[]) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<CommunityPost>(
    COLLECTIONS.COMMUNITY_POSTS,
    onNext,
    onError,
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
  );
}
export async function updatePost(
  postId: string,
  updates: Partial<CommunityPost>,
): Promise<CommunityResult<void>> {
  try {
    return firestoreHelpers.updateDocument(COLLECTIONS.COMMUNITY_POSTS, postId, {
      ...updates,
      updatedAt: Date.now(),
    });
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}
export async function deletePost(postId: string): Promise<CommunityResult<void>> {
  try {
    return firestoreHelpers.deleteDocument(COLLECTIONS.COMMUNITY_POSTS, postId);
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}
export async function toggleReaction(
  postId: string,
  emoji: string,
  uid: string,
  currentReactions: Record<string, string[]>,
): Promise<CommunityResult<void>> {
  try {
    const updated = { ...currentReactions };
    if (!updated[emoji]) updated[emoji] = [];
    if (updated[emoji].includes(uid)) updated[emoji] = updated[emoji].filter((u) => u !== uid);
    else updated[emoji].push(uid);
    if (updated[emoji].length === 0) delete updated[emoji];
    return firestoreHelpers.updateDocument(COLLECTIONS.COMMUNITY_POSTS, postId, {
      reactions: updated,
    });
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

// --- Comments ---
export async function createComment(
  postId: string,
  data: {
    uid: string;
    authorName: string;
    authorPhotoURL: string | null;
    content: string;
    parentId: string | null;
  },
): Promise<CommunityResult<void>> {
  try {
    await firestoreHelpers.createDocument(COLLECTIONS.COMMUNITY_COMMENTS, {
      postId,
      ...data,
      reactions: {},
      attachments: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}
export function subscribeToComments(
  postId: string,
  onNext: (c: CommunityComment[]) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<CommunityComment>(
    COLLECTIONS.COMMUNITY_COMMENTS,
    onNext,
    onError,
    where('postId', '==', postId),
    orderBy('createdAt', 'asc'),
  );
}
export async function deleteComment(commentId: string): Promise<CommunityResult<void>> {
  try {
    return firestoreHelpers.deleteDocument(COLLECTIONS.COMMUNITY_COMMENTS, commentId);
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

// --- Communities ---
export async function createCommunity(
  uid: string,
  name: string,
  data: Partial<Community>,
): Promise<CommunityResult<void>> {
  try {
    const now = Date.now();
    const result = await firestoreHelpers.createDocument(COLLECTIONS.COMMUNITIES, {
      name,
      description: data.description ?? '',
      subject: data.subject ?? 'General',
      privacy: data.privacy ?? 'public',
      rules: data.rules ?? [],
      memberCount: 1,
      createdBy: uid,
      createdByName: data.createdByName ?? 'Student',
      coverURL: null,
      iconURL: null,
      tags: data.tags ?? [],
      createdAt: now,
      updatedAt: now,
    });
    if (result.success && result.data) {
      await firestoreHelpers.createDocument(COLLECTIONS.COMMUNITY_MEMBERS, {
        communityId: result.data,
        uid,
        displayName: data.createdByName ?? 'Student',
        photoURL: null,
        role: 'owner',
        joinedAt: now,
      });
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}
export function subscribeToCommunities(
  onNext: (c: Community[]) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<Community>(
    COLLECTIONS.COMMUNITIES,
    onNext,
    onError,
    orderBy('createdAt', 'desc'),
  );
}
export function subscribeToCommunityMembers(
  communityId: string,
  onNext: (m: CommunityMember[]) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<CommunityMember>(
    COLLECTIONS.COMMUNITY_MEMBERS,
    onNext,
    onError,
    where('communityId', '==', communityId),
    orderBy('joinedAt', 'asc'),
  );
}
export async function joinCommunity(
  communityId: string,
  uid: string,
  displayName: string,
): Promise<CommunityResult<void>> {
  try {
    await firestoreHelpers.createDocument(COLLECTIONS.COMMUNITY_MEMBERS, {
      communityId,
      uid,
      displayName,
      photoURL: null,
      role: 'member',
      joinedAt: Date.now(),
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}
export async function leaveCommunity(
  communityId: string,
  uid: string,
): Promise<CommunityResult<void>> {
  try {
    const result = await firestoreHelpers.queryCollection<CommunityMember>(
      COLLECTIONS.COMMUNITY_MEMBERS,
      where('communityId', '==', communityId),
      where('uid', '==', uid),
    );
    if (result.success && result.data) {
      // Batch delete: was sequential `for ... await`, now parallelised.
      await Promise.all(
        result.data.map((m) =>
          firestoreHelpers.deleteDocument(COLLECTIONS.COMMUNITY_MEMBERS, m.id),
        ),
      );
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

// --- Follow ---
export async function followUser(
  followerUid: string,
  followerName: string,
  followingUid: string,
  followingName: string,
): Promise<CommunityResult<void>> {
  try {
    await firestoreHelpers.createDocument(COLLECTIONS.COMMUNITY_FOLLOWERS, {
      followerUid,
      followingUid,
      followerName,
      followingName,
      createdAt: Date.now(),
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}
export async function unfollowUser(
  followerUid: string,
  followingUid: string,
): Promise<CommunityResult<void>> {
  try {
    const result = await firestoreHelpers.queryCollection<FollowEntry>(
      COLLECTIONS.COMMUNITY_FOLLOWERS,
      where('followerUid', '==', followerUid),
      where('followingUid', '==', followingUid),
    );
    if (result.success && result.data) {
      // Batch delete: was sequential `for ... await`, now parallelised.
      await Promise.all(
        result.data.map((f) =>
          firestoreHelpers.deleteDocument(COLLECTIONS.COMMUNITY_FOLLOWERS, f.id),
        ),
      );
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}
export function subscribeToFollowing(
  uid: string,
  onNext: (f: FollowEntry[]) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<FollowEntry>(
    COLLECTIONS.COMMUNITY_FOLLOWERS,
    onNext,
    onError,
    where('followerUid', '==', uid),
    orderBy('createdAt', 'desc'),
  );
}

// --- Notifications ---
export function subscribeToNotifications(
  uid: string,
  onNext: (n: CommunityNotification[]) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<CommunityNotification>(
    COLLECTIONS.COMMUNITY_NOTIFICATIONS,
    onNext,
    onError,
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
  );
}
export async function markNotificationRead(id: string): Promise<CommunityResult<void>> {
  try {
    return firestoreHelpers.updateDocument(COLLECTIONS.COMMUNITY_NOTIFICATIONS, id, { read: true });
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

// --- Reports ---
export async function createReport(
  data: Omit<CommunityReport, 'id' | 'createdAt' | 'status'>,
): Promise<CommunityResult<void>> {
  try {
    await firestoreHelpers.createDocument(COLLECTIONS.COMMUNITY_REPORTS, {
      ...data,
      status: 'pending',
      createdAt: Date.now(),
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export const communityService = {
  getProfile,
  updateProfile,
  subscribeToProfile,
  createPost,
  subscribeToPosts,
  subscribeToUserPosts,
  updatePost,
  deletePost,
  toggleReaction,
  createComment,
  subscribeToComments,
  deleteComment,
  createCommunity,
  subscribeToCommunities,
  subscribeToCommunityMembers,
  joinCommunity,
  leaveCommunity,
  followUser,
  unfollowUser,
  subscribeToFollowing,
  subscribeToNotifications,
  markNotificationRead,
  createReport,
} as const;
