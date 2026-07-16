'use client';

/**
 * StudentOS Freelancing Page
 * Freelance marketplace + proposal generator. Protected by <ProtectedRoute>.
 *
 * FreelanceView (~650 LOC + freelance service deps) is loaded via
 * next/dynamic so its chunk only downloads on /freelancing navigation.
 */

import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/features/auth';
import { Skeleton } from '@/components/ui/skeleton';

const FreelanceView = dynamic(
  () => import('@/features/freelance/components/freelance-view').then((m) => m.FreelanceView),
  {
    loading: () => (
      <div className="flex h-[60vh] items-center justify-center">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    ),
    ssr: false,
  },
);

export default function FreelancingPage() {
  return (
    <ProtectedRoute>
      <FreelanceView />
    </ProtectedRoute>
  );
}
