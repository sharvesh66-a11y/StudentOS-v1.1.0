'use client';

/**
 * StudentOS Planner Page
 *
 * The Smart Study Planner. Protected by <ProtectedRoute>.
 *
 * PlannerView + child calendar/timeline views are loaded via next/dynamic
 * so the planner chunk only downloads on /planner navigation.
 *
 * @see src/features/planner/components/planner-view.tsx
 */

import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/features/auth';
import { Skeleton } from '@/components/ui/skeleton';

const PlannerView = dynamic(
  () => import('@/features/planner/components/planner-view').then((m) => m.PlannerView),
  {
    loading: () => (
      <div className="flex h-[60vh] items-center justify-center">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    ),
    ssr: false,
  },
);

export default function PlannerPage() {
  return (
    <ProtectedRoute>
      <PlannerView />
    </ProtectedRoute>
  );
}
