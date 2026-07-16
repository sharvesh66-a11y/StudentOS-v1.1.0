/**
 * StudentOS Landing Page
 *
 * Professional marketing landing page for StudentOS — the AI-powered operating
 * system for students. Features a futuristic dark UI with glassmorphism,
 * smooth animations, and clear CTAs.
 *
 * Sections:
 *   1. Navbar (sticky, glassmorphism)
 *   2. Hero (logo, headline, CTAs, animated background)
 *   3. Features grid (6 feature cards)
 *   4. Screenshots/preview placeholders
 *   5. Roadmap timeline
 *   6. CTA section
 *   7. About section
 *   8. Pricing (Coming Soon)
 *   9. Contact
 *  10. Footer
 *
 * @see src/app/layout.tsx — root layout provides AuthProvider + theme
 */

import { LandingPage } from '@/components/landing/landing-page';

export default function Home() {
  return <LandingPage />;
}
