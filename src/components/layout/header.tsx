'use client';

/**
 * StudentOS App Header
 *
 * Sticky top header for authenticated app routes. Contains:
 * - Mobile menu trigger (hamburger — below `lg:`)
 * - StudentOS wordmark (mobile only, since sidebar has the logo on desktop)
 * - Search input (navigates to dashboard on Enter)
 * - Notification bell
 * - User avatar (links to /profile)
 *
 * @see src/components/layout/app-shell.tsx
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Bell, Sparkles, Settings } from 'lucide-react';
import { MobileNav } from './mobile-nav';
import { APP_NAME } from '@/lib/constants';
import { useAuth } from '@/features/auth';
import { getInitials } from '@/utils/format';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export function Header() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const displayName = profile?.displayName ?? user?.displayName ?? 'Student';
  const initials = getInitials(displayName) || '🎓';
  const photoURL = user?.photoURL ?? undefined;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

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
    <header className="border-border bg-background/80 sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-4 backdrop-blur-xl sm:px-6">
      {/* Mobile menu */}
      <MobileNav />

      {/* Mobile wordmark */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="bg-primary/10 ring-primary/20 flex h-7 w-7 items-center justify-center rounded-lg ring-1">
          <Sparkles className="text-primary h-3.5 w-3.5" />
        </div>
        <span className="text-foreground text-sm font-semibold">{APP_NAME}</span>
      </div>

      {/* Search (hidden on mobile, visible sm+) */}
      <form onSubmit={handleSearch} className="relative ml-auto hidden sm:block sm:w-64 lg:w-80">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          type="search"
          placeholder="Search StudentOS…"
          className="h-9 pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search StudentOS"
        />
      </form>

      {/* Right side actions */}
      <div className="ml-auto flex items-center gap-2 sm:ml-0">
        {/* Notifications */}
        <button
          className="text-muted-foreground hover:bg-accent hover:text-foreground relative flex h-9 w-9 items-center justify-center rounded-md transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="bg-primary ring-background absolute top-1.5 right-1.5 h-2 w-2 rounded-full ring-2" />
        </button>

        {/* Settings shortcut */}
        <Link
          href="/settings"
          className="text-muted-foreground hover:bg-accent hover:text-foreground flex h-9 w-9 items-center justify-center rounded-md transition-colors"
          aria-label="Settings"
        >
          <Settings className="h-4 w-4" />
        </Link>

        {/* Avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="hover:ring-primary/40 rounded-full transition-all hover:ring-2"
              aria-label={`Account: ${displayName}`}
            >
              <Avatar className="ring-primary/20 h-9 w-9 ring-1">
                {photoURL ? (
                  <img src={photoURL} alt={displayName} className="h-full w-full object-cover" />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{displayName}</span>
                <span className="text-muted-foreground text-xs">
                  {profile?.email ?? user?.email ?? ''}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
