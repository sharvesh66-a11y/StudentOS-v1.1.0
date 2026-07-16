/**
 * StudentOS Client-Side API Helper
 *
 * Client-only utility for attaching a Firebase ID token to outbound
 * `fetch` calls against `/api/*` routes that use `verifyAuthToken`
 * (see `src/lib/api-auth.ts`).
 *
 * Three exports, in order of increasing convenience:
 *   1. `getAuthToken()`  — returns the raw ID token (or null).
 *   2. `authHeaders()`   — returns a `{ Authorization }` header object (or {}).
 *   3. `authedFetch()`   — drop-in replacement for `fetch()` that injects the
 *                          Authorization header and returns a 401 Response
 *                          when no user is signed in.
 *
 * CLIENT-ONLY. Relies on `getAuth()` from `firebase/auth`, which is a no-op
 * (returns a sentinel app) outside a browser context — but these helpers
 * should still never be imported from server code because the call sites
 * they wrap (`fetch('/api/...')`) are by definition client-side only.
 */

import { getAuth } from 'firebase/auth';

/**
 * Returns the current user's Firebase ID token, or null if not signed in.
 * Forces a token refresh if the token is close to expiry.
 */
export async function getAuthToken(): Promise<string | null> {
  const user = getAuth().currentUser;
  if (!user) return null;
  return await user.getIdToken(/* forceRefresh */ false);
}

/**
 * Returns the Authorization header object for the current user, or {} if not signed in.
 */
export async function authHeaders(): Promise<Record<string, string>> {
  const token = await getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Authenticated fetch — wraps `fetch()` and injects the Authorization header.
 *
 * - Preserves any existing headers from `init.headers` (including custom
 *   headers like `Accept: text/event-stream` used by SSE callers).
 * - Sets `Content-Type: application/json` on requests with a body, unless the
 *   caller explicitly provided a different `Content-Type`.
 * - If no user is signed in, returns a synthetic 401 Response (so callers can
 *   use their existing `!response.ok` error-handling branches unchanged).
 */
export async function authedFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = await getAuthToken();
  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(input, { ...init, headers });
}
