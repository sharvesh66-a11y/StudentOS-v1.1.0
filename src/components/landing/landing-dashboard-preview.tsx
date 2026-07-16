'use client';

/**
 * Landing Dashboard Preview Section
 *
 * Shows a realistic mockup of the StudentOS dashboard with animated cards,
 * charts, and stats. Uses Framer Motion for entrance animations.
 */

import { motion } from 'framer-motion';
import {
  TrendingUp,
  Flame,
  BookOpen,
  Target,
  CheckCircle2,
  Clock,
  Brain,
  Calendar,
} from 'lucide-react';
import { APP_NAME, CORE_AI_NAME } from '@/lib/constants';

export function LandingDashboardPreview() {
  return (
    <section id="preview" className="relative overflow-hidden py-20 sm:py-28">
      {/* Background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 blur-[100px]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">
            Dashboard
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Your command center for learning
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            A beautiful, functional dashboard inspired by Notion, Linear, and Vercel.
          </p>
        </div>

        {/* Mock dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative mt-16"
        >
          {/* Glow */}
          <div
            aria-hidden
            className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-2xl"
          />

          {/* Browser frame */}
          <div className="border-border/50 bg-card/40 relative overflow-hidden rounded-2xl border backdrop-blur-xl">
            {/* Chrome */}
            <div className="border-border/50 flex items-center gap-2 border-b px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500/70" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                <div className="h-3 w-3 rounded-full bg-green-500/70" />
              </div>
              <div className="bg-muted/50 text-muted-foreground ml-3 flex-1 rounded-md px-3 py-1 text-xs">
                studentos.app/dashboard
              </div>
            </div>

            {/* Dashboard content */}
            <div className="bg-background/50 grid grid-cols-12 gap-3 p-4">
              {/* Sidebar */}
              <div className="bg-card/40 col-span-3 hidden space-y-2 rounded-xl p-3 lg:block">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-gradient-to-br from-purple-500 to-blue-500" />
                  <div className="bg-muted h-2 w-16 rounded" />
                </div>
                <div className="space-y-1.5 pt-3">
                  {[
                    'Dashboard',
                    'Junova AI',
                    'Notes',
                    'Planner',
                    'Exams',
                    'Providers',
                    'Settings',
                  ].map((item, i) => (
                    <div
                      key={item}
                      className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${
                        i === 0 ? 'bg-primary/20' : 'bg-transparent'
                      }`}
                    >
                      <div
                        className={`h-3 w-3 rounded ${i === 0 ? 'bg-primary' : 'bg-muted/60'}`}
                      />
                      <div className="bg-muted/40 h-1.5 flex-1 rounded" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Main content */}
              <div className="col-span-12 space-y-3 lg:col-span-9">
                {/* Welcome bar */}
                <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-4">
                  <div>
                    <div className="bg-foreground/40 h-3 w-32 rounded" />
                    <div className="bg-muted/60 mt-2 h-2 w-48 rounded" />
                  </div>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500" />
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    {
                      icon: TrendingUp,
                      label: 'Study Progress',
                      value: '78%',
                      color: 'text-purple-400',
                    },
                    { icon: Flame, label: 'Day Streak', value: '12', color: 'text-orange-400' },
                    { icon: BookOpen, label: 'Notes', value: '24', color: 'text-blue-400' },
                    { icon: Target, label: 'Goals Done', value: '8/10', color: 'text-green-400' },
                  ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.label} className="bg-card/40 rounded-xl p-3">
                        <Icon className={`h-4 w-4 ${stat.color}`} />
                        <div className="mt-2 text-xl font-bold">{stat.value}</div>
                        <div className="text-muted-foreground text-[10px]">{stat.label}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Two columns */}
                <div className="grid gap-3 lg:grid-cols-2">
                  {/* Today's tasks */}
                  <div className="bg-card/40 rounded-xl p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      <div className="bg-muted h-2 w-24 rounded" />
                    </div>
                    <div className="space-y-2">
                      {[
                        { done: true, text: 'Review Chemistry Chapter 5' },
                        { done: true, text: 'Math practice problems' },
                        { done: false, text: 'Physics lab report' },
                        { done: false, text: 'History essay outline' },
                      ].map((task, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div
                            className={`h-3 w-3 rounded ${task.done ? 'bg-green-500' : 'border-muted-foreground border'}`}
                          />
                          <div
                            className={`h-1.5 flex-1 rounded ${task.done ? 'bg-muted/30' : 'bg-muted/60'}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI teacher */}
                  <div className="bg-card/40 rounded-xl p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Brain className="h-4 w-4 text-purple-400" />
                      <div className="bg-muted h-2 w-20 rounded" />
                    </div>
                    <div className="space-y-2">
                      <div className="bg-primary/10 rounded-lg p-2">
                        <div className="bg-muted/60 h-1.5 w-3/4 rounded" />
                        <div className="bg-muted/40 mt-1 h-1.5 w-1/2 rounded" />
                      </div>
                      <div className="bg-muted/20 rounded-lg p-2">
                        <div className="bg-muted/60 h-1.5 w-2/3 rounded" />
                      </div>
                      <div className="flex items-center gap-1.5 pt-1">
                        <Clock className="text-muted-foreground h-3 w-3" />
                        <div className="bg-muted/40 h-1.5 w-16 rounded" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chart row */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="bg-card/40 rounded-xl p-4 sm:col-span-2">
                    <div className="mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-400" />
                      <div className="bg-muted h-2 w-20 rounded" />
                    </div>
                    <div className="flex h-20 items-end gap-1.5">
                      {[40, 65, 50, 80, 70, 90, 60, 75, 85, 70, 95, 80].map((h, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          whileInView={{ height: `${h * 0.4}px` }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.05, duration: 0.4 }}
                          className="flex-1 rounded-t bg-gradient-to-t from-purple-500/60 to-blue-500/80"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="bg-card/40 rounded-xl p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-400" />
                      <div className="bg-muted h-2 w-16 rounded" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="bg-muted/60 h-1.5 w-20 rounded" />
                        <div className="h-3 w-8 rounded bg-orange-400/60" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="bg-muted/40 h-1.5 w-16 rounded" />
                        <div className="h-3 w-6 rounded bg-purple-400/60" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="bg-muted/40 h-1.5 w-24 rounded" />
                        <div className="h-3 w-10 rounded bg-blue-400/60" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Caption */}
        <p className="text-muted-foreground mt-6 text-center text-sm">
          {APP_NAME} dashboard · {CORE_AI_NAME} AI · Live preview
        </p>
      </div>
    </section>
  );
}
