'use client';

/**
 * StudentOS Desktop Sidebar (v1.1)
 *
 * Animated sidebar with:
 *   - StudentOS Logo at top
 *   - Navigation with active indicator (animated)
 *   - Hover effects
 *   - User footer with avatar + sign out
 *
 * Renders on `lg:` and above. Hidden below — mobile uses <MobileNav>.
 */

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogOut, User, Settings } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/nav';
import { getIcon } from './icon-map';
import { APP_TAGLINE } from '@/lib/constants';
import { Logo } from '@/components/brand';
import { useAuth } from '@/features/auth';
import { getInitials } from '@/utils/format';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function Sidebar() {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const router = useRouter();

  const displayName = profile?.displayName ?? user?.displayName ?? 'Student';
  const email = profile?.email ?? user?.email ?? '';
  const initials = getInitials(displayName) || '🎓';

  const handleSignOut = async () => {
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
    <aside
      aria-label="Sidebar"
      className="border-border bg-sidebar fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r backdrop-blur-xl lg:flex"
    >
      {/* Logo */}
      <div className="border-border flex h-16 items-center gap-2.5 border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Logo size="sm" />
          <div className="flex flex-col">
            <span className="text-sidebar-foreground text-sm font-semibold">StudentOS</span>
            <span className="text-sidebar-foreground/50 text-[10px] tracking-wider uppercase">
              {APP_TAGLINE}
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Primary">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = getIcon(item.icon);
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const isComingSoon = !item.enabled && item.id !== 'dashboard';

            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  isComingSoon && 'opacity-60',
                )}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="bg-primary absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-r-full"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
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

        {/* Quick links */}
        <div className="border-border/50 mt-6 border-t pt-4">
          <p className="text-muted-foreground px-3 pb-2 text-[10px] font-semibold tracking-wider uppercase">
            Account
          </p>
          <div className="space-y-1">
            <Link
              href="/profile"
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all',
                pathname === '/profile'
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
            >
              <User className="h-4 w-4 shrink-0" />
              <span className="font-medium">Profile</span>
            </Link>
            <Link
              href="/settings"
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all',
                pathname === '/settings'
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
            >
              <Settings className="h-4 w-4 shrink-0" />
              <span className="font-medium">Settings</span>
            </Link>
          </div>
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
    </aside>
  );
}
