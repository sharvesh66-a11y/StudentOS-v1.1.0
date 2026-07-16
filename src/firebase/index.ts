/**
 * StudentOS Firebase barrel export.
 *
 * Import from here for client-side Firebase access:
 *   import { auth, db, storage, COLLECTIONS, firestoreHelpers } from '@/firebase'
 *
 * The Admin SDK is intentionally NOT re-exported here to prevent accidental
 * client-side imports. Import it directly from `@/firebase/admin` in
 * server-only contexts:
 *   import { adminAuth } from '@/firebase/admin'
 */

// Per-service singletons
export { app, isFirebaseReady } from './app';
export { auth } from './auth';
export { db } from './firestore';
export { storage } from './storage';

// Config
export { firebaseConfig, isFirebaseConfigured } from './config';

// Constants
export {
  COLLECTIONS,
  STORAGE_PATHS,
  EMULATOR_CONFIG,
  junovaConversationMessages,
  planItems,
  type CollectionName,
} from './constants';

// Types
export {
  type UserProfile,
  type FirestoreDocument,
  type FirestoreWriteResult,
  newUserProfileFromFirebase,
} from './types';

// Error handling
export {
  normalizeFirebaseError,
  isFirebaseError,
  type StudentOSFirebaseError,
  type FirebaseService,
  type FirebaseErrorField,
} from './error-handler';

// Firestore helpers
export {
  firestoreHelpers,
  getDocument,
  queryCollection,
  subscribeToDocument,
  subscribeToQuery,
  createDocument,
  updateDocument,
  setDocument,
  deleteDocument,
  type FirestoreHelperResult,
} from './firestore-helpers';

// Storage helpers
export {
  storageHelpers,
  uploadFile,
  uploadFileWithProgress,
  getFileURL,
  deleteFile,
  uploadUserAvatar,
  uploadNoteAttachment,
  validateFile,
  MAX_FILE_SIZE,
  ALLOWED_CONTENT_TYPES,
  type StorageHelperResult,
} from './storage-helpers';
