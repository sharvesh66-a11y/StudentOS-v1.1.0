/**
 * StudentOS AI Review Engine — Agent Registry
 *
 * Pluggable registry of all review agents. Adding a new agent:
 *   1. Create the agent in `src/features/ai-review/agents/`
 *   2. Import it here and add to the `registeredAgents` array
 *   3. Add the agent metadata to `REVIEW_AGENTS` in types.ts
 *
 * The pipeline and engine do NOT need any changes.
 *
 * SERVER-ONLY.
 */

import 'server-only';
import type { ReviewAgent, AgentId } from '../types';
import { principalAgent } from '../agents/principal-agent';
import { teacherAgent } from '../agents/teacher-agent';
import { childSafetyAgent } from '../agents/child-safety-agent';
import { languageAgent } from '../agents/language-agent';
import { factVerificationAgent } from '../agents/fact-verification-agent';
import { learningAgent } from '../agents/learning-agent';

/**
 * All registered review agents.
 *
 * Order matters for the "rewrite" phase: agents that can rewrite
 * (child-safety, language, learning) are applied in this order.
 */
const registeredAgents: ReviewAgent[] = [
  principalAgent,
  teacherAgent,
  childSafetyAgent,
  languageAgent,
  factVerificationAgent,
  learningAgent,
];

/** Map of agent ID → agent instance, for quick lookup. */
const agentMap = new Map<AgentId, ReviewAgent>(
  registeredAgents.map((agent) => [agent.meta.id, agent]),
);

/** Get all registered agents. */
export function getRegisteredAgents(): ReviewAgent[] {
  return registeredAgents;
}

/** Get a specific agent by ID. */
export function getAgent(id: AgentId): ReviewAgent | undefined {
  return agentMap.get(id);
}

/** Get the IDs of agents that can rewrite content. */
export function getRewritingAgents(): ReviewAgent[] {
  return registeredAgents.filter((agent) => agent.canRewrite === true);
}

/** Get the IDs of gating agents (all except 'learning'). */
export function getGatingAgents(): ReviewAgent[] {
  return registeredAgents.filter((agent) => agent.meta.id !== 'learning');
}
