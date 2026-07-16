/**
 * StudentOS App Layout
 *
 * Layout for authenticated app routes. Wraps children in `<AppShell>` which
 * provides the sidebar + header + content area. The shell is responsive:
 * desktop sidebar on `lg+`, mobile drawer below.
 *
 * This is a Server Component — the AppShell itself is a client component
 * (it uses `usePathname` for active-link highlighting).
 *
 * @see src/components/layout/app-shell.tsx
 */

import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/app-shell';

export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
