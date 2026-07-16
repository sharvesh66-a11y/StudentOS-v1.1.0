/**
 * StudentOS Notes Hub — Feature Barrel
 */
export { NotesHubView } from './components/notes-hub-view';
export { noteService } from './services/note.service';
export { doubtService } from './services/doubt.service';
export { useNotes } from './hooks/use-notes';
export { useDoubts } from './hooks/use-doubts';
export { useNotesStore } from './store/notes.store';
export type {
  Note,
  NoteFolder,
  Doubt,
  NoteType,
  NoteGenerationConfig,
  DoubtConfig,
  Flashcard,
  KeyPoint,
  Definition,
  Formula,
  Example,
  NoteAttachment,
} from './types';
