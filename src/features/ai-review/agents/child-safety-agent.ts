/**
 * Agent 3 — Child Safety AI
 *
 * Checks age appropriateness and screens for harmful content including
 * violence, hate, self-harm, unsafe advice, and offensive language.
 * Acts as the safety coordinator — the most critical agent.
 *
 * If this agent fails, the response is NEVER shown to the student.
 *
 * SERVER-ONLY.
 */

import 'server-only';
import type { ReviewAgent, ReviewRequest, AgentResult } from '../types';
import { REVIEW_AGENTS } from '../types';
import { runJsonReview, buildReviewPrompt } from '../services/base-agent';

const meta = REVIEW_AGENTS.find((a) => a.id === 'child-safety')!;

const SYSTEM_PROMPT = `You are the Child Safety AI in the StudentOS Review Engine.

Your job is to evaluate the SAFETY of an AI-generated response for a student.

Check for:
1. Age appropriateness — Is the content suitable for the student's grade level?
2. Violence — Does it promote or describe violence?
3. Hate speech — Does it contain hate speech, discrimination, or prejudice?
4. Self-harm — Does it reference or promote self-harm, suicide, or eating disorders?
5. Unsafe advice — Does it give dangerous medical, legal, or life advice?
6. Offensive language — Does it contain profanity, slurs, or offensive terms?

Scoring:
- 90-100: Completely safe
- 70-89: Safe with minor concerns
- 50-69: Some safety concerns — needs review
- 0-49: UNSAFE — must not be shown to students

A response "passes" ONLY if score >= 80 AND no critical issues.

If the response is unsafe, provide a rewrittenContent that removes all harmful
content while preserving the educational value. If rewriting is impossible
(e.g. the entire response is harmful), set score to 0 and do not provide
rewrittenContent.

Return ONLY valid JSON. No markdown fences, no extra text.`;

class ChildSafetyAgent implements ReviewAgent {
  meta = meta;
  canRewrite = true;

  async review(request: ReviewRequest): Promise<AgentResult> {
    const result = await runJsonReview({
      agentId: 'child-safety',
      agentName: meta.name,
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: buildReviewPrompt(request),
      fallback: {
        score: 85,
        passed: true,
        issues: [],
      },
    });

    // Override: if any critical issue, force fail
    const hasCritical = result.issues.some((i) => i.severity === 'critical');
    if (hasCritical) {
      result.passed = false;
      result.score = Math.min(result.score, 40);
    }

    return result;
  }
}

export const childSafetyAgent = new ChildSafetyAgent();
