/**
 * StudentOS Notes Hub — Solve Doubt API
 *
 * POST /api/notes/doubt
 *
 * Security:
 *   - Verifies the Firebase ID token from the `Authorization: Bearer` header.
 *   - Uses the verified `auth.uid` in place of the client-supplied `body.uid`.
 *   - Validates the request body with Zod before processing.
 *   - Errors are logged server-side; clients receive a generic message in
 *     production (full message in dev).
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { solveDoubt } from '@/features/junova/services/ai-provider';
import { getMemory } from '@/features/junova/services/memory.service';
import { verifyAuthToken } from '@/lib/api-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const doubtSchema = z.object({
  question: z.string().min(1),
  subject: z.string().optional(),
  topic: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Verify the Firebase ID token.
    const auth = await verifyAuthToken(request);
    if (auth instanceof NextResponse) return auth;
    const uid = auth.uid;

    // 2. Parse + validate the body.
    const raw = await request.json();
    const parsed = doubtSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Bad request', details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const body = parsed.data;

    const memResult = await getMemory(uid);
    const memory = memResult.success ? memResult.data : null;
    const result = await solveDoubt({
      question: body.question,
      subject: body.subject ?? 'General',
      topic: body.topic ?? '',
      memory,
    });
    return NextResponse.json({ success: true, doubt: result });
  } catch (err) {
    console.error('[api/notes/doubt] Error:', err);
    const message =
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err instanceof Error
          ? err.message
          : 'Unknown error';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 },
    );
  }
}
