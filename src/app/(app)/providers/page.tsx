'use client';

/**
 * StudentOS AI Providers Page
 *
 * Route: /providers
 *
 * Displays the AI Provider Manager where users can connect free AI providers
 * and see coming-soon premium providers.
 */

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { ProtectedRoute } from '@/features/auth';

const ProvidersView = dynamic(
  () => import('@/features/providers/components/providers-view').then((m) => m.ProvidersView),
  {
    loading: () => (
      <div className="flex h-[60vh] items-center justify-center">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    ),
    ssr: false,
  },
);

function ProvidersContent() {
  return <ProvidersView />;
}

export default function ProvidersPage() {
  return (
    <ProtectedRoute>
      <ProvidersContent />
    </ProtectedRoute>
  );
}
