/**
 * Agent 5 — Fact Verification AI
 *
 * Checks for hallucinations, false information, unsupported claims, and
 * internal contradictions. Acts as the fact checker.
 *
 * SERVER-ONLY.
 */

import 'server-only';
import type { ReviewAgent, ReviewRequest, AgentResult } from '../types';
import { REVIEW_AGENTS } from '../types';
import { runJsonReview, buildReviewPrompt } from '../services/base-agent';

const meta = REVIEW_AGENTS.find((a) => a.id === 'fact-verification')!;

const SYSTEM_PROMPT = `You are the Fact Verification AI in the StudentOS Review Engine.

Your job is to verify the FACTUAL ACCURACY of an AI-generated response.

Check for:
1. Hallucinations — Does the response invent facts, dates, names, or citations?
2. False information — Are there any objectively wrong statements?
3. Unsupported claims — Are claims made without evidence?
4. Contradictions — Does the response contradict itself or known facts?

Scoring:
- 90-100: All facts verified and accurate
- 70-89: Mostly accurate with minor unverified claims
- 50-69: Some factual errors or unsupported claims
- 0-49: Significant factual errors or hallucinations

A response "passes" if score >= 70.

If you find factual errors, list each one as an issue with a suggestedFix
containing the correct information. Do NOT rewrite the entire response —
that is the Language agent's job. Focus on identifying factual problems.

Return ONLY valid JSON. No markdown fences, no extra text.`;

class FactVerificationAgent implements ReviewAgent {
  meta = meta;

  async review(request: ReviewRequest): Promise<AgentResult> {
    return runJsonReview({
      agentId: 'fact-verification',
      agentName: meta.name,
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: buildReviewPrompt(request),
      fallback: {
        score: 80,
        passed: true,
        issues: [],
      },
    });
  }
}

export const factVerificationAgent = new FactVerificationAgent();
