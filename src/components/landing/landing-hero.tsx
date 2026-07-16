'use client';

/**
 * Landing Hero Section (v1.1 redesign)
 *
 * Premium hero with:
 *   - Animated particle background (canvas)
 *   - Animated gradient blobs
 *   - StudentOS logo with glow
 *   - Gradient headline
 *   - Primary + secondary CTAs
 *   - Floating dashboard preview card with glassmorphism
 *   - Framer Motion entrance animations
 */

import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import { ArrowRight, Compass, Sparkles, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/brand';
import { Particles } from './particles';
import { APP_NAME, CORE_AI_NAME, APP_TAGLINE } from '@/lib/constants';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export function LandingHero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
      {/* Particle background */}
      <Particles count={60} color="#a855f7" linkDistance={130} />

      {/* Animated gradient blobs */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-purple-500/20 blur-[120px]"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute right-1/4 -bottom-40 h-96 w-96 rounded-full bg-blue-500/20 blur-[120px]"
        animate={{
          x: [0, -40, 0],
          y: [0, -20, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Grid overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          maskImage: 'radial-gradient(ellipse 70% 50% at 50% 50%, black, transparent)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 50% at 50% 50%, black, transparent)',
        }}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8"
      >
        {/* Logo */}
        <motion.div variants={itemVariants} className="mb-8 flex justify-center">
          <motion.div
            animate={{
              y: [0, -8, 0],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Logo size="xl" />
          </motion.div>
        </motion.div>

        {/* Badge */}
        <motion.div variants={itemVariants} className="mb-6 flex justify-center">
          <div className="border-border/50 bg-card/40 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
              <span className="bg-primary relative inline-flex h-2 w-2 rounded-full" />
            </span>
            Powered by {CORE_AI_NAME} · v1.1
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl"
        >
          The AI Operating System
          <br />
          for{' '}
          <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
            Students
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={itemVariants}
          className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg text-pretty sm:text-xl"
        >
          {APP_NAME} replaces 10+ apps with one intelligent platform. {CORE_AI_NAME} learns your
          style, plans your day, generates notes &amp; quizzes, and keeps you on track to achieve
          more. {APP_TAGLINE}
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={itemVariants}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button size="lg" className="w-full sm:w-auto" asChild>
            <Link href="/signup">
              Start Learning
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="w-full backdrop-blur-md sm:w-auto" asChild>
            <Link href="/dashboard">
              <Compass className="mr-2 h-4 w-4" />
              Explore Features
            </Link>
          </Button>
          <Button variant="ghost" size="lg" className="w-full sm:w-auto" asChild>
            <Link href="/login">
              <Play className="mr-2 h-4 w-4" />
              Login
            </Link>
          </Button>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          variants={itemVariants}
          className="text-muted-foreground mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs"
        >
          {['No credit card required', 'Free forever plan', 'Setup in 2 minutes'].map((text) => (
            <div key={text} className="flex items-center gap-1.5">
              <Sparkles className="text-primary h-3.5 w-3.5" />
              <span>{text}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
