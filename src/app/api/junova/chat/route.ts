/**
 * StudentOS Junova AI — Streaming Chat API (with Review Engine)
 *
 * POST /api/junova/chat
 *
 * Receives a ChatRequest (teacher config + message + history) and returns
 * a streaming response (text/event-stream chunks). The AI provider generates
 * the response, then the Review Engine intercepts before final delivery.
 *
 * Pipeline:
 *   1. Stream AI response chunks to client (for responsiveness)
 *   2. Accumulate full response
 *   3. Run Review Engine (6 agents) on the full response
 *   4. If review passes → send 'done' with review metadata
 *   5. If review fails → send 'review-correction' with approved content
 *   6. If review enhances → send 'review-enhanced' with enhanced content
 *
 * Security:
 *   - Verifies Firebase ID token from Authorization: Bearer header
 *   - Validates request body with Zod
 *   - Errors logged server-side; generic messages in production
 *
 * @see src/features/junova/services/ai-provider.ts
 * @see src/features/ai-review/services/review-engine.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateStreamingResponse } from '@/features/junova/services/ai-provider';
import { verifyAuthToken } from '@/lib/api-auth';
import { reviewResponse } from '@/features/ai-review';
import type { ChatRequest, ChatStreamChunk } from '@/features/junova/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Permissive object schema — used for the teacher config + memory payload. */
const objectSchema = z.custom<Record<string, unknown>>(
  (v) => typeof v === 'object' && v !== null && !Array.isArray(v),
  { message: 'Expected a non-null object' },
);

const chatRequestSchema = z.object({
  conversationId: z.string().optional(),
  teacherId: z.string().min(1),
  teacher: objectSchema,
  message: z.string().min(1),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      }),
    )
    .optional(),
  attachments: z.array(z.unknown()).optional(),
  memory: objectSchema.nullable().optional(),
  /** Student grade level for age-appropriateness review. */
  studentGrade: z.string().optional(),
  /** Subject context for syllabus relevance. */
  subject: z.string().optional(),
  /** Whether to run the review engine (default: true). */
  enableReview: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Verify the Firebase ID token.
    const auth = await verifyAuthToken(request);
    if (auth instanceof NextResponse) return auth;

    // 2. Parse + validate the body.
    const raw = await request.json();
    const parsed = chatRequestSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Bad request', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const body = parsed.data as unknown as ChatRequest & {
      studentGrade?: string;
      subject?: string;
      enableReview?: boolean;
    };

    const teacher = body.teacher;
    if (!teacher) {
      return NextResponse.json({ error: 'Teacher config required' }, { status: 400 });
    }

    const enableReview = body.enableReview !== false; // default true

    // 3. Create a readable stream that yields chunks.
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = '';

        try {
          // Phase 1: Stream AI response chunks to client
          const generator = generateStreamingResponse({
            teacher,
            userMessage: body.message,
            history: body.history ?? [],
            memory: body.memory ?? null,
          });

          for await (const chunk of generator) {
            fullResponse += chunk;
            const data: ChatStreamChunk = { type: 'delta', content: chunk };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          }

          // Phase 2: Run Review Engine on the full response
          if (enableReview && fullResponse.trim().length > 0) {
            // Send a 'reviewing' event so the UI can show a review indicator
            const reviewingChunk: ChatStreamChunk = {
              type: 'delta',
              content: '\n\n_🔬 StudentOS Review Engine is checking this response..._',
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(reviewingChunk)}\n\n`));

            try {
              const reviewResult = await reviewResponse({
                userMessage: body.message,
                aiResponse: fullResponse,
                providerId: 'zai',
                studentGrade: body.studentGrade,
                subject: body.subject,
                history: body.history,
              });

              // Phase 3: Handle review verdict
              if (reviewResult.verdict === 'rejected') {
                // Send a 'review-correction' event with the blocked message
                const correctionChunk: ChatStreamChunk & { review?: unknown } = {
                  type: 'review-correction',
                  content: reviewResult.approvedContent,
                  review: {
                    verdict: reviewResult.verdict,
                    scores: reviewResult.scores,
                    issues: reviewResult.issues,
                  },
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(correctionChunk)}\n\n`));
              } else if (reviewResult.wasRewritten) {
                // Send a 'review-correction' event with the rewritten content
                const correctionChunk: ChatStreamChunk & { review?: unknown } = {
                  type: 'review-correction',
                  content: reviewResult.approvedContent,
                  review: {
                    verdict: reviewResult.verdict,
                    scores: reviewResult.scores,
                    wasRewritten: true,
                    issues: reviewResult.issues,
                  },
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(correctionChunk)}\n\n`));
              } else if (reviewResult.verdict === 'approved-with-enhancements') {
                // Send a 'review-enhanced' event with the enhanced content
                const enhancedChunk: ChatStreamChunk & { review?: unknown } = {
                  type: 'review-enhanced',
                  content: reviewResult.approvedContent,
                  review: {
                    verdict: reviewResult.verdict,
                    scores: reviewResult.scores,
                    issues: reviewResult.issues,
                  },
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(enhancedChunk)}\n\n`));
              } else {
                // Approved as-is — send review metadata
                const metaChunk: ChatStreamChunk & { review?: unknown } = {
                  type: 'review-meta',
                  review: {
                    verdict: reviewResult.verdict,
                    scores: reviewResult.scores,
                    issues: reviewResult.issues,
                  },
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(metaChunk)}\n\n`));
              }
            } catch (reviewError) {
              console.error('[api/junova/chat] Review engine error:', reviewError);
              // If review fails, don't block the response — just log
              const errorChunk: ChatStreamChunk = {
                type: 'error',
                error: 'Review engine unavailable — response shown without review.',
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorChunk)}\n\n`));
            }
          }

          // Send done signal.
          const done: ChatStreamChunk = { type: 'done' };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(done)}\n\n`));
        } catch (err) {
          console.error('[api/junova/chat] Stream error:', err);
          const message =
            process.env.NODE_ENV === 'production'
              ? 'Internal server error'
              : err instanceof Error
                ? err.message
                : 'Unknown error';
          const errorChunk: ChatStreamChunk = { type: 'error', error: message };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorChunk)}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    console.error('[api/junova/chat] Error:', err);
    const message =
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err instanceof Error
          ? err.message
          : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
