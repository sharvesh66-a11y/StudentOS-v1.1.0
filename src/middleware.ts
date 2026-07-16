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
 * Test-mode deployment protection:
 *   When STUDENTOS_TEST_MODE=1 is set in the environment, every request
 *   must present either:
 *     (a) a `?key=<STUDENTOS_TEST_PREVIEW_KEY>` query parameter, OR
 *     (b) a `studentos-test-key` cookie with the same value.
 *   Requests without the key receive a 401 with a basic-auth challenge
 *   (so browsers prompt for credentials). This keeps the preview URL
 *   unguessable even if the URL itself leaks.
 *
 *   This is intended ONLY for development / test previews. It must be
 *   disabled (STUDENTOS_TEST_MODE unset) in production.
 *
 * Cookie-based auth note:
 *   Firebase Auth persists state in localStorage / IndexedDB by default, which
 *   the server cannot read. To enable full server-side protection, Sprint 13
 *   (Deployment) will add a server action that mints a session cookie from
 *   the Firebase ID token and sets it as an httpOnly cookie. Until then,
 *   this middleware handles only the public-path allow-list and guest-only
 *   redirect logic; render-level protection is handled by <ProtectedRoute>.
 *
 * @see src/features/auth/components/protected-route.tsx
 * @see docs/ARCHITECTURE.md §6 Security Model
 */

import { NextResponse, type NextRequest } from 'next/server';
import { PUBLIC_PATHS, GUEST_ONLY_PATHS } from '@/firebase/constants';

const TEST_MODE = process.env.STUDENTOS_TEST_MODE === '1';
const TEST_KEY = process.env.STUDENTOS_TEST_PREVIEW_KEY ?? '';
const TEST_PASSWORD = process.env.STUDENTOS_TEST_PASSWORD ?? '';
const TEST_REALM = 'StudentOS Test Preview';

/** Paths that bypass test-mode protection (static assets, health checks). */
const TEST_MODE_BYPASS = new Set<string>(['/api/health', '/robots.txt', '/favicon.ico']);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ------------------------------------------------------------------
  // Test-mode deployment protection (gates everything else).
  // ------------------------------------------------------------------
  if (TEST_MODE && !TEST_MODE_BYPASS.has(pathname)) {
    const queryKey = request.nextUrl.searchParams.get('key');
    const cookieKey = request.cookies.get('studentos-test-key')?.value;

    // (a) ?key=...  → set cookie + strip query param + redirect to clean URL.
    if (queryKey && queryKey === TEST_KEY) {
      const url = request.nextUrl.clone();
      url.searchParams.delete('key');
      const res = NextResponse.redirect(url);
      res.cookies.set('studentos-test-key', queryKey, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      return res;
    }

    // (b) cookie already set
    if (cookieKey && cookieKey === TEST_KEY) {
      // pass through to the rest of the middleware
    } else if (TEST_PASSWORD) {
      // (c) HTTP Basic Auth challenge — browser will prompt the user.
      const authHeader = request.headers.get('authorization');
      if (authHeader) {
        const [scheme, encoded] = authHeader.split(' ');
        if (scheme === 'Basic' && encoded) {
          try {
            const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
            const [user, pass] = decoded.split(':');
            if (user === 'preview' && pass === TEST_PASSWORD) {
              // pass through
            } else {
              return unauthorizedResponse();
            }
          } catch {
            return unauthorizedResponse();
          }
        } else {
          return unauthorizedResponse();
        }
      } else {
        return unauthorizedResponse();
      }
    } else {
      return unauthorizedResponse();
    }
  }

  // ------------------------------------------------------------------
  // Original auth flow
  // ------------------------------------------------------------------
  const sessionCookie = request.cookies.get('studentos-session')?.value;
  const isAuthenticated = Boolean(sessionCookie);

  const isGuestOnly = GUEST_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (isGuestOnly && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

function unauthorizedResponse() {
  return new NextResponse('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="${TEST_REALM}", charset="UTF-8"`,
      'Content-Type': 'text/plain',
    },
  });
}

export const config = {
  /**
   * Match all paths EXCEPT static assets, API routes, and Next internals.
   * The middleware runs on every navigation but only acts on guest-only
   * routes (see above) + test-mode protection (when STUDENTOS_TEST_MODE=1).
   */
  matcher: [
    /*
     * Match everything except:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico, logo.svg, robots.txt (static files)
     * - api/* (API routes — handled separately)
     * - any path containing a dot (file extensions)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|logo\\.svg|robots\\.txt|api|.*\\..*).*)',
  ],
};

export { PUBLIC_PATHS };
