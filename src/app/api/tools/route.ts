/**
 * StudentOS AI Tools — Execute Tool API
 *
 * POST /api/tools
 *
 * Security:
 *   - Verifies the Firebase ID token from the `Authorization: Bearer` header.
 *   - Validates the request body with Zod before processing.
 *   - Errors are logged server-side; clients receive a generic message in
 *     production (full message in dev).
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { executeTool } from '@/features/tools/services/tools.service';
import { verifyAuthToken } from '@/lib/api-auth';
import type { ToolType, AIProviderType } from '@/features/tools/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const toolSchema = z.enum([
  'formula-solver',
  'scientific-calculator',
  'unit-converter',
  'ocr',
  'pdf-summarizer',
  'handwriting',
  'grammar-checker',
  'translator',
  'text-summarizer',
  'flashcard-generator',
  'mindmap-generator',
  'citation-generator',
]);

const providerSchema = z.enum([
  'zai',
  'openai',
  'gemini',
  'claude',
  'grok',
  'deepseek',
  'glm',
  'local',
]);

const executeToolSchema = z.object({
  tool: toolSchema,
  input: z.string().min(1),
  options: z.record(z.string(), z.unknown()).optional(),
  provider: providerSchema.optional(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Verify the Firebase ID token.
    const auth = await verifyAuthToken(request);
    if (auth instanceof NextResponse) return auth;

    // 2. Parse + validate the body.
    const raw = await request.json();
    const parsed = executeToolSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Bad request', details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const body = parsed.data;

    const result = await executeTool({
      tool: body.tool as ToolType,
      input: body.input,
      options: body.options,
      provider: (body.provider ?? 'zai') as AIProviderType,
    });
    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error('[api/tools] Error:', err);
    const message =
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err instanceof Error
          ? err.message
          : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
