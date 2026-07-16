'use client';

/**
 * StudentOS Scholarship Finder Page
 * AI-powered scholarship matching. Protected by <ProtectedRoute>.
 *
 * ScholarshipFinderView (~600 LOC + scholarships service deps) is loaded
 * via next/dynamic so its chunk only downloads on /scholarship-finder.
 */

import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/features/auth';
import { Skeleton } from '@/components/ui/skeleton';

const ScholarshipFinderView = dynamic(
  () =>
    import('@/features/scholarships/components/scholarship-finder-view').then(
      (m) => m.ScholarshipFinderView,
    ),
  {
    loading: () => (
      <div className="flex h-[60vh] items-center justify-center">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    ),
    ssr: false,
  },
);

export default function ScholarshipFinderPage() {
  return (
    <ProtectedRoute>
      <ScholarshipFinderView />
    </ProtectedRoute>
  );
}
