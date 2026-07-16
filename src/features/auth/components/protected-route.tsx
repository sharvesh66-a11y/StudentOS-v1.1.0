'use client';

/**
 * StudentOS Protected Route Wrapper
 *
 * Gates content behind authentication. When unauthenticated, redirects to
 * the sign-in page (with a `redirect` query param so the user returns to
 * the original page after login).
 *
 * Auth UI (login/signup pages) does NOT exist yet — it ships in M2. This
 * component is the route-guard primitive that M2's app router will use to
 * protect `/dashboard`, `/planner`, `/junova`, etc.
 *
 * Usage (in a protected route's `page.tsx`):
 *   import { ProtectedRoute } from '@/features/auth';
 *   export default function DashboardPage() {
 *     return (
 *       <ProtectedRoute>
 *         <Dashboard />
 *       </ProtectedRoute>
 *     );
 *   }
 *
 * Or in a layout:
 *   import { ProtectedRoute } from '@/features/auth';
 *   export default function DashboardLayout({ children }) {
 *     return <ProtectedRoute>{children}</ProtectedRoute>;
 *   }
 *
 * @see src/features/auth/hooks/use-auth.ts
 * @see docs/ARCHITECTURE.md §6 Security Model
 */

import { useEffect, useRef, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../hooks/use-auth';
import { FullPageLoader } from './full-page-loader';

export interface ProtectedRouteProps {
  children: ReactNode;
  /** Path to redirect to when unauthenticated. Default: `/login`. */
  signInPath?: string;
  /** Optional fallback shown while loading. Default: `<FullPageLoader />`. */
  fallback?: ReactNode;
  /** When true, the route is only for UNauthenticated users (e.g. /login). */
  inverse?: boolean;
  /** Path to redirect authenticated users to when `inverse` is true. */
  authenticatedRedirect?: string;
}

export function ProtectedRoute({
  children,
  signInPath = '/login',
  fallback,
  inverse = false,
  authenticatedRedirect = '/dashboard',
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (isLoading || redirectedRef.current) return;

    if (!inverse && !isAuthenticated) {
      // Protecting a private route — redirect to login.
      redirectedRef.current = true;
      const redirectParam = pathname ? `?redirect=${encodeURIComponent(pathname)}` : '';
      router.replace(`${signInPath}${redirectParam}`);
    } else if (inverse && isAuthenticated) {
      // Inverse mode — route is for guests only (e.g. /login). Authenticated
      // users get bounced to the dashboard.
      redirectedRef.current = true;
      router.replace(authenticatedRedirect);
    }
  }, [isLoading, isAuthenticated, inverse, signInPath, authenticatedRedirect, router, pathname]);

  // Show loader during initial auth check.
  if (isLoading) {
    return <>{fallback ?? <FullPageLoader />}</>;
  }

  // Protecting a private route — render only if authenticated.
  if (!inverse && !isAuthenticated) {
    return <>{fallback ?? <FullPageLoader />}</>;
  }

  // Inverse (guest-only) — render only if NOT authenticated.
  if (inverse && isAuthenticated) {
    return <>{fallback ?? <FullPageLoader />}</>;
  }

  return <>{children}</>;
}

/**
 * GuestRoute — convenience wrapper for inverse mode.
 * Use this on `/login` and `/signup` to bounce authenticated users away.
 */
export function GuestRoute(props: Omit<ProtectedRouteProps, 'inverse'>) {
  return <ProtectedRoute {...props} inverse />;
}
