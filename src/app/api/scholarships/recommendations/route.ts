/**
 * StudentOS Scholarships — API: Generate Recommendations
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
import { generateScholarshipRecommendations } from '@/features/junova/services/ai-provider';
import { getMemory } from '@/features/junova/services/memory.service';
import { scholarshipService } from '@/features/scholarships/services/scholarship.service';
import { verifyAuthToken } from '@/lib/api-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const scholarshipRecommendationsSchema = z.object({
  // uid is intentionally NOT accepted from the client — we use auth.uid.
  // The schema is permissive (no required fields) so existing clients that
  // send `{ uid }` still validate; the uid is simply ignored.
});

export async function POST(request: NextRequest) {
  try {
    // 1. Verify the Firebase ID token.
    const auth = await verifyAuthToken(request);
    if (auth instanceof NextResponse) return auth;
    const uid = auth.uid;

    // 2. Parse + validate the body (permissive — no required fields).
    const raw = await request.json();
    const parsed = scholarshipRecommendationsSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Bad request', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const memResult = await getMemory(uid);
    const memory = memResult.success ? (memResult.data ?? null) : null;
    const profResult = await scholarshipService.getProfile(uid);
    const profile = profResult.success ? (profResult.data ?? null) : null;
    const profileData = profile
      ? {
          preferredCountry: profile.preferredCountry,
          preferredCourse: profile.preferredCourse,
          gpa: profile.academicInfo.gpa,
          incomeCategory: profile.incomeCategory,
          skills: profile.skills,
          achievements: profile.achievements,
        }
      : null;
    const result = await generateScholarshipRecommendations(memory, profileData);
    await scholarshipService.saveRecommendations(uid, result);
    return NextResponse.json({ success: true, recommendations: result });
  } catch (err) {
    console.error('[api/scholarships/recommendations] Error:', err);
    const message =
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err instanceof Error
          ? err.message
          : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
