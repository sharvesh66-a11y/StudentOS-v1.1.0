/**
 * StudentOS Notes Hub — Note Service
 * CRUD for notes + folders at `notes/{noteId}` and `note_folders/{folderId}`.
 */
import { COLLECTIONS, firestoreHelpers, type StudentOSFirebaseError } from '@/firebase';
import { normalizeFirebaseError } from '@/firebase/error-handler';
import { where, orderBy, type Unsubscribe } from 'firebase/firestore';
import type { Note, NoteFolder } from '../types';

export interface NoteServiceResult<T> {
  success: boolean;
  data?: T;
  error?: StudentOSFirebaseError;
}

// --- Notes ---

export async function createNote(
  uid: string,
  data: Partial<Note>,
): Promise<NoteServiceResult<Note>> {
  try {
    const now = Date.now();
    const payload = {
      uid,
      title: data.title ?? 'Untitled',
      subject: data.subject ?? 'General',
      chapter: data.chapter ?? '',
      type: data.type ?? 'topic',
      content: data.content ?? '',
      summary: data.summary ?? null,
      keyPoints: data.keyPoints ?? [],
      definitions: data.definitions ?? [],
      formulas: data.formulas ?? [],
      examples: data.examples ?? [],
      flashcards: data.flashcards ?? [],
      tags: data.tags ?? [],
      labels: data.labels ?? [],
      folderId: data.folderId ?? null,
      isPinned: false,
      isFavourite: false,
      isBookmarked: false,
      isArchived: false,
      aiGenerated: data.aiGenerated ?? false,
      attachments: data.attachments ?? [],
      createdAt: now,
      updatedAt: now,
    };
    const result = await firestoreHelpers.createDocument(COLLECTIONS.NOTES, payload);
    if (!result.success || !result.data) return { success: false, error: result.error };
    return { success: true, data: { id: result.data, ...payload } as Note };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export function subscribeToNotes(
  uid: string,
  onNext: (notes: Note[]) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<Note>(
    COLLECTIONS.NOTES,
    onNext,
    onError,
    where('uid', '==', uid),
    orderBy('updatedAt', 'desc'),
  );
}

export async function getNote(noteId: string): Promise<NoteServiceResult<Note | null>> {
  try {
    const result = await firestoreHelpers.getDocument<Note>(COLLECTIONS.NOTES, noteId);
    if (!result.success) return { success: false, error: result.error };
    return { success: true, data: result.data };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export async function updateNote(
  noteId: string,
  updates: Partial<Note>,
): Promise<NoteServiceResult<void>> {
  try {
    return firestoreHelpers.updateDocument(COLLECTIONS.NOTES, noteId, {
      ...updates,
      updatedAt: Date.now(),
    });
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export async function deleteNote(noteId: string): Promise<NoteServiceResult<void>> {
  try {
    return firestoreHelpers.deleteDocument(COLLECTIONS.NOTES, noteId);
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export async function duplicateNote(note: Note): Promise<NoteServiceResult<Note>> {
  try {
    const now = Date.now();
    const payload = {
      ...note,
      id: undefined,
      title: `${note.title} (Copy)`,
      isPinned: false,
      isFavourite: false,
      isBookmarked: false,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };
    const { id: _id, ...dataWithoutId } = payload;
    const result = await firestoreHelpers.createDocument(COLLECTIONS.NOTES, dataWithoutId);
    if (!result.success || !result.data) return { success: false, error: result.error };
    return { success: true, data: { id: result.data, ...dataWithoutId } as Note };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export async function archiveNote(noteId: string): Promise<NoteServiceResult<void>> {
  try {
    return firestoreHelpers.updateDocument(COLLECTIONS.NOTES, noteId, {
      isArchived: true,
      isPinned: false,
      updatedAt: Date.now(),
    });
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export async function restoreNote(noteId: string): Promise<NoteServiceResult<void>> {
  try {
    return firestoreHelpers.updateDocument(COLLECTIONS.NOTES, noteId, {
      isArchived: false,
      updatedAt: Date.now(),
    });
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

// --- Folders ---

export async function createFolder(
  uid: string,
  name: string,
  parentId: string | null = null,
): Promise<NoteServiceResult<NoteFolder>> {
  try {
    const now = Date.now();
    const payload = { uid, name, parentId, createdAt: now, updatedAt: now };
    const result = await firestoreHelpers.createDocument(COLLECTIONS.NOTE_FOLDERS, payload);
    if (!result.success || !result.data) return { success: false, error: result.error };
    return { success: true, data: { id: result.data, ...payload } as NoteFolder };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export function subscribeToFolders(
  uid: string,
  onNext: (folders: NoteFolder[]) => void,
  onError?: (e: StudentOSFirebaseError) => void,
): Unsubscribe {
  return firestoreHelpers.subscribeToQuery<NoteFolder>(
    COLLECTIONS.NOTE_FOLDERS,
    onNext,
    onError,
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
  );
}

export async function deleteFolder(folderId: string): Promise<NoteServiceResult<void>> {
  try {
    return firestoreHelpers.deleteDocument(COLLECTIONS.NOTE_FOLDERS, folderId);
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

export const noteService = {
  createNote,
  subscribeToNotes,
  getNote,
  updateNote,
  deleteNote,
  duplicateNote,
  archiveNote,
  restoreNote,
  createFolder,
  subscribeToFolders,
  deleteFolder,
} as const;
