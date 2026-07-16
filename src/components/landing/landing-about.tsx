'use client';

/**
 * Landing About Section
 *
 * Mission statement, key stats, and what makes StudentOS different.
 */

import { Target, Zap, Shield, Heart } from 'lucide-react';
import { APP_NAME, CORE_AI_NAME } from '@/lib/constants';

const VALUES = [
  {
    icon: Target,
    title: 'Student-First',
    description:
      'Every feature is designed around how students actually study. Not how institutions think they should.',
  },
  {
    icon: Zap,
    title: 'AI-Native',
    description: `${CORE_AI_NAME} isn't a bolted-on chatbot. It's the core that powers notes, quizzes, plans, and insights.`,
  },
  {
    icon: Shield,
    title: 'Private by Design',
    description:
      'Your data is yours. Firebase security rules enforce per-user isolation at the database level.',
  },
  {
    icon: Heart,
    title: 'Open & Honest',
    description:
      'Transparent roadmap, honest pricing, and a community-driven approach to what we build next.',
  },
];

const STATS = [
  { value: '12+', label: 'Integrated Modules' },
  { value: '8', label: 'AI Providers' },
  { value: '60+', label: 'Firestore Collections' },
  { value: '314', label: 'Tests Passing' },
];

export function LandingAbout() {
  return (
    <section id="about" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Mission */}
          <div>
            <span className="text-primary text-sm font-semibold tracking-wider uppercase">
              About {APP_NAME}
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              One platform to replace them all
            </h2>
            <div className="text-muted-foreground mt-6 space-y-4">
              <p>
                Students today juggle 5–10 different apps: one for notes, one for flashcards, one
                for calendars, one for chat, one for exams. The result? Context switching, lost
                data, and wasted time.
              </p>
              <p>
                {APP_NAME} changes that. We built a single, AI-powered operating system where every
                module talks to every other module. Your AI teacher knows your weak spots from
                quizzes. Your planner adjusts based on exam dates. Your notes generate flashcards
                automatically.
              </p>
              <p>
                Powered by {CORE_AI_NAME}, {APP_NAME} learns your style and gets smarter the more
                you use it. It&apos;s like having a personal tutor, study group, and productivity
                coach — all in one.
              </p>
            </div>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="border-border/50 bg-card/40 rounded-xl border p-4 text-center backdrop-blur-sm"
                >
                  <div className="text-primary text-2xl font-bold">{stat.value}</div>
                  <div className="text-muted-foreground mt-1 text-xs">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Values */}
          <div className="grid gap-4 sm:grid-cols-2">
            {VALUES.map((value) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  className="border-border/50 bg-card/40 rounded-2xl border p-6 backdrop-blur-sm"
                >
                  <div className="bg-primary/10 ring-primary/20 inline-flex h-10 w-10 items-center justify-center rounded-lg ring-1">
                    <Icon className="text-primary h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{value.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
