/**
 * StudentOS Junova AI — Recommendations API
 *
 * POST /api/junova/recommendations
 *
 * Receives a student's memory + available teachers, generates personalized
 * recommendations via the AI provider, and returns them as JSON. The client
 * then saves them to Firestore.
 *
 * SERVER-ONLY — the z-ai-web-dev-sdk is never bundled to the client.
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
import { generateRecommendations } from '@/features/junova/services/ai-provider';
import { verifyAuthToken } from '@/lib/api-auth';
import type { AITeacher, StudentMemory } from '@/features/junova/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const objectSchema = z.custom<Record<string, unknown>>(
  (v) => typeof v === 'object' && v !== null && !Array.isArray(v),
  { message: 'Expected a non-null object' },
);

const recommendationsRequestSchema = z.object({
  memory: objectSchema,
  teachers: z.array(objectSchema).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Verify the Firebase ID token.
    const auth = await verifyAuthToken(request);
    if (auth instanceof NextResponse) return auth;

    // 2. Parse + validate the body.
    const raw = await request.json();
    const parsed = recommendationsRequestSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Bad request', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const memory = parsed.data.memory as unknown as StudentMemory;
    const teachers = (parsed.data.teachers ?? []) as unknown as AITeacher[];

    const recommendations = await generateRecommendations({ memory, teachers });

    return NextResponse.json({ success: true, recommendations });
  } catch (err) {
    console.error('[api/junova/recommendations] Error:', err);
    const message =
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err instanceof Error
          ? err.message
          : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
