'use client';

/**
 * Landing Footer (v1.1)
 *
 * Multi-column footer with brand logo, links, and legal.
 */

import Link from 'next/link';
import { Logo } from '@/components/brand';
import { APP_NAME, APP_TAGLINE, APP_VERSION } from '@/lib/constants';

const FOOTER_LINKS = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Providers', href: '/providers' },
  ],
  Company: [
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
  ],
  Resources: [
    { label: 'Documentation', href: '#' },
    { label: 'Help Center', href: '#' },
    { label: 'Community', href: '/community' },
    { label: 'Status', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'GDPR', href: '#' },
  ],
};

export function LandingFooter() {
  return (
    <footer className="border-border/50 bg-card/20 border-t backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-6">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex">
              <Logo size="sm" showWordmark />
            </Link>
            <p className="text-muted-foreground mt-4 max-w-xs text-sm">
              {APP_TAGLINE}. The AI operating system built for students, by students.
            </p>
            <p className="text-muted-foreground mt-4 text-xs">v{APP_VERSION} · Made with care</p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-sm font-semibold">{heading}</h4>
              <ul className="mt-4 space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-border/50 mt-12 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <div className="text-muted-foreground flex items-center gap-4 text-xs">
            <span>Built with Next.js · Firebase · Tailwind</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
