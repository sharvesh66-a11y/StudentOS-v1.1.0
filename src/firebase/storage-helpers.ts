/**
 * StudentOS Firebase Storage Helpers
 *
 * Reusable upload / download-URL / delete helpers. Every helper:
 *   - Validates file size and content type (mirrors `storage.rules`)
 *   - Returns a `StorageHelperResult<T>` envelope
 *   - Normalizes errors via `normalizeFirebaseError`
 *
 * @see src/firebase/storage.ts for the `storage` instance.
 * @see storage.rules for server-side validation (client validation is a
 *      first line of defense — server rules are the source of truth).
 */

import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  type UploadTaskSnapshot,
  type UploadMetadata,
} from 'firebase/storage';
import { storage } from './storage';
import { STORAGE_PATHS } from './constants';
import { normalizeFirebaseError, type StudentOSFirebaseError } from './error-handler';

/** Standard result envelope returned by every Storage helper. */
export interface StorageHelperResult<T> {
  success: boolean;
  data?: T;
  error?: StudentOSFirebaseError;
}

// ---------------------------------------------------------------------------
// Validation (mirrors storage.rules)
// ---------------------------------------------------------------------------

/** Max file size — must match `storage.rules`. */
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/** Allowed content types — must match `storage.rules`. */
export const ALLOWED_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'application/pdf',
  'text/plain',
  'text/markdown',
] as const;

export interface FileValidationResult {
  valid: boolean;
  error?: StudentOSFirebaseError;
}

/** Validate a file before uploading. Mirrors `storage.rules`. */
export function validateFile(file: File | Blob): FileValidationResult {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: {
        code: 'storage/file-too-large',
        message: 'File is too large. Maximum size is 10 MB.',
        field: 'file',
        service: 'storage',
      },
    };
  }
  const contentType = (file as File).type ?? '';
  if (
    contentType &&
    !ALLOWED_CONTENT_TYPES.includes(contentType as (typeof ALLOWED_CONTENT_TYPES)[number])
  ) {
    return {
      valid: false,
      error: {
        code: 'storage/invalid-format',
        message: `File type "${contentType}" is not supported. Allowed: images, PDF, plain text, markdown.`,
        field: 'file',
        service: 'storage',
      },
    };
  }
  return { valid: true };
}

// ---------------------------------------------------------------------------
// Upload
// ---------------------------------------------------------------------------

/**
 * Upload a file and return its download URL.
 *
 * Uses `uploadBytes` (non-resumable) — fine for files < 10 MB. For larger
 * files, use `uploadFileWithProgress`.
 *
 * @example
 *   const res = await uploadFile(
 *     STORAGE_PATHS.userAvatar(uid),
 *     file,
 *     { contentType: file.type },
 *   );
 *   if (res.success) console.log(res.data); // download URL
 */
export async function uploadFile(
  path: string,
  file: File | Blob,
  metadata?: UploadMetadata,
): Promise<StorageHelperResult<string>> {
  // Client-side validation (server rules are still the source of truth).
  const validation = validateFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file, metadata);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return { success: true, data: downloadUrl };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

/**
 * Upload a file with progress reporting via a resumable upload task.
 *
 * @example
 *   const { unsubscribe } = uploadFileWithProgress(
 *     STORAGE_PATHS.noteAttachment(uid, noteId, file.name),
 *     file,
 *     (snapshot) => console.log(`${(snapshot.bytesTransferred / snapshot.totalBytes) * 100}%`),
 *     (error) => console.error(error),
 *     (downloadUrl) => console.log('Done:', downloadUrl),
 *   );
 *   // To cancel: unsubscribe();
 */
export function uploadFileWithProgress(
  path: string,
  file: File | Blob,
  metadata?: UploadMetadata,
  onProgress?: (snapshot: UploadTaskSnapshot) => void,
  onError?: (error: StudentOSFirebaseError) => void,
  onComplete?: (downloadUrl: string) => void,
): { unsubscribe: () => void } {
  // Client-side validation up front.
  const validation = validateFile(file);
  if (!validation.valid) {
    onError?.(validation.error!);
    return { unsubscribe: () => {} };
  }

  const storageRef = ref(storage, path);
  const task = uploadBytesResumable(storageRef, file, metadata);

  const unsubscribe = task.on(
    'state_changed',
    (snapshot) => onProgress?.(snapshot),
    (err) => onError?.(normalizeFirebaseError(err)),
    async () => {
      try {
        const downloadUrl = await getDownloadURL(task.snapshot.ref);
        onComplete?.(downloadUrl);
      } catch (err) {
        onError?.(normalizeFirebaseError(err));
      }
    },
  );

  return {
    unsubscribe: () => {
      unsubscribe();
      task.cancel();
    },
  };
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

/**
 * Get the download URL for a file at a given path.
 */
export async function getFileURL(path: string): Promise<StorageHelperResult<string>> {
  try {
    const storageRef = ref(storage, path);
    const url = await getDownloadURL(storageRef);
    return { success: true, data: url };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

/**
 * Delete a file at a given path.
 */
export async function deleteFile(path: string): Promise<StorageHelperResult<void>> {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: normalizeFirebaseError(err) };
  }
}

// ---------------------------------------------------------------------------
// Convenience — common StudentOS upload patterns
// ---------------------------------------------------------------------------

/**
 * Upload a user's profile avatar.
 * Path: `users/{uid}/avatar`
 */
export async function uploadUserAvatar(
  uid: string,
  file: File,
): Promise<StorageHelperResult<string>> {
  return uploadFile(STORAGE_PATHS.userAvatar(uid), file, {
    contentType: file.type,
    customMetadata: { uploadedBy: uid, purpose: 'avatar' },
  });
}

/**
 * Upload a note attachment.
 * Path: `users/{uid}/notes/{noteId}/{filename}`
 */
export async function uploadNoteAttachment(
  uid: string,
  noteId: string,
  filename: string,
  file: File,
): Promise<StorageHelperResult<string>> {
  return uploadFile(STORAGE_PATHS.noteAttachment(uid, noteId, filename), file, {
    contentType: file.type,
    customMetadata: { uploadedBy: uid, purpose: 'note-attachment', noteId },
  });
}

/**
 * Barrel — all Storage helpers.
 */
export const storageHelpers = {
  uploadFile,
  uploadFileWithProgress,
  getFileURL,
  deleteFile,
  uploadUserAvatar,
  uploadNoteAttachment,
  validateFile,
} as const;
