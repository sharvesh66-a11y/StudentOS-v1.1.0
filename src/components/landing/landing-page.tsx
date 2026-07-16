'use client';

/**
 * StudentOS Landing Page (v1.1 redesign)
 *
 * Premium homepage with:
 *   - Animated particle hero
 *   - Features grid
 *   - Dashboard preview
 *   - Statistics
 *   - Roadmap timeline
 *   - Testimonials
 *   - FAQ accordion
 *   - CTA + About + Pricing + Contact + Footer
 *
 * Theme: Dark + Purple + Blue + Glassmorphism + Animated gradients + Particles
 */

import { LandingNavbar } from './landing-navbar';
import { LandingHero } from './landing-hero';
import { LandingFeatures } from './landing-features';
import { LandingDashboardPreview } from './landing-dashboard-preview';
import { LandingStats } from './landing-stats';
import { LandingRoadmap } from './landing-roadmap';
import { LandingTestimonials } from './landing-testimonials';
import { LandingFAQ } from './landing-faq';
import { LandingCTA } from './landing-cta';
import { LandingAbout } from './landing-about';
import { LandingPricing } from './landing-pricing';
import { LandingContact } from './landing-contact';
import { LandingFooter } from './landing-footer';

export function LandingPage() {
  return (
    <div className="bg-background text-foreground relative min-h-screen overflow-x-hidden">
      {/* Ambient background glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -20%, oklch(0.6 0.25 290 / 0.18), transparent), radial-gradient(ellipse 60% 50% at 80% 50%, oklch(0.62 0.22 240 / 0.12), transparent)',
        }}
      />

      <div className="relative z-10">
        <LandingNavbar />
        <main>
          <LandingHero />
          <LandingFeatures />
          <LandingDashboardPreview />
          <LandingStats />
          <LandingRoadmap />
          <LandingTestimonials />
          <LandingFAQ />
          <LandingCTA />
          <LandingAbout />
          <LandingPricing />
          <LandingContact />
        </main>
        <LandingFooter />
      </div>
    </div>
  );
}
