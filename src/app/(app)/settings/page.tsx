'use client';

/**
 * StudentOS Settings Page
 * User preferences + subscription management. Protected by <ProtectedRoute>.
 *
 * SettingsView (~900 LOC + settings service deps) is loaded via
 * next/dynamic so its chunk only downloads on /settings navigation.
 */

import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/features/auth';
import { Skeleton } from '@/components/ui/skeleton';

const SettingsView = dynamic(
  () => import('@/features/settings/components/settings-view').then((m) => m.SettingsView),
  {
    loading: () => (
      <div className="flex h-[60vh] items-center justify-center">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    ),
    ssr: false,
  },
);

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsView />
    </ProtectedRoute>
  );
}
