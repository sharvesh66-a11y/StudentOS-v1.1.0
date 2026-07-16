/**
 * StudentOS Auth Redirect Utility
 *
 * Safely reads the `?redirect=` query param from the URL and validates it
 * to prevent open-redirect attacks. Only allows relative paths within the
 * StudentOS app — never external URLs.
 *
 * @see src/app/(auth)/login/page.tsx
 * @see src/app/(auth)/signup/page.tsx
 */

/** Paths that should NEVER be used as redirect targets. */
const FORBIDDEN_REDIRECT_PREFIXES = ['/login', '/signup', '/forgot-password', '/verify-email'];

/**
 * Validate a redirect path. Returns `null` if the path is unsafe.
 *
 * Rules:
 * - Must start with `/`
 * - Must NOT be an external URL (no `//` or `http(s)://`)
 * - Must NOT be one of the auth-only paths (would cause redirect loops)
 */
export function sanitizeRedirect(path: string | null | undefined): string | null {
  if (!path || typeof path !== 'string') return null;

  // Must start with a single slash — reject `//evil.com` and `http://...`.
  if (!path.startsWith('/') || path.startsWith('//')) return null;

  // Reject external URLs that slipped past the first check.
  if (/^\/https?:/i.test(path)) return null;

  // Reject auth-only paths (prevents redirect loops).
  if (FORBIDDEN_REDIRECT_PREFIXES.some((p) => path === p || path.startsWith(p + '/'))) {
    return null;
  }

  return path;
}

/**
 * Get the safe redirect path from a URLSearchParams object.
 * Falls back to `defaultPath` if no safe redirect is present.
 */
export function getSafeRedirect(searchParams: URLSearchParams, defaultPath = '/dashboard'): string {
  const raw = searchParams.get('redirect');
  return sanitizeRedirect(raw) ?? defaultPath;
}
