/**
 * StudentOS Planner — Generate Study Plan API
 *
 * POST /api/planner/generate
 *
 * Receives the student's memory + plan constraints, generates a personalized
 * study plan via the AI provider, runs it through the schedule engine, and
 * returns the time-tabled sessions.
 *
 * SERVER-ONLY.
 *
 * Security:
 *   - Verifies the Firebase ID token from the `Authorization: Bearer` header.
 *   - Validates the request body with Zod before processing.
 *   - Errors are logged server-side; clients receive a generic message in
 *     production (full message in dev).
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateStudyPlan } from '@/features/junova/services/ai-provider';
import { generateSchedule } from '@/features/planner/services/schedule-engine';
import { verifyAuthToken } from '@/lib/api-auth';
import type { StudentMemory } from '@/features/junova/types';
import type { ScheduleEngineInput } from '@/features/planner/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const objectSchema = z.custom<Record<string, unknown>>(
  (v) => typeof v === 'object' && v !== null && !Array.isArray(v),
  { message: 'Expected a non-null object' },
);

const generatePlanSchema = z.object({
  memory: objectSchema,
  startDate: z.string(),
  endDate: z.string(),
  dailyAvailableMinutes: z.number().int().min(0).optional(),
  preferredStartTime: z.string().optional(),
  preferredEndTime: z.string().optional(),
  examDates: z.array(z.object({ subject: z.string(), date: z.string() })).optional(),
  breakFrequencyMinutes: z.number().int().min(0).optional(),
  breakDurationMinutes: z.number().int().min(0).optional(),
  availableDays: z.array(z.number().int().min(0).max(6)).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Verify the Firebase ID token.
    const auth = await verifyAuthToken(request);
    if (auth instanceof NextResponse) return auth;

    // 2. Parse + validate the body.
    const raw = await request.json();
    const parsed = generatePlanSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Bad request', details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const body = parsed.data;

    const memory = body.memory as unknown as StudentMemory;

    // 1. Generate topics + goals via AI.
    const { topics, goals } = await generateStudyPlan({
      memory,
      startDate: body.startDate,
      endDate: body.endDate,
      dailyAvailableMinutes: body.dailyAvailableMinutes ?? 180,
      preferredStartTime: body.preferredStartTime ?? '09:00',
      preferredEndTime: body.preferredEndTime ?? '12:00',
      examDates: body.examDates,
    });

    // 2. Run the schedule engine to produce time-tabled sessions.
    const scheduleInput: ScheduleEngineInput = {
      startDate: body.startDate,
      endDate: body.endDate,
      dailyAvailableMinutes: body.dailyAvailableMinutes ?? 180,
      preferredStartTime: body.preferredStartTime ?? '09:00',
      preferredEndTime: body.preferredEndTime ?? '12:00',
      breakFrequencyMinutes: body.breakFrequencyMinutes ?? 50,
      breakDurationMinutes: body.breakDurationMinutes ?? 10,
      topics,
      availableDays: body.availableDays ?? [1, 2, 3, 4, 5],
    };

    const schedule = generateSchedule(scheduleInput);

    return NextResponse.json({
      success: true,
      sessions: schedule.sessions,
      totalMinutes: schedule.totalMinutes,
      sessionCount: schedule.sessionCount,
      goals,
    });
  } catch (err) {
    console.error('[api/planner/generate] Error:', err);
    const message =
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err instanceof Error
          ? err.message
          : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
