'use client';

/**
 * StudentOS Career Planner Page
 * AI-powered career roadmap. Protected by <ProtectedRoute>.
 *
 * The CareerPlannerView (~800 LOC + recharts/career service deps) is loaded
 * via next/dynamic so its chunk only downloads when the user navigates to
 * /career-planner, and a skeleton is shown while the chunk loads.
 */

import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/features/auth';
import { Skeleton } from '@/components/ui/skeleton';

const CareerPlannerView = dynamic(
  () => import('@/features/career/components/career-planner-view').then((m) => m.CareerPlannerView),
  {
    loading: () => (
      <div className="flex h-[60vh] items-center justify-center">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    ),
    ssr: false,
  },
);

export default function CareerPlannerPage() {
  return (
    <ProtectedRoute>
      <CareerPlannerView />
    </ProtectedRoute>
  );
}
