'use client';

/**
 * StudentOS Notes Hub Page
 * AI Notes + Doubt Solver. Protected by <ProtectedRoute>.
 *
 * NotesHubView (~585 LOC + notes/doubt services + MarkdownRenderer) is
 * loaded via next/dynamic so its chunk only downloads on /notes.
 */

import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/features/auth';
import { Skeleton } from '@/components/ui/skeleton';

const NotesHubView = dynamic(
  () => import('@/features/notes/components/notes-hub-view').then((m) => m.NotesHubView),
  {
    loading: () => (
      <div className="flex h-[60vh] items-center justify-center">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    ),
    ssr: false,
  },
);

export default function NotesPage() {
  return (
    <ProtectedRoute>
      <NotesHubView />
    </ProtectedRoute>
  );
}
