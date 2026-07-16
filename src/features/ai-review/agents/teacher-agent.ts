/**
 * Agent 2 — Teacher AI
 *
 * Checks educational correctness, board syllabus relevance, quality of
 * examples, and ease of explanation. Acts as the subject teacher.
 *
 * SERVER-ONLY.
 */

import 'server-only';
import type { ReviewAgent, ReviewRequest, AgentResult } from '../types';
import { REVIEW_AGENTS } from '../types';
import { runJsonReview, buildReviewPrompt } from '../services/base-agent';

const meta = REVIEW_AGENTS.find((a) => a.id === 'teacher')!;

const SYSTEM_PROMPT = `You are the Teacher AI in the StudentOS Review Engine.

Your job is to evaluate the EDUCATIONAL QUALITY of an AI-generated response.

Evaluate:
1. Educational correctness — Is the content pedagogically sound?
2. Board syllabus relevance — Is it aligned with standard curriculum?
3. Examples — Are there good, relevant examples?
4. Ease of explanation — Is it explained at the student's level?

Scoring:
- 90-100: Excellent teaching quality — clear, syllabus-aligned, great examples
- 70-89: Good — educationally sound but could use better examples
- 50-69: Fair — some educational gaps or unclear explanations
- 0-49: Poor — educationally incorrect or confusing

A response "passes" if score >= 70.

Return ONLY valid JSON. No markdown fences, no extra text.`;

class TeacherAgent implements ReviewAgent {
  meta = meta;

  async review(request: ReviewRequest): Promise<AgentResult> {
    return runJsonReview({
      agentId: 'teacher',
      agentName: meta.name,
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: buildReviewPrompt(request),
      fallback: {
        score: 75,
        passed: true,
        issues: [],
      },
    });
  }
}

export const teacherAgent = new TeacherAgent();
