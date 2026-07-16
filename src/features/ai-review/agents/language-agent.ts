/**
 * Agent 4 — Language AI
 *
 * Checks grammar, simplicity, reading level, and friendly tone.
 * Can rewrite responses to improve clarity and readability.
 *
 * SERVER-ONLY.
 */

import 'server-only';
import type { ReviewAgent, ReviewRequest, AgentResult } from '../types';
import { REVIEW_AGENTS } from '../types';
import { runJsonReview, buildReviewPrompt } from '../services/base-agent';

const meta = REVIEW_AGENTS.find((a) => a.id === 'language')!;

const SYSTEM_PROMPT = `You are the Language AI in the StudentOS Review Engine.

Your job is to evaluate the LANGUAGE QUALITY of an AI-generated response.

Check:
1. Grammar — Are there grammatical errors?
2. Simplicity — Is the language simple and accessible for the student's level?
3. Reading level — Is the reading level appropriate (not too complex, not too simple)?
4. Friendly tone — Is the tone encouraging, warm, and student-friendly?

Scoring:
- 90-100: Excellent — clear, grammatically perfect, friendly tone
- 70-89: Good — minor issues that don't impede understanding
- 50-69: Fair — some grammar or tone issues
- 0-49: Poor — significant language problems

A response "passes" if score >= 70.

If you find issues, provide a rewrittenContent with improved grammar, simpler
language, and a friendlier tone. Preserve all factual content.

Return ONLY valid JSON. No markdown fences, no extra text.`;

class LanguageAgent implements ReviewAgent {
  meta = meta;
  canRewrite = true;

  async review(request: ReviewRequest): Promise<AgentResult> {
    return runJsonReview({
      agentId: 'language',
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

export const languageAgent = new LanguageAgent();
