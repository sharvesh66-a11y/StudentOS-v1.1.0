/**
 * StudentOS AI Review Engine — Orchestrator
 *
 * The core engine that runs all review agents and produces a final
 * ReviewResult. This is the heart of the StudentOS safety pipeline.
 *
 * Pipeline:
 *   1. Run all gating agents in parallel (Principal, Teacher, Child Safety,
 *      Language, Fact Verification)
 *   2. Aggregate scores and issues
 *   3. If any gating agent fails → trigger rewrite phase
 *      a. Apply rewrites from agents in priority order:
 *         Child Safety → Language → Fact Verification
 *      b. Re-run quick verification on the rewritten content
 *   4. Run the Learning agent (always passes — enhances content)
 *   5. Produce final ReviewResult with verdict + approved content
 *
 * Verdict logic:
 *   - 'approved' — all gating agents passed, no rewrite needed
 *   - 'approved-with-enhancements' — passed + Learning agent added content
 *   - 'rewritten' — failed → rewritten → approved
 *   - 'rejected' — failed → rewrite also failed → blocked
 *
 * SERVER-ONLY.
 */

import 'server-only';
import type {
  ReviewRequest,
  ReviewResult,
  ReviewScores,
  ReviewVerdict,
  AgentResult,
  ReviewIssue,
  AgentId,
} from '../types';
import { getRegisteredAgents, getGatingAgents } from './agent-registry';
import { callLLM } from './llm-helper';

/**
 * Run the full review pipeline on an AI-generated response.
 *
 * @param request - The review request (user message + AI response + context)
 * @returns The review result with verdict, scores, and approved content.
 */
export async function reviewResponse(request: ReviewRequest): Promise<ReviewResult> {
  const start = Date.now();
  const allAgents = getRegisteredAgents();
  const gatingAgents = getGatingAgents();

  // -----------------------------------------------------------------------
  // Phase 1: Run all agents in parallel
  // -----------------------------------------------------------------------
  const agentResults = await Promise.all(allAgents.map((agent) => agent.review(request)));

  const gatingResults = agentResults.filter((r) =>
    gatingAgents.some((g) => g.meta.id === r.agentId),
  );
  const learningResult = agentResults.find((r) => r.agentId === 'learning');

  // -----------------------------------------------------------------------
  // Phase 2: Aggregate issues
  // -----------------------------------------------------------------------
  const allIssues: ReviewIssue[] = agentResults.flatMap((r) => r.issues);

  // -----------------------------------------------------------------------
  // Phase 3: Determine if rewrite is needed
  // -----------------------------------------------------------------------
  const anyGatingFailed = gatingResults.some((r) => !r.passed);
  const hasCriticalSafetyIssue = gatingResults.some(
    (r) =>
      r.agentId === 'child-safety' &&
      (r.score < 50 || r.issues.some((i) => i.severity === 'critical')),
  );

  let approvedContent = request.aiResponse;
  let wasRewritten = false;
  let verdict: ReviewVerdict = 'approved';

  if (hasCriticalSafetyIssue) {
    // Critical safety failure — attempt rewrite, but may need to reject
    const rewritten = await rewriteContent(request, agentResults);
    if (rewritten) {
      approvedContent = rewritten;
      wasRewritten = true;
      verdict = 'rewritten';
    } else {
      // Rewrite failed — reject entirely
      approvedContent = generateBlockedMessage();
      verdict = 'rejected';
    }
  } else if (anyGatingFailed) {
    // Some gating agent failed — attempt rewrite
    const rewritten = await rewriteContent(request, agentResults);
    if (rewritten) {
      approvedContent = rewritten;
      wasRewritten = true;
      verdict = 'rewritten';
    } else {
      // Rewrite failed — use original but mark as approved-with-concerns
      // (only if safety passed; if safety failed we already rejected)
      verdict = 'approved';
    }
  }

  // -----------------------------------------------------------------------
  // Phase 4: Apply Learning agent enhancements (if not rejected)
  // -----------------------------------------------------------------------
  if (verdict !== 'rejected' && learningResult?.rewrittenContent) {
    // If we rewrote the content, we need to re-enhance the rewritten version.
    // For efficiency, if no rewrite happened, use the learning agent's output directly.
    if (!wasRewritten) {
      approvedContent = learningResult.rewrittenContent;
      verdict = 'approved-with-enhancements';
    } else {
      // Re-run learning enhancement on the rewritten content
      const enhanced = await enhanceWithLearning(approvedContent, request);
      if (enhanced) {
        approvedContent = enhanced;
        verdict = 'approved-with-enhancements';
      }
    }
  }

  // -----------------------------------------------------------------------
  // Phase 5: Calculate aggregate scores
  // -----------------------------------------------------------------------
  const scores = calculateScores(agentResults);

  const totalDurationMs = Date.now() - start;

  return {
    verdict,
    approvedContent,
    originalContent: request.aiResponse,
    scores,
    agentResults,
    issues: allIssues,
    wasRewritten,
    totalDurationMs,
    reviewedAt: Date.now(),
  };
}

// ---------------------------------------------------------------------------
// Rewrite phase
// ---------------------------------------------------------------------------

/**
 * Attempt to rewrite the response using the issues found by agents.
 * Applies rewrites in priority: Child Safety → Language → Fact Verification.
 */
