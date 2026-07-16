'use client';

/**
 * Landing Testimonials Section
 *
 * Dummy testimonials from fictional students. Uses glassmorphism cards with
 * gradient avatars and star ratings.
 */

import { Star, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Aisha K.',
    role: 'Grade 12 · Science',
    avatar: 'from-purple-500 to-pink-500',
    quote:
      "StudentOS completely changed how I study. The AI teacher explains things my textbook can't, and the planner keeps me on track for finals.",
    rating: 5,
  },
  {
    name: 'Marcus T.',
    role: 'Undergrad · Computer Science',
    avatar: 'from-blue-500 to-cyan-500',
    quote:
      "I used to juggle 6 different apps for notes, flashcards, and quizzes. Now it's all in one place. The AI-generated notes alone save me hours every week.",
    rating: 5,
  },
  {
    name: 'Priya S.',
    role: 'Grade 11 · Commerce',
    avatar: 'from-orange-500 to-yellow-500',
    quote:
      "The exam center is a game-changer. AI-generated quizzes on exactly the topics I'm weak on, with instant explanations. My test scores went up 15%.",
    rating: 5,
  },
  {
    name: 'Liam O.',
    role: 'Grad Student · Physics',
    avatar: 'from-green-500 to-emerald-500',
    quote:
      "Junova AI remembers what I struggled with last week and builds revision sessions automatically. It's like having a personal tutor 24/7.",
    rating: 5,
  },
  {
    name: 'Sofia M.',
    role: 'Grade 10 · Arts',
    avatar: 'from-violet-500 to-purple-500',
    quote:
      'The design is gorgeous. Feels like a premium app, not a school tool. And the community feature helped me find a study group for history.',
    rating: 5,
  },
  {
    name: 'Raj P.',
    role: 'Undergrad · Engineering',
    avatar: 'from-red-500 to-rose-500',
    quote:
      'The streak system actually motivates me. 47 days strong and counting. Never thought a study app would make me want to learn every day.',
    rating: 5,
  },
];

export function LandingTestimonials() {
  return (
    <section id="testimonials" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">
            Testimonials
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Loved by students worldwide
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Join thousands of students who&apos;ve transformed their study habits.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="group border-border/50 bg-card/40 hover:border-border hover:bg-card/60 relative overflow-hidden rounded-2xl border p-6 backdrop-blur-sm transition-all"
            >
              <Quote className="text-primary/10 absolute top-4 right-4 h-8 w-8" />

              {/* Rating */}
              <div className="flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-foreground/90 mt-4 text-sm leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="mt-6 flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${t.avatar} text-sm font-semibold text-white`}
                >
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="text-muted-foreground text-xs">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
