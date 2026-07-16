'use client';

/**
 * StudentOS App Shell
 *
 * The layout shell for all authenticated app routes. Composes:
 * - Desktop sidebar (fixed left, hidden below `lg:`)
 * - Mobile navigation (hamburger + drawer, visible below `lg:`)
 * - Sticky header with mobile menu, search placeholder, user avatar
 * - Scrollable content area
 *
 * Usage in `src/app/(app)/layout.tsx`:
 *   <AppShell>{children}</AppShell>
 *
 * @see src/components/layout/sidebar.tsx
 * @see src/components/layout/mobile-nav.tsx
 */

import type { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background min-h-screen">
      {/* Skip link — keyboard users can jump straight to main content */}
      <a
        href="#main-content"
        className="focus:bg-background focus:text-foreground sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:px-4 focus:py-2 focus:shadow-lg"
      >
        Skip to content
      </a>

      {/* Desktop sidebar — fixed */}
      <Sidebar />

      {/* Main column — offset by sidebar width on lg+ */}
      <div className="flex min-h-screen flex-col lg:pl-64">
        {/* Sticky header */}
        <Header />

        {/* Scrollable content */}
        <main id="main-content" className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
