'use client';

/**
 * StudentOS Module Placeholder
 *
 * Reusable "Coming in Sprint X" page used by all not-yet-implemented module
 * routes. Renders the module's icon, name, description, sprint badge, and
 * a back-to-dashboard link.
 *
 * Each module route page is a 3-liner that delegates to this component:
 *   import { ModulePlaceholder } from '@/features/dashboard';
 *   export default function Page() {
 *     return <ModulePlaceholder moduleId="exam-center" />;
 *   }
 *
 * @see src/lib/constants.ts — APP_MODULES (source of module metadata)
 */

import { createElement } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { getModule, ROUTES } from '@/lib/nav';
import { getIcon } from '@/components/layout/icon-map';
import { APP_NAME, CORE_AI_NAME } from '@/lib/constants';

export interface ModulePlaceholderProps {
  moduleId: string;
}

/** Renders a Lucide icon by string name. Uses createElement to avoid the
 * React Compiler "no components during render" rule. */
function ModuleIcon({ name, className }: { name: string; className?: string }) {
  return createElement(getIcon(name), { className });
}

export function ModulePlaceholder({ moduleId }: ModulePlaceholderProps) {
  const mod = getModule(moduleId);

  if (!mod) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="text-center">
          <p className="text-muted-foreground text-sm">Module &quot;{moduleId}&quot; not found.</p>
          <Link
            href={ROUTES.dashboard}
            className="text-primary mt-4 inline-flex items-center gap-1.5 text-sm hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Ambient backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(60% 50% at 20% 0%, oklch(0.6 0.25 290 / 15%) 0%, transparent 60%), radial-gradient(50% 50% at 80% 10%, oklch(0.62 0.22 240 / 15%) 0%, transparent 60%)',
        }}
      />

      <div className="mx-auto max-w-3xl px-6 py-16 lg:py-24">
        {/* Back link */}
        <Link
          href={ROUTES.dashboard}
          className="text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>

        {/* Module hero */}
        <div className="animate-fade-up mt-8 text-center">
          <div className="bg-primary/10 ring-primary/20 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ring-2">
            <ModuleIcon name={mod.icon} className="text-primary h-8 w-8" />
          </div>

          <div className="mt-6 flex items-center justify-center gap-2">
            <h1 className="text-foreground text-3xl font-semibold tracking-tight">{mod.name}</h1>
            <span className="border-primary/20 bg-primary/5 text-primary rounded-full border px-2.5 py-0.5 text-xs font-medium">
              {mod.sprint}
            </span>
          </div>

          <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-base leading-relaxed">
            {mod.description}
          </p>
        </div>

        {/* Coming soon card */}
        <div
          className="animate-fade-up border-border bg-card/50 mt-12 rounded-2xl border p-8 text-center backdrop-blur-sm"
          style={{ animationDelay: '100ms' }}
        >
          <div className="bg-primary/10 ring-primary/20 mx-auto flex h-12 w-12 items-center justify-center rounded-full ring-1">
            <Sparkles className="text-primary h-6 w-6" />
          </div>
          <h2 className="text-foreground mt-4 text-lg font-semibold">Coming in {mod.sprint}</h2>
          <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-relaxed">
            This module is part of the StudentOS roadmap and will be built in{' '}
            <span className="text-foreground font-medium">{mod.sprint}</span>. It will integrate
            with {CORE_AI_NAME} for a personalized, AI-powered experience.
          </p>

          {/* Junova integration badge */}
          {mod.junovaIntegrated && (
            <div className="border-primary/20 bg-primary/5 mt-6 inline-flex items-center gap-2 rounded-full border px-4 py-2">
              <Sparkles className="text-primary h-3.5 w-3.5" />
              <span className="text-primary text-xs font-medium">{CORE_AI_NAME} integrated</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-muted-foreground/60 mt-12 text-center text-xs">
          {APP_NAME} · Learn. Grow. Achieve.
        </p>
      </div>
    </div>
  );
}
