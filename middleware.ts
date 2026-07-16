/**
 * StudentOS Authentication Middleware
 *
 * Server-side route protection. Runs before any page renders.
 *
 * Architecture:
 * - Client-side: <ProtectedRoute> (Sprint 1.2) handles render-level guards.
 * - Server-side: this middleware handles network-level redirects for the
 *   guest-only routes (/login, /signup) — once an authenticated session
 *   cookie is present (set by a future server action), authenticated users
 *   are bounced away from these guest pages.
 *
 * Cookie-based auth note:
 * Firebase Auth persists state in localStorage / IndexedDB by default, which
 * the server cannot read. To enable full server-side protection, Sprint 13
 * (Deployment) will add a server action that mints a session cookie from
 * the Firebase ID token and sets it as an httpOnly cookie. Until then,
 * this middleware handles only the public-path allow-list and guest-only
 * redirect logic; render-level protection is handled by <ProtectedRoute>.
 *
 * @see src/features/auth/components/protected-route.tsx
 * @see docs/ARCHITECTURE.md §6 Security Model
 */

import { NextResponse, type NextRequest } from 'next/server';
import { PUBLIC_PATHS, GUEST_ONLY_PATHS } from '@/firebase/constants';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for the StudentOS session cookie (set by a future server action).
  // Until Sprint 13 adds cookie-minting, this will always be absent, so
  // guest-only redirects are skipped and <ProtectedRoute> handles the rest.
  const sessionCookie = request.cookies.get('studentos-session')?.value;
  const isAuthenticated = Boolean(sessionCookie);

  // Guest-only route (e.g. /login, /signup) — bounce authenticated users.
  const isGuestOnly = GUEST_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (isGuestOnly && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  // All other routes pass through. Render-level protection is handled by
  // <ProtectedRoute> in the page component.
  return NextResponse.next();
}

export const config = {
  /**
   * Match all paths EXCEPT static assets, API routes, and Next internals.
   * The middleware runs on every navigation but only acts on guest-only
   * routes (see above).
   */
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.svg|robots.txt|api|.*\\..*).*)'],
};

// Re-export PUBLIC_PATHS for documentation / tooling
export { PUBLIC_PATHS };
