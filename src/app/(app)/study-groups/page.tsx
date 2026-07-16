'use client';

/**
 * StudentOS Study Groups Page
 * Group chat + collaborative sessions. Protected by <ProtectedRoute>.
 *
 * StudyGroupsView (~810 LOC + chat service deps) is loaded via
 * next/dynamic so its chunk only downloads on /study-groups navigation.
 */

import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/features/auth';
import { Skeleton } from '@/components/ui/skeleton';

const StudyGroupsView = dynamic(
  () => import('@/features/groups/components/study-groups-view').then((m) => m.StudyGroupsView),
  {
    loading: () => (
      <div className="flex h-[60vh] items-center justify-center">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    ),
    ssr: false,
  },
);

export default function StudyGroupsPage() {
  return (
    <ProtectedRoute>
      <StudyGroupsView />
    </ProtectedRoute>
  );
}
