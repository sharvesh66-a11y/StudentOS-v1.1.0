'use client';

/**
 * Landing Features Section (v1.1)
 *
 * AI-powered education features grid with glassmorphism cards.
 */

import { motion } from 'framer-motion';
import {
  Brain,
  BookOpen,
  ClipboardCheck,
  CalendarClock,
  Users,
  TrendingUp,
  Sparkles,
  Zap,
} from 'lucide-react';
import { CORE_AI_NAME } from '@/lib/constants';

const FEATURES = [
  {
    icon: Brain,
    title: `${CORE_AI_NAME} AI Teacher`,
    description:
      'Personalized AI tutor with 11-trait personality DNA. Streams answers in real-time, remembers your weak spots, and adapts to your learning style.',
    gradient: 'from-purple-500/20 to-purple-600/10',
    iconColor: 'text-purple-400',
  },
  {
    icon: BookOpen,
    title: 'Smart Notes Hub',
    description:
      'AI-generated notes from any topic, flashcards for spaced repetition, and a doubt solver that explains concepts step-by-step.',
    gradient: 'from-blue-500/20 to-blue-600/10',
    iconColor: 'text-blue-400',
  },
  {
    icon: ClipboardCheck,
    title: 'Exam Center',
    description:
      'AI quiz generator with 5 question types. Practice mode, instant scoring, and mistake analysis that feeds back into your study plan.',
    gradient: 'from-cyan-500/20 to-cyan-600/10',
    iconColor: 'text-cyan-400',
  },
  {
    icon: CalendarClock,
    title: 'Study Planner',
    description:
      'AI-built schedules that fit your goals and deadlines. Daily tasks, reminders, spaced-repetition revisions, and progress tracking.',
    gradient: 'from-pink-500/20 to-pink-600/10',
    iconColor: 'text-pink-400',
  },
  {
    icon: Users,
    title: 'Study Groups & Community',
    description:
      'Real-time group chat, study sessions, file sharing, and a social feed with reactions. Learn together, grow together.',
    gradient: 'from-orange-500/20 to-orange-600/10',
    iconColor: 'text-orange-400',
  },
  {
    icon: TrendingUp,
    title: 'Analytics & Gamification',
    description:
      'XP, levels, achievements, badges, and streaks. Visualize your progress with charts and stay motivated with weekly challenges.',
    gradient: 'from-green-500/20 to-green-600/10',
    iconColor: 'text-green-400',
  },
  {
    icon: Sparkles,
    title: '12 AI Tools',
    description:
      'Summarizer, translator, paraphraser, concept explainer, and more. All powered by your choice of 8 AI providers.',
    gradient: 'from-violet-500/20 to-violet-600/10',
    iconColor: 'text-violet-400',
  },
  {
    icon: Zap,
    title: 'Multi-Provider AI',
    description:
      'Connect OpenAI, Claude, Gemini, DeepSeek, GLM, or local models. Switch providers without changing your workflow.',
    gradient: 'from-yellow-500/20 to-yellow-600/10',
    iconColor: 'text-yellow-400',
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">
            AI-Powered Education
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need. Nothing you don&apos;t.
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            One unified platform that replaces your scattered study apps. Built for students,
            powered by AI.
          </p>
        </div>

        {/* Feature grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="group border-border/50 bg-card/40 hover:border-border hover:bg-card/60 hover:shadow-primary/5 relative overflow-hidden rounded-2xl border p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
              >
                {/* Hover glow */}
                <div
                  aria-hidden
                  className={`absolute -top-8 -right-8 h-32 w-32 rounded-full bg-gradient-to-br ${feature.gradient} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100`}
                />

                <div className="relative">
                  {/* Icon */}
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} ring-1 ring-white/10`}
                  >
                    <Icon className={`h-6 w-6 ${feature.iconColor}`} />
                  </div>

                  {/* Title */}
                  <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>

                  {/* Description */}
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
