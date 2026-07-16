/**
 * StudentOS Exam Center — Generate Quiz API
 *
 * POST /api/exam/generate-quiz
 *
 * Security:
 *   - Verifies the Firebase ID token from the `Authorization: Bearer` header.
 *   - Uses the verified `auth.uid` in place of the client-supplied `body.uid`
 *     (prevents IDOR — a client cannot read another user's memory).
 *   - Validates the request body with Zod before processing.
 *   - Errors are logged server-side; clients receive a generic message in
 *     production (full message in dev).
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateQuiz } from '@/features/junova/services/ai-provider';
import { getMemory } from '@/features/junova/services/memory.service';
import { verifyAuthToken } from '@/lib/api-auth';
import type { Difficulty, QuestionType } from '@/features/exam/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const generateQuizSchema = z.object({
  subject: z.string().min(1),
  chapter: z.string().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  questionCount: z.number().int().min(1).max(50).optional(),
  questionTypes: z
    .array(z.enum(['mcq', 'true-false', 'fill-blank', 'short-answer', 'long-answer']))
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Verify the Firebase ID token.
    const auth = await verifyAuthToken(request);
    if (auth instanceof NextResponse) return auth;
    const uid = auth.uid;

    // 2. Parse + validate the body.
    const raw = await request.json();
    const parsed = generateQuizSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Bad request', details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const body = parsed.data;

    // Fetch memory for personalization (use the verified uid, not body.uid).
    const memResult = await getMemory(uid);
    const memory = memResult.success ? memResult.data : null;

    const questions = await generateQuiz({
      subject: body.subject,
      chapter: body.chapter,
      difficulty: (body.difficulty ?? 'medium') as Difficulty,
      questionCount: body.questionCount ?? 10,
      questionTypes: (body.questionTypes ?? ['mcq']) as QuestionType[],
      memory,
    });

    return NextResponse.json({ success: true, questions });
  } catch (err) {
    console.error('[api/exam/generate-quiz] Error:', err);
    const message =
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err instanceof Error
          ? err.message
          : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
