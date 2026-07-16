'use client';

/**
 * StudentOS Dashboard — Notes Preview
 *
 * Shows the student's most recent notes from the Notes Hub. Since Notes Hub
 * ships in Sprint 6, this shows an empty state.
 */

import { NotebookPen, ArrowRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/nav';

export function NotesPreview() {
  const hasNotes = false;

  return (
    <div className="border-border bg-card/50 rounded-xl border p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <NotebookPen className="text-primary h-4 w-4" />
          <h2 className="text-foreground text-sm font-semibold">Recent Notes</h2>
        </div>
        <Link
          href={ROUTES.notes}
          className="text-muted-foreground hover:text-primary flex items-center gap-1 text-xs transition-colors"
        >
          View all
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {hasNotes ? (
        <div className="space-y-2">{/* Note items will go here in Sprint 6 */}</div>
      ) : (
        <div className="border-border bg-background/30 rounded-lg border border-dashed py-10 text-center">
          <NotebookPen className="text-muted-foreground/40 mx-auto h-8 w-8" />
          <p className="text-foreground mt-2 text-sm font-medium">No notes yet</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Notes Hub launches in Sprint 6 — your recent notes will appear here.
          </p>
          <Link
            href={ROUTES.notes}
            className="border-border bg-background/50 text-foreground hover:bg-accent mt-3 inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors"
          >
            <Plus className="h-3 w-3" />
            Explore Notes Hub
          </Link>
        </div>
      )}
    </div>
  );
}
