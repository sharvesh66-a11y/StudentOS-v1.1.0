/**
 * StudentOS Junova AI — Chat Service
 *
 * CRUD operations for conversations and messages. Conversations are stored
 * in `junova_conversations` and messages in the `messages` subcollection.
 *
 * @see src/firebase/firestore-helpers.ts
 * @see src/firebase/constants.ts — COLLECTIONS + junovaConversationMessages
 */

import {
  db,
  COLLECTIONS,
  junovaConversationMessages,
  firestoreHelpers,
  type StudentOSFirebaseError,
} from '@/firebase';
import {
  collection,
  where,
  orderBy,
  limit as limitFn,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { normalizeFirebaseError } from '@/firebase/error-handler';
import type { Conversation, Message, MessageRole } from '../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ChatServiceResult<T> {
  success: boolean;
  data?: T;
  error?: StudentOSFirebaseError;
}

// ---------------------------------------------------------------------------
// Conversations
// ---------------------------------------------------------------------------

/** Create a new conversation. */
export async function createConversation(
  uid: string,
  teacherId: string,
  title = 'New Chat',
): Promise<ChatServiceResult<Conversation>> {
  try {
    const now = Date.now();
    const data = {
      uid,
      teacherId,
      title,
      lastMessagePreview: '',
      messageCount: 0,
      pinned: false,
      createdAt: now,
      updatedAt: now,
    };
    const result = await firestoreHelpers.createDocument(COLLECTIONS.JUNOVA_CONVERSATIONS, data);
    if (!result.success || !result.data) return { success: false, error: result.error };
    return { success: true, data: { id: result.data, ...data } as Conversation };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

/** Get a single conversation. */
export async function getConversation(
  conversationId: string,
): Promise<ChatServiceResult<Conversation | null>> {
  try {
    const result = await firestoreHelpers.getDocument<Conversation>(
      COLLECTIONS.JUNOVA_CONVERSATIONS,
      conversationId,
    );
    if (!result.success) return { success: false, error: result.error };
    return { success: true, data: result.data };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

/** Get all conversations for a user, ordered by updatedAt desc. */
export async function getConversations(uid: string): Promise<ChatServiceResult<Conversation[]>> {
  return firestoreHelpers.queryCollection<Conversation>(
    COLLECTIONS.JUNOVA_CONVERSATIONS,
    where('uid', '==', uid),
    orderBy('updatedAt', 'desc'),
  );
}

/** Subscribe to a user's conversations in real-time. Pinned ones appear first. */
export function subscribeToConversations(
  uid: string,
  onNext: (conversations: Conversation[]) => void,
  onError?: (error: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<Conversation>(
    COLLECTIONS.JUNOVA_CONVERSATIONS,
    (convs) => {
      // Sort: pinned first, then by updatedAt desc
      const sorted = [...convs].sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return b.updatedAt - a.updatedAt;
      });
      onNext(sorted);
    },
    onError,
    where('uid', '==', uid),
    orderBy('updatedAt', 'desc'),
  );
}

/** Rename a conversation. */
export async function renameConversation(
  conversationId: string,
  title: string,
): Promise<ChatServiceResult<void>> {
  return firestoreHelpers.updateDocument(COLLECTIONS.JUNOVA_CONVERSATIONS, conversationId, {
    title,
    updatedAt: Date.now(),
  });
}

/** Toggle the pinned status of a conversation. */
export async function togglePinConversation(
  conversationId: string,
  pinned: boolean,
): Promise<ChatServiceResult<void>> {
  return firestoreHelpers.updateDocument(COLLECTIONS.JUNOVA_CONVERSATIONS, conversationId, {
    pinned,
  });
}

/** Delete a conversation and all its messages. */
export async function deleteConversation(conversationId: string): Promise<ChatServiceResult<void>> {
  try {
    // Delete all messages in the subcollection first
    const messagesPath = junovaConversationMessages(conversationId);
    const messagesSnapshot = await getDocs(collection(db, messagesPath));
    const deletePromises = messagesSnapshot.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deletePromises);

    // Then delete the conversation itself
    return firestoreHelpers.deleteDocument(COLLECTIONS.JUNOVA_CONVERSATIONS, conversationId);
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

/** Update conversation's last message preview + count. */
export async function touchConversation(
  conversationId: string,
  preview: string,
): Promise<ChatServiceResult<void>> {
  try {
    const ref = doc(db, COLLECTIONS.JUNOVA_CONVERSATIONS, conversationId);
    const snap = await getDoc(ref);
    const count = snap.exists() ? (snap.data().messageCount ?? 0) + 1 : 1;
    return firestoreHelpers.updateDocument(COLLECTIONS.JUNOVA_CONVERSATIONS, conversationId, {
      lastMessagePreview: preview.slice(0, 100),
      messageCount: count,
      updatedAt: Date.now(),
    });
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

/** Add a message to a conversation. */
export async function addMessage(
  conversationId: string,
  role: MessageRole,
  content: string,
  attachments?: Message['attachments'],
  extra?: Partial<Message>,
): Promise<ChatServiceResult<Message>> {
  try {
    const now = Date.now();
    const data = {
      conversationId,
      role,
      content,
      attachments: attachments ?? [],
      ...extra,
      createdAt: now,
    };
    const result = await firestoreHelpers.createDocument(
      junovaConversationMessages(conversationId),
      data,
    );
    if (!result.success || !result.data) return { success: false, error: result.error };
    return { success: true, data: { id: result.data, ...data } as Message };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

/** Subscribe to messages in a conversation in real-time. */
export function subscribeToMessages(
  conversationId: string,
  onNext: (messages: Message[]) => void,
  onError?: (error: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<Message>(
    junovaConversationMessages(conversationId),
    onNext,
    onError,
    orderBy('createdAt', 'asc'),
  );
}

/** Update a message (e.g. when streaming completes). */
export async function updateMessage(
  conversationId: string,
  messageId: string,
  updates: Partial<Message>,
): Promise<ChatServiceResult<void>> {
  return firestoreHelpers.updateDocument(
    junovaConversationMessages(conversationId),
    messageId,
    updates,
  );
}

/** Delete a message. */
export async function deleteMessage(
  conversationId: string,
  messageId: string,
): Promise<ChatServiceResult<void>> {
  return firestoreHelpers.deleteDocument(junovaConversationMessages(conversationId), messageId);
}

/** Get recent messages for context (used by the chat API). */
export async function getRecentMessages(
  conversationId: string,
  maxMessages = 20,
): Promise<ChatServiceResult<Message[]>> {
  return firestoreHelpers.queryCollection<Message>(
    junovaConversationMessages(conversationId),
    orderBy('createdAt', 'desc'),
    limitFn(maxMessages),
  );
}

// ---------------------------------------------------------------------------
// Barrel
// ---------------------------------------------------------------------------

export const chatService = {
  createConversation,
  getConversation,
  getConversations,
  subscribeToConversations,
  renameConversation,
  togglePinConversation,
  deleteConversation,
  touchConversation,
  addMessage,
  subscribeToMessages,
  updateMessage,
  deleteMessage,
  getRecentMessages,
} as const;
