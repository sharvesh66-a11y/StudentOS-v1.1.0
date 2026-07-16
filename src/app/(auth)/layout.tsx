/**
 * StudentOS Auth Layout
 *
 * The layout for auth pages (/login, /signup, future /reset-password).
 * Renders children centered on a dark canvas with the StudentOS ambient
 * purple/blue gradient backdrop.
 *
 * This is a Server Component — no client hooks, no Firebase calls.
 * The actual forms inside are client components.
 */

import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      {/* Ambient gradient backdrop — purple/blue StudentOS palette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(60% 50% at 20% 20%, oklch(0.6 0.25 290 / 22%) 0%, transparent 60%), radial-gradient(50% 50% at 80% 30%, oklch(0.62 0.22 240 / 22%) 0%, transparent 60%), radial-gradient(70% 60% at 50% 100%, oklch(0.55 0.2 320 / 15%) 0%, transparent 60%)',
        }}
      />

      {/* Subtle grid overlay for depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.015]"
        style={{
          backgroundImage:
            'linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {children}
    </div>
  );
}
