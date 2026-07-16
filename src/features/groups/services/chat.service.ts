/**
 * StudentOS Study Groups — Chat Service
 */
import { COLLECTIONS, firestoreHelpers, type StudentOSFirebaseError } from '@/firebase';
import { normalizeFirebaseError } from '@/firebase/error-handler';
import { where, orderBy, type Unsubscribe } from 'firebase/firestore';
import type { GroupMessage, GroupSession, GroupFile, GroupNotification } from '../types';

export interface ChatResult<T> {
  success: boolean;
  data?: T;
  error?: StudentOSFirebaseError;
}

// --- Messages ---

export async function sendMessage(
  groupId: string,
  data: {
    uid: string;
    displayName: string;
    photoURL: string | null;
    content: string;
    replyTo?: string | null;
    attachments?: GroupMessage['attachments'];
  },
): Promise<ChatResult<void>> {
  try {
    const now = Date.now();
    await firestoreHelpers.createDocument(COLLECTIONS.GROUP_MESSAGES, {
      groupId,
      ...data,
      replyTo: data.replyTo ?? null,
      isEdited: false,
      isPinned: false,
      reactions: {},
      readBy: [data.uid],
      attachments: data.attachments ?? [],
      createdAt: now,
      updatedAt: now,
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export function subscribeToMessages(
  groupId: string,
  onNext: (m: GroupMessage[]) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<GroupMessage>(
    COLLECTIONS.GROUP_MESSAGES,
    onNext,
    onError,
    where('groupId', '==', groupId),
    orderBy('createdAt', 'asc'),
  );
}

export async function editMessage(messageId: string, content: string): Promise<ChatResult<void>> {
  try {
    return firestoreHelpers.updateDocument(COLLECTIONS.GROUP_MESSAGES, messageId, {
      content,
      isEdited: true,
      updatedAt: Date.now(),
    });
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export async function deleteMessage(messageId: string): Promise<ChatResult<void>> {
  try {
    return firestoreHelpers.deleteDocument(COLLECTIONS.GROUP_MESSAGES, messageId);
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export async function togglePinMessage(
  messageId: string,
  isPinned: boolean,
): Promise<ChatResult<void>> {
  try {
    return firestoreHelpers.updateDocument(COLLECTIONS.GROUP_MESSAGES, messageId, {
      isPinned: !isPinned,
    });
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export async function addReaction(
  messageId: string,
  emoji: string,
  uid: string,
  currentReactions: Record<string, string[]>,
): Promise<ChatResult<void>> {
  try {
    const updated = { ...currentReactions };
    if (!updated[emoji]) updated[emoji] = [];
    if (updated[emoji].includes(uid)) updated[emoji] = updated[emoji].filter((u) => u !== uid);
    else updated[emoji].push(uid);
    if (updated[emoji].length === 0) delete updated[emoji];
    return firestoreHelpers.updateDocument(COLLECTIONS.GROUP_MESSAGES, messageId, {
      reactions: updated,
    });
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

// --- Sessions ---

export async function createSession(
  groupId: string,
  data: {
    title: string;
    description: string;
    scheduledAt: number;
    durationMinutes: number;
    createdBy: string;
  },
): Promise<ChatResult<void>> {
  try {
    const now = Date.now();
    await firestoreHelpers.createDocument(COLLECTIONS.GROUP_SESSIONS, {
      groupId,
      ...data,
      status: 'scheduled',
      attendees: [],
      createdAt: now,
      updatedAt: now,
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export function subscribeToSessions(
  groupId: string,
  onNext: (s: GroupSession[]) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<GroupSession>(
    COLLECTIONS.GROUP_SESSIONS,
    onNext,
    onError,
    where('groupId', '==', groupId),
    orderBy('scheduledAt', 'asc'),
  );
}

// --- Files ---

export async function shareFile(
  groupId: string,
  data: {
    uid: string;
    uploadedByName: string;
    type: GroupFile['type'];
    url: string;
    filename: string;
    size: number;
  },
): Promise<ChatResult<void>> {
  try {
    await firestoreHelpers.createDocument(COLLECTIONS.GROUP_FILES, {
      groupId,
      ...data,
      createdAt: Date.now(),
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export function subscribeToFiles(
  groupId: string,
  onNext: (f: GroupFile[]) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<GroupFile>(
    COLLECTIONS.GROUP_FILES,
    onNext,
    onError,
    where('groupId', '==', groupId),
    orderBy('createdAt', 'desc'),
  );
}

// --- Notifications ---

export async function createNotification(
  uid: string,
  data: {
    groupId: string;
    groupName: string;
    type: GroupNotification['type'];
    title: string;
    message: string;
  },
): Promise<ChatResult<void>> {
  try {
    await firestoreHelpers.createDocument(COLLECTIONS.GROUP_NOTIFICATIONS, {
      uid,
      ...data,
      read: false,
      createdAt: Date.now(),
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export function subscribeToNotifications(
  uid: string,
  onNext: (n: GroupNotification[]) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<GroupNotification>(
    COLLECTIONS.GROUP_NOTIFICATIONS,
    onNext,
    onError,
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
  );
}

export async function markNotificationRead(notificationId: string): Promise<ChatResult<void>> {
  try {
    return firestoreHelpers.updateDocument(COLLECTIONS.GROUP_NOTIFICATIONS, notificationId, {
      read: true,
    });
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export const chatService = {
  sendMessage,
  subscribeToMessages,
  editMessage,
  deleteMessage,
  togglePinMessage,
  addReaction,
  createSession,
  subscribeToSessions,
  shareFile,
  subscribeToFiles,
  createNotification,
  subscribeToNotifications,
  markNotificationRead,
} as const;
