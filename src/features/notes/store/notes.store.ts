/**
 * StudentOS Notes Hub — Zustand Store
 */
import { create } from 'zustand';
import type { NoteGenerationConfig, DoubtConfig } from '../types';
import { DEFAULT_NOTE_CONFIG } from '../types';

type NotesView = 'list' | 'generate' | 'view' | 'doubt';

interface NotesStore {
  view: NotesView;
  noteConfig: NoteGenerationConfig;
  doubtConfig: DoubtConfig;
  selectedNoteId: string | null;
  setView: (v: NotesView) => void;
  setNoteConfig: (c: Partial<NoteGenerationConfig>) => void;
  setDoubtConfig: (c: Partial<DoubtConfig>) => void;
  setSelectedNoteId: (id: string | null) => void;
}

export const useNotesStore = create<NotesStore>((set) => ({
  view: 'list',
  noteConfig: DEFAULT_NOTE_CONFIG,
  doubtConfig: { question: '', subject: 'General', topic: '', teacherId: null },
  selectedNoteId: null,
  setView: (view) => set({ view }),
  setNoteConfig: (noteConfig) => set((s) => ({ noteConfig: { ...s.noteConfig, ...noteConfig } })),
  setDoubtConfig: (doubtConfig) =>
    set((s) => ({ doubtConfig: { ...s.doubtConfig, ...doubtConfig } })),
  setSelectedNoteId: (selectedNoteId) => set({ selectedNoteId }),
}));
