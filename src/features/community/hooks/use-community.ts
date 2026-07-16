'use client';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/features/auth';
import { authedFetch } from '@/lib/api-client';
import { communityService } from '../services/community.service';
import type { CommunityProfile, CommunityPost, Community, CommunityNotification } from '../types';
import { toast } from 'sonner';

export function useCommunity() {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [communityProfile, setCommunityProfile] = useState<CommunityProfile | null>(null);
  const [notifications, setNotifications] = useState<CommunityNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!user) return;
    const u1 = communityService.subscribeToPosts(setPosts);
    const u2 = communityService.subscribeToCommunities(setCommunities);
    const u3 = communityService.subscribeToProfile(user.uid, (p) => {
      setCommunityProfile(p);
      setIsLoading(false);
    });
    const u4 = communityService.subscribeToNotifications(user.uid, setNotifications);
    return () => {
      u1();
      u2();
      u3();
      u4();
    };
  }, [user]);

  const createPost = useCallback(
    async (data: {
      content: string;
      type: 'text' | 'image' | 'link' | 'note';
      tags: string[];
      mediaURL?: string | null;
      linkURL?: string | null;
    }) => {
      if (!user || !profile) return;
      await communityService.createPost(user.uid, {
        ...data,
        authorName: profile.displayName ?? 'Student',
        authorPhotoURL: profile.photoURL ?? null,
      });
      toast.success('Post created!');
    },
    [user, profile],
  );

  const toggleReaction = useCallback(
    async (postId: string, emoji: string, currentReactions: Record<string, string[]>) => {
      if (!user) return;
      await communityService.toggleReaction(postId, emoji, user.uid, currentReactions);
    },
    [user],
  );

  const togglePin = useCallback(async (postId: string, isPinned: boolean) => {
    await communityService.updatePost(postId, { isPinned: !isPinned });
  }, []);

  const toggleBookmark = useCallback(async (postId: string, isBookmarked: boolean) => {
    await communityService.updatePost(postId, { isBookmarked: !isBookmarked });
  }, []);

  const removePost = useCallback(async (postId: string) => {
    await communityService.deletePost(postId);
    toast.success('Post deleted');
  }, []);

  const joinCommunity = useCallback(
    async (communityId: string) => {
      if (!user || !profile) return;
      await communityService.joinCommunity(communityId, user.uid, profile.displayName ?? 'Student');
      toast.success('Joined community!');
    },
    [user, profile],
  );

  const createCommunity = useCallback(
    async (name: string, description: string, subject: string, privacy: 'public' | 'private') => {
      if (!user || !profile) return;
      await communityService.createCommunity(user.uid, name, {
        description,
        subject,
        privacy,
        createdByName: profile.displayName ?? 'Student',
      });
      toast.success('Community created!');
    },
    [user, profile],
  );

  const generatePost = useCallback(
    async (topic: string) => {
      if (!user || !profile) return '';
      setIsGenerating(true);
      try {
        const res = await authedFetch('/api/community/generate-post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, studentName: profile.displayName ?? 'Student' }),
        });
        const data = await res.json();
        setIsGenerating(false);
        if (data.success) {
          toast.success('AI post generated!');
          return data.text;
        }
        toast.error('AI generation failed', {
          description: data.error ?? 'Unknown error',
        });
        return '';
      } catch (err) {
        setIsGenerating(false);
        toast.error('AI generation failed', {
          description: err instanceof Error ? err.message : 'Unknown error',
        });
        return '';
      }
    },
    [user, profile],
  );

  return {
    posts,
    communities,
    communityProfile,
    notifications,
    isLoading: user ? isLoading : false,
    isGenerating,
    createPost,
    toggleReaction,
    togglePin,
    toggleBookmark,
    removePost,
    joinCommunity,
    createCommunity,
    generatePost,
  };
}
