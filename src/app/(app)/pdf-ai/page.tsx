'use client';

/**
 * PDF AI Page
 *
 * Route: /pdf-ai
 *
 * Upload PDFs and chat with them using AI. Get summaries, key points, and
 * answers to questions about the document content.
 */

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { ProtectedRoute } from '@/features/auth';

const PdfAiView = dynamic(
  () => import('@/features/pdf-ai/components/pdf-ai-view').then((m) => m.PdfAiView),
  {
    loading: () => (
      <div className="flex h-[60vh] items-center justify-center">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    ),
    ssr: false,
  },
);

export default function PdfAiPage() {
  return (
    <ProtectedRoute>
      <PdfAiView />
    </ProtectedRoute>
  );
}
