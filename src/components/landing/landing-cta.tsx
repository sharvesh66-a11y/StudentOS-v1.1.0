'use client';

/**
 * Landing CTA Section
 *
 * Bold call-to-action banner with gradient background and primary/secondary
 * buttons. Drives users to sign up.
 */

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_NAME } from '@/lib/constants';

export function LandingCTA() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border-border/50 from-primary/10 via-card/40 to-secondary/10 relative overflow-hidden rounded-3xl border bg-gradient-to-br p-8 backdrop-blur-sm sm:p-12 lg:p-16">
          {/* Decorative glow */}
          <div
            aria-hidden
            className="bg-primary/20 absolute -top-20 -right-20 h-64 w-64 rounded-full blur-3xl"
          />
          <div
            aria-hidden
            className="bg-secondary/20 absolute -bottom-20 -left-20 h-64 w-64 rounded-full blur-3xl"
          />

          <div className="relative mx-auto max-w-2xl text-center">
            <div className="border-border/50 bg-background/50 mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium backdrop-blur-sm">
              <Sparkles className="text-primary h-3.5 w-3.5" />
              Join thousands of students
            </div>

            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Ready to transform
              <br />
              your study life?
            </h2>

            <p className="text-muted-foreground mx-auto mt-6 max-w-xl text-lg">
              Start free today. No credit card required. {APP_NAME} grows with you from your first
              class to your final exam.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <Link href="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
