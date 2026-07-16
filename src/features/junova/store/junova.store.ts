/**
 * StudentOS Junova AI — Zustand Store
 *
 * Holds the active teacher + active conversation for the Junova AI page.
 * Components subscribe via selectors to avoid unnecessary re-renders.
 */

import { create } from 'zustand';
import type { AITeacher, Conversation } from '../types';

interface JunovaStore {
  activeTeacher: AITeacher | null;
  activeConversation: Conversation | null;
  showTeacherForm: boolean;
  editingTeacher: AITeacher | null;

  setActiveTeacher: (teacher: AITeacher | null) => void;
  setActiveConversation: (conversation: Conversation | null) => void;
  setShowTeacherForm: (show: boolean) => void;
  setEditingTeacher: (teacher: AITeacher | null) => void;
}

export const useJunovaStore = create<JunovaStore>((set) => ({
  activeTeacher: null,
  activeConversation: null,
  showTeacherForm: false,
  editingTeacher: null,

  setActiveTeacher: (activeTeacher) => set({ activeTeacher }),
  setActiveConversation: (activeConversation) => set({ activeConversation }),
  setShowTeacherForm: (showTeacherForm) => set({ showTeacherForm }),
  setEditingTeacher: (editingTeacher) =>
    set({ editingTeacher, showTeacherForm: Boolean(editingTeacher) }),
}));
