'use client';

/**
 * Landing Screenshots Section
 *
 * Preview placeholders showing the StudentOS interface across modules.
 * Uses styled divs to mock the actual UI (no external images needed).
 */

import { Brain, BookOpen, ClipboardCheck, CalendarClock } from 'lucide-react';

const SCREENSHOTS = [
  {
    icon: Brain,
    title: 'Junova AI Chat',
    subtitle: 'Streaming responses · Markdown · Voice input',
    accent: 'from-purple-500/20 to-purple-600/5',
  },
  {
    icon: BookOpen,
    title: 'Notes Hub',
    subtitle: 'AI-generated · Flashcards · Doubt solver',
    accent: 'from-blue-500/20 to-blue-600/5',
  },
  {
    icon: ClipboardCheck,
    title: 'Exam Center',
    subtitle: '5 question types · Instant scoring · Mistake analysis',
    accent: 'from-cyan-500/20 to-cyan-600/5',
  },
  {
    icon: CalendarClock,
    title: 'Study Planner',
    subtitle: 'AI schedules · Reminders · Spaced repetition',
    accent: 'from-pink-500/20 to-pink-600/5',
  },
];

export function LandingScreenshots() {
  return (
    <section id="screenshots" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">
            Preview
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            See StudentOS in action
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Beautiful, functional, and built for productivity.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {SCREENSHOTS.map((shot) => {
            const Icon = shot.icon;
            return (
              <div
                key={shot.title}
                className="group border-border/50 bg-card/40 relative overflow-hidden rounded-2xl border backdrop-blur-sm"
              >
                {/* Mock screenshot */}
                <div className={`relative aspect-video bg-gradient-to-br ${shot.accent}`}>
                  {/* Mock UI elements */}
                  <div className="absolute inset-0 p-6">
                    {/* Header bar */}
                    <div className="flex items-center gap-2">
                      <Icon className="text-foreground/60 h-5 w-5" />
                      <div className="bg-foreground/20 h-2 w-24 rounded" />
                      <div className="ml-auto flex gap-1">
                        <div className="bg-foreground/20 h-2 w-2 rounded-full" />
                        <div className="bg-foreground/20 h-2 w-2 rounded-full" />
                      </div>
                    </div>
                    {/* Content lines */}
                    <div className="mt-4 space-y-2">
                      <div className="bg-foreground/15 h-2 w-3/4 rounded" />
                      <div className="bg-foreground/10 h-2 w-1/2 rounded" />
                      <div className="bg-foreground/10 h-2 w-2/3 rounded" />
                    </div>
                    {/* Card grid */}
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-foreground/5 rounded-lg p-2">
                          <div className="bg-foreground/20 h-1.5 w-8 rounded" />
                          <div className="bg-foreground/30 mt-1 h-3 w-12 rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Caption */}
                <div className="border-border/50 border-t p-4">
                  <h3 className="font-semibold">{shot.title}</h3>
                  <p className="text-muted-foreground mt-1 text-xs">{shot.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
