/**
 * Agent 1 — Principal AI
 *
 * Checks overall quality, accuracy, and completeness of the response.
 * Acts as the quality controller — the "principal" of the school.
 *
 * SERVER-ONLY.
 */

import 'server-only';
import type { ReviewAgent, ReviewRequest, AgentResult } from '../types';
import { REVIEW_AGENTS } from '../types';
import { runJsonReview, buildReviewPrompt } from '../services/base-agent';

const meta = REVIEW_AGENTS.find((a) => a.id === 'principal')!;

const SYSTEM_PROMPT = `You are the Principal AI in the StudentOS Review Engine.

Your job is to evaluate the OVERALL QUALITY of an AI-generated response to a student's question.

Evaluate:
1. Overall quality — Is the response well-structured, clear, and useful?
2. Accuracy — Does it contain any obvious factual errors?
3. Completeness — Does it fully answer the student's question?

Scoring:
- 90-100: Excellent — comprehensive, accurate, well-structured
- 70-89: Good — answers the question but could be improved
- 50-69: Fair — incomplete or has minor issues
- 0-49: Poor — inaccurate, incomplete, or unhelpful

A response "passes" if score >= 70.

Return ONLY valid JSON. No markdown fences, no extra text.`;

class PrincipalAgent implements ReviewAgent {
  meta = meta;

  async review(request: ReviewRequest): Promise<AgentResult> {
    return runJsonReview({
      agentId: 'principal',
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

export const principalAgent = new PrincipalAgent();
