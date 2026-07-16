'use client';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/features/auth';
import { groupService } from '../services/group.service';
import type { StudyGroup, GroupMember } from '../types';
import { toast } from 'sonner';

export function useGroups() {
  const { user, profile } = useAuth();
  const [allGroups, setAllGroups] = useState<StudyGroup[]>([]);
  const [myGroups, setMyGroups] = useState<StudyGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub1 = groupService.subscribeToGroups((g) => {
      setAllGroups(g);
      setIsLoading(false);
    });
    const unsub2 = groupService.subscribeToMyGroups(user.uid, setMyGroups);
    return () => {
      unsub1();
      unsub2();
    };
  }, [user]);

  const create = useCallback(
    async (config: Parameters<typeof groupService.createGroup>[2]) => {
      if (!user || !profile) return;
      const result = await groupService.createGroup(
        user.uid,
        profile.displayName ?? 'Student',
        config,
      );
      if (result.success) toast.success('Group created!');
      return result;
    },
    [user, profile],
  );

  const join = useCallback(
    async (group: StudyGroup) => {
      if (!user || !profile) return;
      const result = await groupService.joinGroup(
        group.id,
        user.uid,
        profile.displayName ?? 'Student',
        profile.photoURL,
      );
      if (result.success) toast.success(`Joined ${group.name}`);
      return result;
    },
    [user, profile],
  );

  const leave = useCallback(
    async (groupId: string) => {
      if (!user) return;
      const result = await groupService.leaveGroup(groupId, user.uid);
      if (result.success) toast.success('Left group');
      return result;
    },
    [user],
  );

  const remove = useCallback(async (groupId: string) => {
    const result = await groupService.deleteGroup(groupId);
    if (result.success) toast.success('Group deleted');
    return result;
  }, []);

  return {
    allGroups: user ? allGroups : [],
    myGroups: user ? myGroups : [],
    isLoading: user ? isLoading : false,
    create,
    join,
    leave,
    remove,
  };
}

export function useGroupMembers(groupId: string | null) {
  const [members, setMembers] = useState<GroupMember[]>([]);
  useEffect(() => {
    if (!groupId) return;
    return groupService.subscribeToMembers(groupId, setMembers);
  }, [groupId]);
  return members;
}
