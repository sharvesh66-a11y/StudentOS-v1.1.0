/**
 * StudentOS Study Groups — Group Service
 */
import { COLLECTIONS, firestoreHelpers, type StudentOSFirebaseError } from '@/firebase';
import { normalizeFirebaseError } from '@/firebase/error-handler';
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  where,
  orderBy,
  limit,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/firebase';
import type { StudyGroup, GroupMember, MemberRole, CreateGroupConfig } from '../types';

export interface GroupResult<T> {
  success: boolean;
  data?: T;
  error?: StudentOSFirebaseError;
}

export async function createGroup(
  uid: string,
  displayName: string,
  config: CreateGroupConfig,
): Promise<GroupResult<StudyGroup>> {
  try {
    const now = Date.now();
    const payload = {
      ...config,
      memberCount: 1,
      createdBy: uid,
      createdByName: displayName,
      coverImageURL: null,
      avatarURL: null,
      createdAt: now,
      updatedAt: now,
      lastActivityAt: now,
    };
    const result = await firestoreHelpers.createDocument(COLLECTIONS.STUDY_GROUPS, payload);
    if (!result.success || !result.data) return { success: false, error: result.error };
    const group = { id: result.data, ...payload } as StudyGroup;
    // Create owner member record
    await firestoreHelpers.createDocument(COLLECTIONS.GROUP_MEMBERS, {
      groupId: group.id,
      uid,
      displayName,
      photoURL: null,
      role: 'owner' as MemberRole,
      joinedAt: now,
      isOnline: true,
      lastSeenAt: now,
    });
    return { success: true, data: group };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export function subscribeToGroups(
  onNext: (g: StudyGroup[]) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<StudyGroup>(
    COLLECTIONS.STUDY_GROUPS,
    onNext,
    onError,
    orderBy('lastActivityAt', 'desc'),
    limit(50),
  );
}

export function subscribeToMyGroups(
  uid: string,
  onNext: (g: StudyGroup[]) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<StudyGroup>(
    COLLECTIONS.STUDY_GROUPS,
    onNext,
    onError,
    where('createdBy', '==', uid),
    orderBy('createdAt', 'desc'),
  );
}

export async function getGroup(groupId: string): Promise<GroupResult<StudyGroup | null>> {
  try {
    const ref = doc(db, COLLECTIONS.STUDY_GROUPS, groupId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: true, data: null };
    return { success: true, data: { id: snap.id, ...snap.data() } as StudyGroup };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export async function updateGroup(
  groupId: string,
  updates: Partial<StudyGroup>,
): Promise<GroupResult<void>> {
  try {
    await updateDoc(doc(db, COLLECTIONS.STUDY_GROUPS, groupId), {
      ...updates,
      updatedAt: Date.now(),
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export async function deleteGroup(groupId: string): Promise<GroupResult<void>> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.STUDY_GROUPS, groupId));
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

// --- Members ---

export function subscribeToMembers(
  groupId: string,
  onNext: (m: GroupMember[]) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<GroupMember>(
    COLLECTIONS.GROUP_MEMBERS,
    onNext,
    onError,
    where('groupId', '==', groupId),
    orderBy('joinedAt', 'asc'),
  );
}

export async function joinGroup(
  groupId: string,
  uid: string,
  displayName: string,
  photoURL: string | null,
): Promise<GroupResult<void>> {
  try {
    await firestoreHelpers.createDocument(COLLECTIONS.GROUP_MEMBERS, {
      groupId,
      uid,
      displayName,
      photoURL,
      role: 'member' as MemberRole,
      joinedAt: Date.now(),
      isOnline: true,
      lastSeenAt: Date.now(),
    });
    // Increment member count
    const groupResult = await getGroup(groupId);
    if (groupResult.success && groupResult.data)
      await updateGroup(groupId, { memberCount: groupResult.data.memberCount + 1 });
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export async function leaveGroup(groupId: string, uid: string): Promise<GroupResult<void>> {
  try {
    // Find and delete member record
    const membersResult = await firestoreHelpers.queryCollection<GroupMember>(
      COLLECTIONS.GROUP_MEMBERS,
      where('groupId', '==', groupId),
      where('uid', '==', uid),
    );
    if (membersResult.success && membersResult.data) {
      // Batch delete: was sequential `for ... await`, now parallelised.
      await Promise.all(
        membersResult.data.map((m) =>
          firestoreHelpers.deleteDocument(COLLECTIONS.GROUP_MEMBERS, m.id),
        ),
      );
    }
    // Decrement member count
    const groupResult = await getGroup(groupId);
    if (groupResult.success && groupResult.data)
      await updateGroup(groupId, { memberCount: Math.max(0, groupResult.data.memberCount - 1) });
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export async function updateMemberRole(
  memberId: string,
  role: MemberRole,
): Promise<GroupResult<void>> {
  try {
    return firestoreHelpers.updateDocument(COLLECTIONS.GROUP_MEMBERS, memberId, { role });
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export async function removeMember(memberId: string): Promise<GroupResult<void>> {
  try {
    return firestoreHelpers.deleteDocument(COLLECTIONS.GROUP_MEMBERS, memberId);
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export async function transferOwnership(
  groupId: string,
  newOwnerId: string,
  oldOwnerId: string,
): Promise<GroupResult<void>> {
  try {
    await updateGroup(groupId, { createdBy: newOwnerId });
    // Update roles
    const membersResult = await firestoreHelpers.queryCollection<GroupMember>(
      COLLECTIONS.GROUP_MEMBERS,
      where('groupId', '==', groupId),
    );
    if (membersResult.success && membersResult.data) {
      // Batch role update: was sequential `for ... await`, now parallelised.
      await Promise.all(
        membersResult.data.map((m) => {
          if (m.uid === newOwnerId) return updateMemberRole(m.id, 'owner');
          if (m.uid === oldOwnerId) return updateMemberRole(m.id, 'admin');
          return Promise.resolve();
        }),
      );
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export const groupService = {
  createGroup,
  subscribeToGroups,
  subscribeToMyGroups,
  getGroup,
  updateGroup,
  deleteGroup,
  subscribeToMembers,
  joinGroup,
  leaveGroup,
  updateMemberRole,
  removeMember,
  transferOwnership,
} as const;
