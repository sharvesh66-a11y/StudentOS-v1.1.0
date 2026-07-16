/**
 * Agent 6 — Learning AI
 *
 * Does NOT check or block. Instead, ADDS educational enhancements:
 *   - Study tips
 *   - Memory tricks (mnemonics)
 *   - Revision points
 *   - Practice questions
 *   - Summary
 *
 * This agent always "passes" — it enriches rather than gates.
 *
 * SERVER-ONLY.
 */

import 'server-only';
import type { ReviewAgent, ReviewRequest, AgentResult } from '../types';
import { REVIEW_AGENTS } from '../types';
import { runJsonReview, buildReviewPrompt } from '../services/base-agent';
import { callLLM } from '../services/llm-helper';

const meta = REVIEW_AGENTS.find((a) => a.id === 'learning')!;

const SYSTEM_PROMPT = `You are the Learning AI in the StudentOS Review Engine.

Your job is to ENHANCE an AI-generated response with educational additions.

Add (as applicable):
1. Study tips — 1-2 practical tips for mastering the topic
2. Memory tricks — mnemonics or memory aids
3. Revision points — key bullet points for quick revision
4. Practice questions — 1-2 questions the student can test themselves with
5. Summary — a one-sentence summary

Your output should be the ENHANCED version of the response, with the additions
appended in a clearly structured format (use markdown headings).

Scoring:
- 90-100: Excellent enhancements — all 5 elements present and high quality
- 70-89: Good — most elements present
- 50-69: Fair — some elements missing or low quality
- 0-49: Poor — no meaningful enhancements

This agent ALWAYS passes (it enhances, doesn't gate).

Return JSON with:
{
  "score": <number>,
  "passed": true,
  "issues": [],
  "rewrittenContent": "<the enhanced response with additions>"
}`;

class LearningAgent implements ReviewAgent {
  meta = meta;
  canRewrite = true;

  async review(request: ReviewRequest): Promise<AgentResult> {
    // First, get the structured assessment
    const result = await runJsonReview({
      agentId: 'learning',
      agentName: meta.name,
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: buildReviewPrompt(request),
      fallback: {
        score: 75,
        passed: true,
        issues: [],
        rewrittenContent: request.aiResponse,
      },
    });

    // If the agent didn't produce enhanced content, generate it directly
    if (!result.rewrittenContent) {
      const enhancementPrompt = `You are a learning enhancer. Take the following response and append educational additions.

Original response:
${request.aiResponse}

Student's question:
${request.userMessage}

Append the following sections (use markdown):
## 📝 Study Tips
(1-2 practical tips)

## 🧠 Memory Trick
(A mnemonic or memory aid if applicable)

## ✅ Revision Points
- (3-4 key bullet points)

## ❓ Practice Question
(1 question with the answer in a collapsible format)

## 📌 One-Sentence Summary
(A concise summary)`;

      const enhanced = await callLLM({
        systemPrompt: 'You are an educational content enhancer. Be concise and helpful.',
        userPrompt: enhancementPrompt,
      });

      if (enhanced) {
        result.rewrittenContent = enhanced;
      } else {
        result.rewrittenContent = request.aiResponse;
      }
    }

    // Learning agent always passes
    result.passed = true;
    return result;
  }
}

export const learningAgent = new LearningAgent();
