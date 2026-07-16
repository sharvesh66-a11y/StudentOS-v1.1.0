/**
 * StudentOS Junova AI — Suggested Follow-ups API
 *
 * POST /api/junova/suggest
 *
 * Receives a teacher config + last exchange, returns 3 suggested follow-up
 * questions as JSON.
 *
 * Security:
 *   - Verifies the Firebase ID token from the `Authorization: Bearer` header.
 *   - Validates the request body with Zod before processing.
 *   - Errors are logged server-side; clients receive a generic message in
 *     production (full message in dev).
 *
 * @see src/features/junova/services/ai-provider.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateSuggestions } from '@/features/junova/services/ai-provider';
import { verifyAuthToken } from '@/lib/api-auth';
import type { AITeacher } from '@/features/junova/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const objectSchema = z.custom<Record<string, unknown>>(
  (v) => typeof v === 'object' && v !== null && !Array.isArray(v),
  { message: 'Expected a non-null object' },
);

const suggestRequestSchema = z.object({
  teacher: objectSchema,
  lastUserMessage: z.string().min(1),
  lastAssistantResponse: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Verify the Firebase ID token.
    const auth = await verifyAuthToken(request);
    if (auth instanceof NextResponse) return auth;

    // 2. Parse + validate the body.
    const raw = await request.json();
    const parsed = suggestRequestSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Bad request', details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const body = parsed.data;

    const suggestions = await generateSuggestions({
      teacher: body.teacher as unknown as AITeacher,
      lastUserMessage: body.lastUserMessage,
      lastAssistantResponse: body.lastAssistantResponse,
    });

    return NextResponse.json({ success: true, suggestions });
  } catch (err) {
    console.error('[api/junova/suggest] Error:', err);
    const message =
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err instanceof Error
          ? err.message
          : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
