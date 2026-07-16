'use client';

/**
 * StudentOS Dashboard — Quick Actions
 *
 * Grid of module launcher cards. Each card navigates to the module's
 * placeholder route. Cards for not-yet-enabled modules show a sprint badge.
 *
 * Reads from `APP_MODULES` via `NAV_ITEMS` — single source of truth.
 *
 * @see src/lib/nav.ts
 * @see src/lib/constants.ts — APP_MODULES
 */

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/nav';
import { getIcon } from '@/components/layout/icon-map';
import { cn } from '@/lib/utils';

export function QuickActions() {
  // Only show module cards (skip Dashboard which is the current page, and Settings which is in the sidebar)
  const moduleItems = NAV_ITEMS.filter((item) => !item.primary && item.id !== 'settings');

  return (
    <div className="border-border bg-card/50 rounded-xl border p-5 backdrop-blur-sm">
      <div className="mb-4">
        <h2 className="text-foreground text-sm font-semibold">Quick Actions</h2>
        <p className="text-muted-foreground mt-0.5 text-xs">
          Jump into any module. Some are still cooking — they&apos;ll light up as their sprints
          ship.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {moduleItems.map((item) => {
          const Icon = getIcon(item.icon);
          const isComingSoon = !item.enabled;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'group border-border bg-background/50 relative overflow-hidden rounded-lg border p-4 transition-all',
                'hover:border-primary/40 hover:bg-card hover:shadow-primary/5 hover:shadow-lg',
                isComingSoon && 'opacity-80',
              )}
            >
              <div className="flex items-start justify-between">
                <div className="bg-primary/10 text-primary ring-primary/20 flex h-9 w-9 items-center justify-center rounded-lg ring-1 transition-transform group-hover:scale-110">
                  <Icon className="h-4 w-4" />
                </div>
                {isComingSoon && (
                  <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[10px] font-medium">
                    {item.sprint}
                  </span>
                )}
              </div>
              <h3 className="text-foreground mt-3 text-sm font-semibold">{item.label}</h3>
              <div className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                <span>{isComingSoon ? 'Coming soon' : 'Open'}</span>
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
