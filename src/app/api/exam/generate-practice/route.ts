/**
 * StudentOS Exam Center — Generate Practice Quiz API
 *
 * POST /api/exam/generate-practice
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
import { generatePracticeQuiz } from '@/features/junova/services/ai-provider';
import { getMemory } from '@/features/junova/services/memory.service';
import { verifyAuthToken } from '@/lib/api-auth';
import type { Difficulty } from '@/features/exam/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const generatePracticeSchema = z.object({
  mode: z.enum([
    'daily',
    'weak-topics',
    'strong-topics',
    'timed',
    'adaptive',
    'retry-incorrect',
    'ai-suggested',
  ]),
  subject: z.string().optional(),
  topic: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  questionCount: z.number().int().min(1).max(50).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Verify the Firebase ID token.
    const auth = await verifyAuthToken(request);
    if (auth instanceof NextResponse) return auth;
    const uid = auth.uid;

    // 2. Parse + validate the body.
    const raw = await request.json();
    const parsed = generatePracticeSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Bad request', details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const body = parsed.data;

    const memResult = await getMemory(uid);
    const memory = memResult.success ? memResult.data : null;
    const questions = await generatePracticeQuiz({
      mode: body.mode,
      subject: body.subject ?? 'General',
      topic: body.topic ?? '',
      difficulty: (body.difficulty ?? 'medium') as Difficulty,
      questionCount: body.questionCount ?? 5,
      memory,
    });
    return NextResponse.json({ success: true, questions });
  } catch (err) {
    console.error('[api/exam/generate-practice] Error:', err);
    const message =
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err instanceof Error
          ? err.message
          : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
