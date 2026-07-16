'use client';

/**
 * StudentOS Dashboard — Upcoming Exams Preview
 *
 * Shows a list of upcoming exams from the Exam Center. Since Exam Center
 * ships in Sprint 5, this shows an empty state.
 */

import { ClipboardList, ArrowRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/nav';

export function UpcomingExams() {
  const hasExams = false;

  return (
    <div className="border-border bg-card/50 rounded-xl border p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="text-primary h-4 w-4" />
          <h2 className="text-foreground text-sm font-semibold">Upcoming Exams</h2>
        </div>
        <Link
          href={ROUTES.examCenter}
          className="text-muted-foreground hover:text-primary flex items-center gap-1 text-xs transition-colors"
        >
          View all
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {hasExams ? (
        <div className="space-y-2">{/* Exam items will go here in Sprint 5 */}</div>
      ) : (
        <div className="border-border bg-background/30 rounded-lg border border-dashed py-10 text-center">
          <ClipboardList className="text-muted-foreground/40 mx-auto h-8 w-8" />
          <p className="text-foreground mt-2 text-sm font-medium">No exams scheduled</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Exam Center launches in Sprint 5 — you&apos;ll see your upcoming exams here.
          </p>
          <Link
            href={ROUTES.examCenter}
            className="border-border bg-background/50 text-foreground hover:bg-accent mt-3 inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors"
          >
            <Plus className="h-3 w-3" />
            Explore Exam Center
          </Link>
        </div>
      )}
    </div>
  );
}
