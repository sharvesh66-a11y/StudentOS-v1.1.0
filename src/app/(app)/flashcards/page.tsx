'use client';

/**
 * Flashcards Page
 *
 * Route: /flashcards
 *
 * Create flashcard decks, study with 3D flip cards, and track progress.
 * Supports AI-generated decks from any topic.
 */

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { ProtectedRoute } from '@/features/auth';

const FlashcardsView = dynamic(
  () => import('@/features/flashcards/components/flashcards-view').then((m) => m.FlashcardsView),
  {
    loading: () => (
      <div className="flex h-[60vh] items-center justify-center">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    ),
    ssr: false,
  },
);

export default function FlashcardsPage() {
  return (
    <ProtectedRoute>
      <FlashcardsView />
    </ProtectedRoute>
  );
}
