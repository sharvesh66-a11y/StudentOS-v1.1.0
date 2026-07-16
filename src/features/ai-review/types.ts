/**
 * StudentOS AI Review Engine — Types
 *
 * Defines the contract for the multi-agent review pipeline that intercepts
 * every AI response before it reaches the student.
 *
 * Pipeline:
 *   Student → AI Provider → Review Engine (6 agents) → Approved Response → Student
 *
 * @see src/features/ai-review/services/review-engine.ts
 */

// ---------------------------------------------------------------------------
// Scores (0–100)
// ---------------------------------------------------------------------------

/** A score from 0 (worst) to 100 (best). */
export type Score = number;

/** Aggregate scores produced by the review engine. */
export interface ReviewScores {
  /** Overall quality of the response (Principal AI). */
  overallQuality: Score;
  /** Factual accuracy (Fact Verification AI). */
  accuracy: Score;
  /** Safety for children (Child Safety AI). */
  safety: Score;
  /** Child-friendliness — tone, reading level, appropriateness (Child Safety + Language). */
  childFriendly: Score;
  /** Alignment with board exam / syllabus standards (Teacher AI). */
  boardExam: Score;
  /** Confidence in the review verdict (aggregate). */
  confidence: Score;
}

// ---------------------------------------------------------------------------
// Verdicts
// ---------------------------------------------------------------------------

/** Whether a response passes or fails review. */
export type ReviewVerdict =
  | 'approved' // All checks passed — show as-is
  | 'approved-with-enhancements' // Passed, but Learning AI added tips/questions
  | 'rewritten' // Failed → auto-rewritten → approved
  | 'rejected'; // Failed → rewrite also failed → blocked entirely

// ---------------------------------------------------------------------------
// Agent results
// ---------------------------------------------------------------------------

/** Severity of an issue found by a review agent. */
export type IssueSeverity = 'info' | 'warning' | 'error' | 'critical';

/** An issue found by a review agent. */
export interface ReviewIssue {
  /** Which agent found the issue. */
  agent: AgentId;
  /** Severity level. */
  severity: IssueSeverity;
  /** Human-readable description. */
  description: string;
  /** Optional suggested fix. */
  suggestedFix?: string;
}

/** Result returned by a single review agent. */
export interface AgentResult {
  /** Agent identifier. */
  agentId: AgentId;
  /** Agent display name. */
  agentName: string;
  /** Whether this agent's check passed. */
  passed: boolean;
  /** Agent-specific score (0–100). */
  score: Score;
  /** Issues found (empty if passed). */
  issues: ReviewIssue[];
  /** Optional rewritten content (if the agent rewrote the response). */
  rewrittenContent?: string;
  /** Time taken in milliseconds. */
  durationMs: number;
}

// ---------------------------------------------------------------------------
// Agents
// ---------------------------------------------------------------------------

/** Identifiers for all review agents. */
export type AgentId =
  'principal' | 'teacher' | 'child-safety' | 'language' | 'fact-verification' | 'learning';

/** Metadata about a review agent. */
export interface ReviewAgentMeta {
  id: AgentId;
  name: string;
  description: string;
  /** The role this agent plays in the review pipeline. */
  role: string;
}

// ---------------------------------------------------------------------------
// Review request + result
// ---------------------------------------------------------------------------

/** Input to the review engine. */
export interface ReviewRequest {
  /** The original user question. */
  userMessage: string;
  /** The raw AI-generated response to review. */
  aiResponse: string;
  /** Which AI provider generated the response. */
  providerId: string;
  /** The student's grade level (for age-appropriateness). */
  studentGrade?: string;
  /** The subject context (for syllabus relevance). */
  subject?: string;
  /** Conversation history for context. */
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

/** Output of the review engine. */
export interface ReviewResult {
  /** Final verdict. */
  verdict: ReviewVerdict;
  /** The content to show the student (original, enhanced, or rewritten). */
  approvedContent: string;
  /** Original AI response (before review). */
  originalContent: string;
  /** Aggregate scores. */
  scores: ReviewScores;
  /** Per-agent results. */
  agentResults: AgentResult[];
  /** All issues found across all agents. */
  issues: ReviewIssue[];
  /** Whether the response was rewritten. */
  wasRewritten: boolean;
  /** Total review time in milliseconds. */
  totalDurationMs: number;
  /** Timestamp of the review. */
  reviewedAt: number;
}

// ---------------------------------------------------------------------------
// Agent interface (for the pluggable registry)
// ---------------------------------------------------------------------------

/**
 * Interface that every review agent must implement.
 *
 * Adding a new agent:
 *   1. Create a new file in `src/features/ai-review/agents/`
 *   2. Implement the `ReviewAgent` interface
 *   3. Register it in `src/features/ai-review/services/agent-registry.ts`
 *
 * No changes to the pipeline or engine are needed.
 */
export interface ReviewAgent {
  /** Agent metadata. */
  meta: ReviewAgentMeta;
  /** Run the review check. */
  review(request: ReviewRequest): Promise<AgentResult>;
  /** Whether this agent can rewrite content (e.g. Language, Child Safety). */
  canRewrite?: boolean;
}

// ---------------------------------------------------------------------------
// Agent registry
// ---------------------------------------------------------------------------

/** All registered review agents. */
export const REVIEW_AGENTS: ReviewAgentMeta[] = [
  {
    id: 'principal',
    name: 'Principal AI',
    description: 'Checks overall quality, accuracy, and completeness.',
    role: 'Quality Controller',
  },
  {
    id: 'teacher',
    name: 'Teacher AI',
    description: 'Checks educational correctness, syllabus relevance, and examples.',
    role: 'Educational Reviewer',
  },
  {
    id: 'child-safety',
    name: 'Child Safety AI',
    description: 'Checks age appropriateness, harmful content, violence, hate, self-harm.',
    role: 'Safety Coordinator',
  },
  {
    id: 'language',
    name: 'Language AI',
    description: 'Checks grammar, simplicity, reading level, and friendly tone.',
    role: 'Language Editor',
  },
  {
    id: 'fact-verification',
    name: 'Fact Verification AI',
    description: 'Checks for hallucinations, false information, and unsupported claims.',
    role: 'Fact Checker',
  },
  {
    id: 'learning',
    name: 'Learning AI',
    description: 'Adds tips, memory tricks, revision points, practice questions, and summary.',
    role: 'Learning Enhancer',
  },
] as const;
