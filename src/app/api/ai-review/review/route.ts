/**
 * StudentOS AI Review Engine — Review API
 *
 * POST /api/ai-review/review
 *
 * Accepts a user message + AI response and runs the full review pipeline.
 * Returns the ReviewResult with verdict, scores, and approved content.
 *
 * Use this endpoint to:
 *   - Review any AI-generated content before displaying it
 *   - Test the review engine with sample inputs
 *   - Integrate review into non-chat features (notes, quizzes, etc.)
 *
 * Security:
 *   - Verifies Firebase ID token
 *   - Validates request body with Zod
 *
 * @see src/features/ai-review/services/review-engine.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuthToken } from '@/lib/api-auth';
import { reviewResponse } from '@/features/ai-review';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const reviewRequestSchema = z.object({
  userMessage: z.string().min(1).max(10000),
  aiResponse: z.string().min(1).max(20000),
  providerId: z.string().min(1),
  studentGrade: z.string().optional(),
  subject: z.string().optional(),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      }),
    )
    .optional(),
});

export async function POST(request: NextRequest) {
  // Verify authentication
  const auth = await verifyAuthToken(request);
  if (auth instanceof NextResponse) return auth;

  // Parse + validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parseResult = reviewRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: 'Invalid request body',
        details: parseResult.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const result = await reviewResponse(parseResult.data);

    return NextResponse.json({
      success: true,
      review: result,
    });
  } catch (error) {
    console.error('[api/ai-review/review] Error:', error);
    const message =
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : error instanceof Error
          ? error.message
          : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET /api/ai-review/review
 *
 * Returns metadata about the review engine (agent list, etc.) for
 * documentation + UI purposes.
 */
export async function GET(request: NextRequest) {
  const auth = await verifyAuthToken(request);
  if (auth instanceof NextResponse) return auth;

  const { REVIEW_AGENTS } = await import('@/features/ai-review');

  return NextResponse.json({
    success: true,
    engine: {
      name: 'StudentOS AI Review Engine',
      version: '1.0.0',
      agents: REVIEW_AGENTS,
      pipeline: ['Student → AI Provider → Review Engine (6 agents) → Approved Response → Student'],
    },
  });
}
