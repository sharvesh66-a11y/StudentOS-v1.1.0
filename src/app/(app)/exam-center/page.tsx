'use client';

/**
 * StudentOS Exam Center Page
 * The AI-powered Quiz Generator. Protected by <ProtectedRoute>.
 *
 * ExamCenterView (~275 LOC + quiz/practice services) is loaded via
 * next/dynamic so its chunk only downloads on /exam-center navigation.
 */

import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/features/auth';
import { Skeleton } from '@/components/ui/skeleton';

const ExamCenterView = dynamic(
  () => import('@/features/exam/components/exam-center-view').then((m) => m.ExamCenterView),
  {
    loading: () => (
      <div className="flex h-[60vh] items-center justify-center">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    ),
    ssr: false,
  },
);

export default function ExamCenterPage() {
  return (
    <ProtectedRoute>
      <ExamCenterView />
    </ProtectedRoute>
  );
}
