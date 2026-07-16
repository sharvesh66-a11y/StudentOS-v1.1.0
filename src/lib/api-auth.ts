/**
 * StudentOS API Auth Helper
 *
 * Server-only utility for verifying Firebase ID tokens in Next.js API routes.
 *
 * The Firebase Admin SDK is initialised in `@/firebase/admin` (server-only).
 * This helper wraps `adminAuth.verifyIdToken()` so API routes can:
 *   1. Pull the Bearer token from the `Authorization` header.
 *   2. Verify it server-side (rejecting forged / expired tokens).
 *   3. Either return the decoded token (with `.uid`) for downstream use, OR
 *      return a ready-to-send 401 NextResponse.
 *
 * Usage:
 *   import { verifyAuthToken } from '@/lib/api-auth';
 *   const auth = await verifyAuthToken(req);
 *   if (auth instanceof NextResponse) return auth; // 401 sent
 *   const uid = auth.uid; // verified user id
 *
 * SERVER-ONLY. Must never be imported from client code.
 *
 * @see src/firebase/admin.ts
 */

import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { getAdminAuth } from '@/firebase/admin';

/**
 * Verifies the Firebase ID token from the `Authorization: Bearer <token>`
 * header on a NextRequest.
 *
 * Returns the decoded token (containing `.uid`, `.email`, etc.) on success,
 * or a 401 NextResponse on failure (missing header, malformed token, expired
 * token, revoked token, Admin SDK not initialised, etc.).
 *
 * Callers MUST check the return type with `instanceof NextResponse` before
 * using the decoded token:
 *
 *   const auth = await verifyAuthToken(req);
 *   if (auth instanceof NextResponse) return auth;
 *   // auth.uid is now narrowed to `string`
 */
export async function verifyAuthToken(
  req: NextRequest,
): Promise<DecodedIdToken | NextResponse<unknown>> {
  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const idToken = authHeader.slice('Bearer '.length).trim();
  if (!idToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const adminAuth = getAdminAuth();
    if (!adminAuth) {
      console.error('[api-auth] Admin SDK not configured — cannot verify token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const decoded = await adminAuth.verifyIdToken(idToken);
    return decoded;
  } catch (err) {
    console.error('[api-auth] ID token verification failed:', err);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

/**
 * Type guard that narrows a `verifyAuthToken` result to the failure branch
 * (a NextResponse ready to return to the client).
 *
 *   const auth = await verifyAuthToken(req);
 *   if (isAuthFailure(auth)) return auth;
 *   // auth is now DecodedIdToken
 */
export function isAuthFailure(
  result: DecodedIdToken | NextResponse<unknown>,
): result is NextResponse<unknown> {
  return result instanceof NextResponse;
}
