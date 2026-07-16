'use client';

/**
 * StudentOS Junova AI — useConversations Hook
 *
 * Real-time subscription to the user's conversations, plus CRUD actions
 * (rename, pin, delete, create).
 *
 * @see src/features/junova/services/chat.service.ts
 */

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/features/auth';
import { chatService } from '../services/chat.service';
import type { Conversation } from '../types';
import type { StudentOSFirebaseError } from '@/firebase';
import { toast } from 'sonner';

export function useConversations(teacherId?: string) {
  const { user } = useAuth();
  const [internalConversations, setInternalConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<StudentOSFirebaseError | null>(null);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = chatService.subscribeToConversations(
      user.uid,
      (next) => {
        const filtered = teacherId ? next.filter((c) => c.teacherId === teacherId) : next;
        setInternalConversations(filtered);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        setError(err);
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, [user, teacherId]);

  // Derived state: empty list when no user
  const conversations = user ? internalConversations : [];

  const create = useCallback(
    async (tid: string, title?: string) => {
      if (!user) return null;
      const result = await chatService.createConversation(user.uid, tid, title);
      if (result.success && result.data) return result.data;
      if (result.error) toast.error('Failed to create chat', { description: result.error.message });
      return null;
    },
    [user],
  );

  const rename = useCallback(async (conversationId: string, title: string) => {
    const result = await chatService.renameConversation(conversationId, title);
    if (!result.success && result.error) {
      toast.error('Failed to rename chat', { description: result.error.message });
    }
    return result;
  }, []);

  const togglePin = useCallback(async (conversationId: string, pinned: boolean) => {
    const result = await chatService.togglePinConversation(conversationId, pinned);
    if (!result.success && result.error) {
      toast.error('Failed to pin chat', { description: result.error.message });
    }
    return result;
  }, []);

  const remove = useCallback(async (conversationId: string) => {
    const result = await chatService.deleteConversation(conversationId);
    if (result.success) {
      toast.success('Chat deleted');
    } else if (result.error) {
      toast.error('Failed to delete chat', { description: result.error.message });
    }
    return result;
  }, []);

  return {
    conversations,
    isLoading: user ? isLoading : false,
    error,
    create,
    rename,
    togglePin,
    remove,
  };
}
