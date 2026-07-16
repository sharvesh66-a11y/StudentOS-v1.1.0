'use client';

/**
 * StudentOS Mobile Navigation
 *
 * Renders a hamburger button on screens below `lg:` that opens a slide-out
 * drawer (shadcn Sheet) containing the same navigation as the desktop sidebar.
 *
 * @see src/components/layout/sidebar.tsx
 * @see src/lib/nav.ts for nav item definitions
 */

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Sparkles, LogOut, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { NAV_ITEMS } from '@/lib/nav';
import { getIcon } from './icon-map';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';
import { useAuth } from '@/features/auth';
import { getInitials } from '@/utils/format';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const router = useRouter();

  const displayName = profile?.displayName ?? user?.displayName ?? 'Student';
  const email = profile?.email ?? user?.email ?? '';
  const initials = getInitials(displayName) || '🎓';

  const handleSignOut = async () => {
    setOpen(false);
    const result = await signOut();
    if (result.success) {
      toast.success('Signed out', { description: 'See you soon!' });
      router.push('/login');
      router.refresh();
    } else if (result.error) {
      toast.error('Sign-out failed', { description: result.error.message });
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="border-border bg-sidebar w-72 p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>

        {/* Logo */}
        <div className="border-border flex h-16 items-center gap-2.5 border-b px-6">
          <div className="bg-primary/10 ring-primary/20 flex h-8 w-8 items-center justify-center rounded-lg ring-1">
            <Sparkles className="text-primary h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sidebar-foreground text-sm font-semibold">{APP_NAME}</span>
            <span className="text-sidebar-foreground/50 text-[10px] tracking-wider uppercase">
              {APP_TAGLINE}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Primary mobile">
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = getIcon(item.icon);
              const isActive = pathname === item.href;
              const isComingSoon = !item.enabled && item.id !== 'dashboard';

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    isComingSoon && 'opacity-60',
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0',
                      isActive
                        ? 'text-sidebar-primary-foreground'
                        : 'text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground',
                    )}
                  />
                  <span className="flex-1 truncate font-medium">{item.label}</span>
                  {isComingSoon && (
                    <span className="bg-sidebar-accent text-sidebar-accent-foreground/70 rounded px-1.5 py-0.5 text-[10px] font-medium">
                      {item.sprint}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User footer */}
        <div className="border-border border-t p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <div className="bg-primary/10 text-primary ring-primary/20 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ring-1">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sidebar-foreground truncate text-sm font-medium">{displayName}</p>
              <p className="text-sidebar-foreground/50 truncate text-xs">{email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex h-8 w-8 items-center justify-center rounded-md transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
