/**
 * StudentOS AI Review Engine
 *
 * Multi-agent review pipeline that intercepts every AI response before it
 * reaches the student. StudentOS becomes the Principal, Teacher, Parent,
 * and Safety Coordinator.
 *
 * Pipeline:
 *   Student → AI Provider → Review Engine (6 agents) → Approved Response → Student
 *
 * Agents:
 *   1. Principal AI — overall quality, accuracy, completeness
 *   2. Teacher AI — educational correctness, syllabus relevance, examples
 *   3. Child Safety AI — age appropriateness, harmful content screening
 *   4. Language AI — grammar, simplicity, reading level, tone
 *   5. Fact Verification AI — hallucinations, false info, contradictions
 *   6. Learning AI — adds tips, memory tricks, revision points, practice Qs
 *
 * Adding a new agent:
 *   1. Create agent in src/features/ai-review/agents/
 *   2. Implement the ReviewAgent interface
 *   3. Register in src/features/ai-review/services/agent-registry.ts
 *   4. Add metadata to REVIEW_AGENTS in types.ts
 *   No pipeline changes needed.
 *
 * @see src/features/ai-review/services/review-engine.ts
 */

// Engine
export { reviewResponse, quickReview } from './services/review-engine';

// Registry
export {
  getRegisteredAgents,
  getAgent,
  getRewritingAgents,
  getGatingAgents,
} from './services/agent-registry';

// Agents
export {
  principalAgent,
  teacherAgent,
  childSafetyAgent,
  languageAgent,
  factVerificationAgent,
  learningAgent,
} from './agents';

// Types
export type {
  Score,
  ReviewScores,
  ReviewVerdict,
  IssueSeverity,
  ReviewIssue,
  AgentResult,
  AgentId,
  ReviewAgentMeta,
  ReviewRequest,
  ReviewResult,
  ReviewAgent,
} from './types';
export { REVIEW_AGENTS } from './types';
