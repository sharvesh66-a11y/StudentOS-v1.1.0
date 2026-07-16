'use client';
/**
 * StudentOS Notes Hub — useNotes Hook
 * Real-time notes + folders subscription + CRUD + AI generation.
 */
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/features/auth';
import { authedFetch } from '@/lib/api-client';
import { noteService } from '../services/note.service';
import type { Note, NoteFolder, NoteGenerationConfig } from '../types';
import type { StudentOSFirebaseError } from '@/firebase';
import { toast } from 'sonner';

export function useNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<NoteFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<StudentOSFirebaseError | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsubNotes = noteService.subscribeToNotes(
      user.uid,
      (next) => {
        setNotes(next);
        setIsLoading(false);
      },
      (e) => {
        setError(e);
        setIsLoading(false);
      },
    );
    const unsubFolders = noteService.subscribeToFolders(user.uid, setFolders);
    return () => {
      unsubNotes();
      unsubFolders();
    };
  }, [user]);

  const generateNotes = useCallback(
    async (config: NoteGenerationConfig) => {
      if (!user) return null;
      setIsGenerating(true);
      try {
        const response = await authedFetch('/api/notes/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...config, uid: user.uid }),
        });
        const data = await response.json();
        setIsGenerating(false);
        if (data.success && data.notes) {
          // Save to Firestore
          const result = await noteService.createNote(user.uid, {
            ...data.notes,
            subject: config.subject,
            chapter: config.chapter,
            type: config.type,
            aiGenerated: true,
          });
          if (result.success) {
            toast.success('Notes generated!', { description: data.notes.title });
          }
          return data.notes;
        }
        toast.error('Failed to generate notes', {
          description: data.error ?? 'Unknown error',
        });
        return null;
      } catch (err) {
        setIsGenerating(false);
        toast.error('Failed to generate notes', {
          description: err instanceof Error ? err.message : 'Unknown error',
        });
        return null;
      }
    },
    [user],
  );

  const updateNote = useCallback(async (noteId: string, updates: Partial<Note>) => {
    return noteService.updateNote(noteId, updates);
  }, []);

  const deleteNote = useCallback(async (noteId: string) => {
    const result = await noteService.deleteNote(noteId);
    if (result.success) toast.success('Note deleted');
    return result;
  }, []);

  const togglePin = useCallback(async (noteId: string, isPinned: boolean) => {
    return noteService.updateNote(noteId, { isPinned: !isPinned });
  }, []);

  const toggleFavourite = useCallback(async (noteId: string, isFavourite: boolean) => {
    return noteService.updateNote(noteId, { isFavourite: !isFavourite });
  }, []);

  const toggleBookmark = useCallback(async (noteId: string, isBookmarked: boolean) => {
    return noteService.updateNote(noteId, { isBookmarked: !isBookmarked });
  }, []);

  const duplicateNote = useCallback(async (note: Note) => {
    const result = await noteService.duplicateNote(note);
    if (result.success) toast.success('Note duplicated');
    return result;
  }, []);

  const archiveNote = useCallback(async (noteId: string) => {
    const result = await noteService.archiveNote(noteId);
    if (result.success) toast.success('Note archived');
    return result;
  }, []);

  const restoreNote = useCallback(async (noteId: string) => {
    const result = await noteService.restoreNote(noteId);
    if (result.success) toast.success('Note restored');
    return result;
  }, []);

  const exportNote = useCallback((note: Note, format: 'markdown' | 'txt' | 'pdf') => {
    let content = '';
    let mimeType = '';
    let extension = '';

    if (format === 'markdown') {
      content = `# ${note.title}\n\n${note.content}`;
      if (note.summary) content += `\n\n## Summary\n${note.summary}`;
      if (note.keyPoints.length > 0)
        content += `\n\n## Key Points\n${note.keyPoints.map((k) => `- ${k.text}`).join('\n')}`;
      if (note.definitions.length > 0)
        content += `\n\n## Definitions\n${note.definitions.map((d) => `- **${d.term}**: ${d.definition}`).join('\n')}`;
      mimeType = 'text/markdown';
      extension = 'md';
    } else if (format === 'txt') {
      content = `${note.title}\n\n${note.content.replace(/[#*`_~]/g, '')}`;
      mimeType = 'text/plain';
      extension = 'txt';
    } else {
      // PDF — open print dialog
      const printWin = window.open('', '_blank');
      if (printWin) {
        printWin.document.write(
          `<html><head><title>${note.title}</title></head><body style="font-family:sans-serif;max-width:800px;margin:40px auto;padding:20px;"><h1>${note.title}</h1><div>${note.content}</div></body></html>`,
        );
        printWin.document.close();
        printWin.print();
      }
      return;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/[^a-z0-9]/gi, '_')}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported as ${extension.toUpperCase()}`);
  }, []);

  const createFolder = useCallback(
    async (name: string) => {
      if (!user) return;
      return noteService.createFolder(user.uid, name);
    },
    [user],
  );

  return {
    notes: user ? notes : [],
    folders: user ? folders : [],
    isLoading: user ? isLoading : false,
    isGenerating,
    error,
    generateNotes,
    updateNote,
    deleteNote,
    duplicateNote,
    archiveNote,
    restoreNote,
    togglePin,
    toggleFavourite,
    toggleBookmark,
    exportNote,
    createFolder,
  };
}
