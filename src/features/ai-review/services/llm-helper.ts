/**
 * StudentOS AI Review Engine — LLM Helper
 *
 * Shared utility for review agents to call the AI provider. All review
 * agents use the default ZAI (GLM) provider for consistency — the review
 * engine should NOT use the same provider that generated the original
 * response (to avoid bias). In production, this could point to a different
 * provider for independent verification.
 *
 * SERVER-ONLY.
 */

import 'server-only';
import ZAI from 'z-ai-web-dev-sdk';

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

export interface LLMCallParams {
  systemPrompt: string;
  userPrompt: string;
  /** Max tokens for the response. Default: 2000. */
  maxTokens?: number;
}

/**
 * Call the LLM with a system + user prompt and return the text response.
 * Falls back to a deterministic response if the SDK is unavailable.
 */
export async function callLLM({ systemPrompt, userPrompt }: LLMCallParams): Promise<string> {
  try {
    const zai = await getZAI();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      thinking: { type: 'disabled' },
    });
    return completion.choices[0]?.message?.content ?? '';
  } catch (error) {
    console.error('[ai-review] LLM call failed:', error);
    return '';
  }
}

/**
 * Call the LLM and parse the response as JSON.
 * If parsing fails, returns null.
 */
export async function callLLMJson<T = Record<string, unknown>>(
  params: LLMCallParams,
): Promise<T | null> {
  const text = await callLLM(params);
  if (!text) return null;

  // Try to extract JSON from the response (handles ```json fences)
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : text.trim();

  try {
    return JSON.parse(jsonStr) as T;
  } catch {
    // Try to find the first { ... } block
    const braceMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (braceMatch) {
      try {
        return JSON.parse(braceMatch[0]) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}
