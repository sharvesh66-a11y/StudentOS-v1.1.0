/**
 * StudentOS Notes Hub — Generate Notes API
 *
 * POST /api/notes/generate
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
import { generateNotes } from '@/features/junova/services/ai-provider';
import { getMemory } from '@/features/junova/services/memory.service';
import { verifyAuthToken } from '@/lib/api-auth';
import type { NoteType } from '@/features/notes/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const generateNotesSchema = z.object({
  subject: z.string().min(1),
  chapter: z.string().optional(),
  topic: z.string().optional(),
  type: z.enum(['chapter', 'topic', 'short', 'detailed', 'revision']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Verify the Firebase ID token.
    const auth = await verifyAuthToken(request);
    if (auth instanceof NextResponse) return auth;
    const uid = auth.uid;

    // 2. Parse + validate the body.
    const raw = await request.json();
    const parsed = generateNotesSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Bad request', details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const body = parsed.data;

    const memResult = await getMemory(uid);
    const memory = memResult.success ? memResult.data : null;
    const notes = await generateNotes({
      subject: body.subject,
      chapter: body.chapter ?? '',
      topic: body.topic ?? '',
      type: (body.type ?? 'detailed') as NoteType,
      memory,
    });
    return NextResponse.json({ success: true, notes });
  } catch (err) {
    console.error('[api/notes/generate] Error:', err);
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
