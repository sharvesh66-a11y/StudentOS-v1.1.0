'use client';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/features/auth';
import { chatService } from '../services/chat.service';
import type { GroupMessage, GroupSession, GroupFile, GroupNotification } from '../types';

export function useGroupChat(groupId: string | null) {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [sessions, setSessions] = useState<GroupSession[]>([]);
  const [files, setFiles] = useState<GroupFile[]>([]);

  useEffect(() => {
    if (!groupId) return;
    const unsub1 = chatService.subscribeToMessages(groupId, setMessages);
    const unsub2 = chatService.subscribeToSessions(groupId, setSessions);
    const unsub3 = chatService.subscribeToFiles(groupId, setFiles);
    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [groupId]);

  const send = useCallback(
    async (content: string, replyTo?: string) => {
      if (!user || !profile || !groupId || !content.trim()) return;
      await chatService.sendMessage(groupId, {
        uid: user.uid,
        displayName: profile.displayName ?? 'Student',
        photoURL: profile.photoURL,
        content,
        replyTo,
      });
    },
    [user, profile, groupId],
  );

  const edit = useCallback(async (messageId: string, content: string) => {
    await chatService.editMessage(messageId, content);
  }, []);

  const del = useCallback(async (messageId: string) => {
    await chatService.deleteMessage(messageId);
  }, []);

  const react = useCallback(
    async (messageId: string, emoji: string, currentReactions: Record<string, string[]>) => {
      if (!user) return;
      await chatService.addReaction(messageId, emoji, user.uid, currentReactions);
    },
    [user],
  );

  return { messages, sessions, files, send, edit, del, react };
}

export function useGroupNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<GroupNotification[]>([]);

  useEffect(() => {
    if (!user) return;
    return chatService.subscribeToNotifications(user.uid, setNotifications);
  }, [user]);

  const markRead = useCallback(async (id: string) => {
    await chatService.markNotificationRead(id);
  }, []);
  return { notifications: user ? notifications : [], markRead };
}
