'use client';

/**
 * StudentOS AI Tools Page
 * AI tool catalog + executor. Protected by <ProtectedRoute>.
 *
 * ToolsView (~240 LOC + tools service deps) is loaded via next/dynamic
 * so its chunk only downloads on /ai-tools navigation.
 */

import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/features/auth';
import { Skeleton } from '@/components/ui/skeleton';

const ToolsView = dynamic(
  () => import('@/features/tools/components/tools-view').then((m) => m.ToolsView),
  {
    loading: () => (
      <div className="flex h-[60vh] items-center justify-center">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    ),
    ssr: false,
  },
);

export default function AIToolsPage() {
  return (
    <ProtectedRoute>
      <ToolsView />
    </ProtectedRoute>
  );
}
