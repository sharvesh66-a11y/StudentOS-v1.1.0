'use client';

/**
 * Landing Statistics Section
 *
 * Animated counters showing key platform metrics.
 */

import { motion } from 'framer-motion';
import { Users, BookOpen, Brain, Trophy } from 'lucide-react';

const STATS = [
  {
    icon: Users,
    value: '10K+',
    label: 'Active Students',
    color: 'text-purple-400',
    gradient: 'from-purple-500/20 to-purple-600/5',
  },
  {
    icon: BookOpen,
    value: '50K+',
    label: 'Notes Created',
    color: 'text-blue-400',
    gradient: 'from-blue-500/20 to-blue-600/5',
  },
  {
    icon: Brain,
    value: '100K+',
    label: 'AI Conversations',
    color: 'text-cyan-400',
    gradient: 'from-cyan-500/20 to-cyan-600/5',
  },
  {
    icon: Trophy,
    value: '95%',
    label: 'Satisfaction Rate',
    color: 'text-orange-400',
    gradient: 'from-orange-500/20 to-orange-600/5',
  },
];

export function LandingStats() {
  return (
    <section className="relative py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`border-border/50 relative overflow-hidden rounded-2xl border bg-gradient-to-br ${stat.gradient} p-6 text-center backdrop-blur-sm`}
              >
                <Icon className={`mx-auto h-8 w-8 ${stat.color}`} />
                <div className="mt-4 text-3xl font-bold sm:text-4xl">{stat.value}</div>
                <div className="text-muted-foreground mt-1 text-sm">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
