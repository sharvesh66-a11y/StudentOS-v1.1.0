/**
 * StudentOS AI Review Engine — Base Agent Helper
 *
 * Shared utilities for all review agents: timing, score calculation,
 * issue creation, and JSON-based review execution.
 */

import 'server-only';
import type { AgentId, AgentResult, IssueSeverity, ReviewIssue } from '../types';
import { callLLMJson } from './llm-helper';

export interface BaseReviewOutput {
  /** Agent-specific score (0–100). */
  score: number;
  /** Whether the check passed (typically score >= 70). */
  passed: boolean;
  /** Issues found. */
  issues: Array<{
    severity: IssueSeverity;
    description: string;
    suggestedFix?: string;
  }>;
  /** Optional rewritten content. */
  rewrittenContent?: string;
}

/**
 * Run a JSON-based review using a system prompt that instructs the LLM to
 * return a structured result. Handles timing, error recovery, and fallback.
 */
export async function runJsonReview<T extends BaseReviewOutput>(params: {
  agentId: AgentId;
  agentName: string;
  systemPrompt: string;
  userPrompt: string;
  fallback: T;
}): Promise<AgentResult> {
  const start = Date.now();

  let output: T | null = null;
  try {
    output = await callLLMJson<T>({
      systemPrompt: params.systemPrompt,
      userPrompt: params.userPrompt,
    });
  } catch (error) {
    console.error(`[ai-review] Agent ${params.agentId} failed:`, error);
  }

  const result = output ?? params.fallback;
  const durationMs = Date.now() - start;

  const issues: ReviewIssue[] = result.issues.map((issue) => ({
    agent: params.agentId,
    severity: issue.severity,
    description: issue.description,
    suggestedFix: issue.suggestedFix,
  }));

  return {
    agentId: params.agentId,
    agentName: params.agentName,
    passed: result.passed,
    score: Math.max(0, Math.min(100, result.score)),
    issues,
    rewrittenContent: result.rewrittenContent,
    durationMs,
  };
}

/** Create the user prompt for a review agent — includes context + the response. */
export function buildReviewPrompt(params: {
  userMessage: string;
  aiResponse: string;
  studentGrade?: string;
  subject?: string;
}): string {
  const grade = params.studentGrade ? `Student grade level: ${params.studentGrade}\n` : '';
  const subject = params.subject ? `Subject: ${params.subject}\n` : '';
  return `${grade}${subject}
--- Student's Question ---
${params.userMessage}

--- AI Response to Review ---
${params.aiResponse}

---
Review the above AI response according to your role. Return a JSON object with this exact shape:
{
  "score": <number 0-100>,
  "passed": <boolean>,
  "issues": [
    { "severity": "info"|"warning"|"error"|"critical", "description": "<string>", "suggestedFix": "<optional string>" }
  ],
  "rewrittenContent": "<optional — only if you rewrote the response>"
}`;
}