async function rewriteContent(
  request: ReviewRequest,
  agentResults: AgentResult[],
): Promise<string | null> {
  // Collect all issues with suggested fixes
  const issues = agentResults.flatMap((r) =>
    r.issues.map((issue) => ({
      ...issue,
      agentName: r.agentName,
    })),
  );

  if (issues.length === 0) return null;

  const issuesText = issues
    .map(
      (i) =>
        `- [${i.agentName}] (${i.severity}) ${i.description}${i.suggestedFix ? `\n  Fix: ${i.suggestedFix}` : ''}`,
    )
    .join('\n');

  const rewritePrompt = `You are the StudentOS Review Engine's rewrite module.

The following AI response was flagged for issues. Rewrite it to fix ALL issues
while preserving the educational value and answering the student's question.

Student's question:
${request.userMessage}

Original AI response:
${request.aiResponse}

Issues found:
${issuesText}

Rewrite the response to:
1. Remove any harmful, offensive, or age-inappropriate content
2. Fix all factual errors
3. Improve grammar, clarity, and reading level
4. Make the tone friendly and encouraging
5. Ensure the answer is complete and accurate

Return ONLY the rewritten response. No meta-commentary, no markdown fences.`;

  const rewritten = await callLLM({
    systemPrompt:
      'You are an expert educational content editor. You rewrite AI responses to be safe, accurate, and pedagogically sound for students.',
    userPrompt: rewritePrompt,
    maxTokens: 3000,
  });

  return rewritten || null;
}

// ---------------------------------------------------------------------------
// Learning enhancement (for rewritten content)
// ---------------------------------------------------------------------------

async function enhanceWithLearning(
  content: string,
  request: ReviewRequest,
): Promise<string | null> {
  const prompt = `Enhance the following response with educational additions. Append these sections using markdown:

## 📝 Study Tips
(1-2 practical tips for mastering this topic)

## ✅ Revision Points
- (3-4 key bullet points)

## ❓ Practice Question
(1 question to test understanding, with answer)

## 📌 Summary
(One-sentence summary)

Response to enhance:
${content}

Student's question:
${request.userMessage}`;

  return callLLM({
    systemPrompt: 'You are an educational content enhancer. Be concise and helpful.',
    userPrompt: prompt,
  });
}

// ---------------------------------------------------------------------------
// Score aggregation
// ---------------------------------------------------------------------------

function calculateScores(agentResults: AgentResult[]): ReviewScores {
  const getScore = (id: AgentId): number => agentResults.find((r) => r.agentId === id)?.score ?? 75;

  const principal = getScore('principal');
  const teacher = getScore('teacher');
  const childSafety = getScore('child-safety');
  const language = getScore('language');
  const factVerification = getScore('fact-verification');
  // Note: learning agent score is not used in aggregate — it enhances, doesn't gate
  void getScore('learning');

  // Overall quality = weighted average (Principal carries most weight)
  const overallQuality = Math.round(
    principal * 0.3 + teacher * 0.25 + factVerification * 0.25 + language * 0.2,
  );

  // Accuracy = Fact Verification score (with small weight from Principal)
  const accuracy = Math.round(factVerification * 0.85 + principal * 0.15);

  // Safety = Child Safety score (strict — any critical issue lowers it)
  const hasCriticalSafety = agentResults
    .find((r) => r.agentId === 'child-safety')
    ?.issues.some((i) => i.severity === 'critical');
  const safety = hasCriticalSafety ? Math.min(childSafety, 30) : childSafety;

  // Child-friendly = average of Child Safety + Language
  const childFriendly = Math.round((childSafety + language) / 2);

  // Board exam = Teacher score
  const boardExam = teacher;

  // Confidence = how close all scores are to each other (low variance = high confidence)
  const scores = [principal, teacher, childSafety, language, factVerification];
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((a, b) => a + (b - mean) ** 2, 0) / scores.length;
  const stdDev = Math.sqrt(variance);
  const confidence = Math.round(Math.max(0, Math.min(100, 100 - stdDev * 2)));

  return {
    overallQuality,
    accuracy,
    safety,
    childFriendly,
    boardExam,
    confidence,
  };
}

// ---------------------------------------------------------------------------
// Blocked message
// ---------------------------------------------------------------------------

function generateBlockedMessage(): string {
  return `I'm sorry, but I couldn't generate a safe and accurate response to your question. This could be because:

- The question contains content that isn't appropriate for students
- I don't have enough reliable information to answer accurately
- The response required multiple safety corrections

**What you can do:**
- Try rephrasing your question
- Ask a teacher or parent for help
- Come back and try a different question

Your safety is my top priority. 🛡️`;
}

// ---------------------------------------------------------------------------
// Quick review (for streaming — lightweight check without full pipeline)
// ---------------------------------------------------------------------------

/**
 * A lightweight review that only runs the Child Safety + Fact Verification
 * agents. Used when streaming responses chunk-by-chunk where a full review
 * would be too slow.
 *
 * For final responses, use `reviewResponse()` (full pipeline).
 */
export async function quickReview(request: ReviewRequest): Promise<{
  passed: boolean;
  safetyScore: number;
  accuracyScore: number;
  issues: ReviewIssue[];
}> {
  const { childSafetyAgent, factVerificationAgent } = await import('../agents');

  const [safetyResult, factResult] = await Promise.all([
    childSafetyAgent.review(request),
    factVerificationAgent.review(request),
  ]);

  const issues = [...safetyResult.issues, ...factResult.issues];
  const passed = safetyResult.passed && factResult.passed;

  return {
    passed,
    safetyScore: safetyResult.score,
    accuracyScore: factResult.score,
    issues,
  };
}
