'use client';

/**
 * StudentOS Dashboard — AI Assistant Preview
 *
 * A placeholder card for Junova AI. Shows a disabled chat input, suggested
 * prompts (visual only), and a "Coming in Sprint 4" badge. Will be wired up
 * to real Junova AI in Sprint 4.
 *
 * @see src/features/dashboard/components/ — no junova service exists yet
 */

import { Sparkles, Send, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/nav';
import { CORE_AI_NAME } from '@/lib/constants';

const SUGGESTED_PROMPTS = [
  'Summarize my notes from today',
  'Create a quiz on chapter 5',
  'Explain photosynthesis simply',
  'Plan my study schedule for exams',
];

export function AIAssistantPreview() {
  return (
    <div className="border-primary/20 from-primary/5 via-card/50 to-secondary/5 relative overflow-hidden rounded-xl border bg-gradient-to-br p-5 backdrop-blur-sm">
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="bg-primary/10 pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full blur-3xl"
      />

      <div className="relative">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 ring-primary/20 flex h-8 w-8 items-center justify-center rounded-lg ring-1">
              <Sparkles className="text-primary h-4 w-4" />
            </div>
            <div>
              <h2 className="text-foreground text-sm font-semibold">{CORE_AI_NAME}</h2>
              <p className="text-muted-foreground text-[10px]">Your AI study companion</p>
            </div>
          </div>
          <span className="border-primary/20 bg-primary/5 text-primary rounded-full border px-2 py-0.5 text-[10px] font-medium">
            Sprint 4
          </span>
        </div>

        {/* Chat input (disabled) */}
        <div className="flex gap-2">
          <Input
            placeholder={`Ask ${CORE_AI_NAME} anything…`}
            className="flex-1"
            disabled
            aria-label={`Message ${CORE_AI_NAME} (coming in Sprint 4)`}
          />
          <Button size="icon" disabled aria-label="Send message (coming soon)">
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Suggested prompts */}
        <div className="mt-4">
          <p className="text-muted-foreground mb-2 text-xs font-medium">Try asking:</p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <span
                key={prompt}
                className="border-border bg-background/50 text-muted-foreground rounded-full border px-2.5 py-1 text-xs"
              >
                {prompt}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Link
          href={ROUTES.junovaAI}
          className="border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 mt-4 flex items-center justify-center gap-1.5 rounded-lg border px-4 py-2 text-xs font-medium transition-colors"
        >
          Explore {CORE_AI_NAME}
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
