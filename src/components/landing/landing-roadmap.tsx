'use client';

/**
 * Landing Roadmap Section
 *
 * Timeline showing completed and upcoming milestones for StudentOS.
 */

import { Check, Clock, Sparkles } from 'lucide-react';

const ROADMAP = [
  {
    phase: 'Foundation',
    status: 'complete',
    items: ['Project scaffold', 'Firebase setup', 'Authentication', 'Dashboard shell'],
  },
  {
    phase: 'Junova AI',
    status: 'complete',
    items: ['AI Teacher DNA', 'Streaming chat', 'Long-term memory', 'Voice teacher'],
  },
  {
    phase: 'Study Tools',
    status: 'complete',
    items: ['Exam Center', 'Notes Hub', 'Study Planner', 'Flashcards'],
  },
  {
    phase: 'Community',
    status: 'complete',
    items: ['Study Groups', 'Social Feed', 'Career Planner', 'Scholarship Finder'],
  },
  {
    phase: 'Marketplace',
    status: 'complete',
    items: ['Freelance jobs', 'AI proposals', 'Portfolio', 'Earnings tracking'],
  },
  {
    phase: 'Mobile Apps',
    status: 'planned',
    items: ['iOS app', 'Android app', 'Offline mode', 'Push notifications'],
  },
];

export function LandingRoadmap() {
  return (
    <section id="roadmap" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">
            Roadmap
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Where we&apos;ve been. Where we&apos;re going.
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            StudentOS ships fast. Here&apos;s our journey so far.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ROADMAP.map((milestone) => {
            const isComplete = milestone.status === 'complete';
            return (
              <div
                key={milestone.phase}
                className="border-border/50 bg-card/40 relative rounded-2xl border p-6 backdrop-blur-sm"
              >
                {/* Status badge */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{milestone.phase}</h3>
                  {isComplete ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-400 ring-1 ring-green-500/20">
                      <Check className="h-3 w-3" />
                      Complete
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2.5 py-1 text-xs font-medium text-yellow-400 ring-1 ring-yellow-500/20">
                      <Clock className="h-3 w-3" />
                      Planned
                    </span>
                  )}
                </div>

                {/* Items */}
                <ul className="mt-4 space-y-2">
                  {milestone.items.map((item) => (
                    <li key={item} className="text-muted-foreground flex items-start gap-2 text-sm">
                      {isComplete ? (
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-400" />
                      ) : (
                        <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-400" />
                      )}
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
