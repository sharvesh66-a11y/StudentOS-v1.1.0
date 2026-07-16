'use client';

/**
 * StudentOS Community Page
 * Social feed + community features. Protected by <ProtectedRoute>.
 *
 * CommunityView (~550 LOC + markdown/community service deps) is loaded via
 * next/dynamic so its chunk only downloads on /community navigation.
 */

import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/features/auth';
import { Skeleton } from '@/components/ui/skeleton';

const CommunityView = dynamic(
  () => import('@/features/community/components/community-view').then((m) => m.CommunityView),
  {
    loading: () => (
      <div className="flex h-[60vh] items-center justify-center">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    ),
    ssr: false,
  },
);

export default function CommunityPage() {
  return (
    <ProtectedRoute>
      <CommunityView />
    </ProtectedRoute>
  );
}
