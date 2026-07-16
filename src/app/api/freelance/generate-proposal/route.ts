/**
 * StudentOS Freelance — API: Generate Proposal/Cover Letter
 *
 * Security:
 *   - Verifies the Firebase ID token from the `Authorization: Bearer` header.
 *   - Validates the request body with Zod before processing.
 *   - Errors are logged server-side; clients receive a generic message in
 *     production (full message in dev).
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateProposal, generateCoverLetter } from '@/features/junova/services/ai-provider';
import { verifyAuthToken } from '@/lib/api-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const generateProposalSchema = z.object({
  type: z.enum(['proposal', 'cover-letter']),
  jobTitle: z.string().min(1),
  jobDescription: z.string().optional(),
  skills: z.array(z.string()).optional(),
  bio: z.string().optional(),
  studentName: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Verify the Firebase ID token.
    const auth = await verifyAuthToken(request);
    if (auth instanceof NextResponse) return auth;

    // 2. Parse + validate the body.
    const raw = await request.json();
    const parsed = generateProposalSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Bad request', details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const body = parsed.data;

    const skills: string[] = body.skills ?? [];
    const bio: string = body.bio ?? '';
    if (body.type === 'proposal') {
      const text = await generateProposal(body.jobTitle, body.jobDescription ?? '', skills, bio);
      return NextResponse.json({ success: true, text });
    } else if (body.type === 'cover-letter') {
      const text = await generateCoverLetter(
        body.jobTitle,
        body.studentName ?? 'Student',
        skills,
        bio,
      );
      return NextResponse.json({ success: true, text });
    }
    return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });
  } catch (err) {
    console.error('[api/freelance/generate-proposal] Error:', err);
    const message =
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err instanceof Error
          ? err.message
          : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
