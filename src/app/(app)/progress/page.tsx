'use client';

/**
 * StudentOS Progress & Analytics Page
 * Protected by <ProtectedRoute>.
 *
 * AnalyticsDashboard (~400 LOC + recharts + analytics service deps) is
 * loaded via next/dynamic so its heavy charting chunk only downloads on
 * /progress navigation. Recharts alone is ~150 KB gzipped.
 */

import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/features/auth';
import { Skeleton } from '@/components/ui/skeleton';

const AnalyticsDashboard = dynamic(
  () =>
    import('@/features/analytics/components/analytics-dashboard').then((m) => m.AnalyticsDashboard),
  {
    loading: () => (
      <div className="flex h-[60vh] items-center justify-center">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    ),
    ssr: false,
  },
);

export default function ProgressPage() {
  return (
    <ProtectedRoute>
      <AnalyticsDashboard />
    </ProtectedRoute>
  );
}
