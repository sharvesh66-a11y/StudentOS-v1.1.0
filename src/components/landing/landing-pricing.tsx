'use client';

/**
 * Landing Pricing Section (Coming Soon)
 *
 * Shows planned pricing tiers with a "Coming Soon" badge. Users can sign up
 * for the waitlist (links to signup).
 */

import Link from 'next/link';
import { Check, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TIERS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: [
      'Junova AI (limited messages/day)',
      'Notes Hub (up to 50 notes)',
      'Exam Center (5 quizzes/month)',
      'Study Planner (basic)',
      'Community access',
    ],
    cta: 'Get Started',
    href: '/signup',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/month',
    description: 'For serious students',
    features: [
      'Unlimited Junova AI messages',
      'Unlimited notes & flashcards',
      'Unlimited quizzes & practice',
      'Advanced planner with AI schedules',
      'Voice teacher + live classroom',
      'Priority support',
    ],
    cta: 'Join Waitlist',
    href: '/signup',
    highlight: true,
  },
  {
    name: 'Premium',
    price: '$19',
    period: '/month',
    description: 'The full experience',
    features: [
      'Everything in Pro',
      'All 12 AI tools unlocked',
      'Career planner + scholarship finder',
      'Freelance marketplace',
      'Advanced analytics & exports',
      'Early access to new features',
    ],
    cta: 'Join Waitlist',
    href: '/signup',
    highlight: false,
  },
];

export function LandingPricing() {
  return (
    <section id="pricing" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="border-border/50 bg-card/50 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium backdrop-blur-sm">
            <Lock className="h-3.5 w-3.5" />
            Coming Soon
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Start free forever. Upgrade when you&apos;re ready. No hidden fees.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl border p-8 backdrop-blur-sm ${
                tier.highlight
                  ? 'border-primary/50 bg-card/60 ring-primary/20 ring-1'
                  : 'border-border/50 bg-card/40'
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <h3 className="text-lg font-semibold">{tier.name}</h3>
              <p className="text-muted-foreground mt-1 text-sm">{tier.description}</p>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{tier.price}</span>
                <span className="text-muted-foreground text-sm">{tier.period}</span>
              </div>

              <Button
                className="mt-6 w-full"
                variant={tier.highlight ? 'default' : 'outline'}
                asChild
              >
                <Link href={tier.href}>{tier.cta}</Link>
              </Button>

              <ul className="mt-6 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-400" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="text-muted-foreground mt-8 text-center text-sm">
          Pricing launches after the public beta.{' '}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up now
          </Link>{' '}
          to lock in early-bird pricing.
        </p>
      </div>
    </section>
  );
}
