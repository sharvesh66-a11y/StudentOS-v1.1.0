'use client';

/**
 * StudentOS Junova AI Page
 *
 * The main Junova AI interface. Renders the full chat experience with
 * teacher management, conversation sidebar, and streaming chat.
 *
 * Protected by <ProtectedRoute> — unauthenticated users redirect to /login.
 *
 * JunovaChat (~250 LOC + chat/teacher/live-teacher/voice deps + react-markdown
 * + react-syntax-highlighter + katex) is loaded via next/dynamic so the heavy
 * AI/chat chunk only downloads on /junova-ai navigation.
 *
 * @see src/features/junova/components/chat/junova-chat.tsx
 */

import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/features/auth';
import { Skeleton } from '@/components/ui/skeleton';

const JunovaChat = dynamic(
  () => import('@/features/junova/components/chat/junova-chat').then((m) => m.JunovaChat),
  {
    loading: () => (
      <div className="flex h-[60vh] items-center justify-center">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    ),
    ssr: false,
  },
);

export default function JunovaAIPage() {
  return (
    <ProtectedRoute>
      <JunovaChat />
    </ProtectedRoute>
  );
}
