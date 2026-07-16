/**
 * StudentOS AI Provider Registry
 *
 * Pluggable architecture for multiple AI providers. Each provider implements
 * the same interface — adding or switching providers requires no changes to
 * the rest of the application.
 *
 * Currently only the ZAI (GLM) provider is wired to the SDK. Other providers
 * are architecturally ready — just need their SDK wiring when credentials
 * are available.
 *
 * SERVER-ONLY.
 */

import 'server-only';
import ZAI from 'z-ai-web-dev-sdk';
import type { AIProviderType } from '../../tools/types';

// ---------------------------------------------------------------------------
// Provider interface
// ---------------------------------------------------------------------------

export interface AIProvider {
  id: AIProviderType;
  name: string;
  /** Generate a chat completion. */
  chat(
    messages: { role: 'user' | 'assistant'; content: string }[],
    systemPrompt?: string,
  ): Promise<string>;
  /** Generate a structured JSON response. */
  json(prompt: string, systemPrompt?: string): Promise<Record<string, unknown>>;
}

// ---------------------------------------------------------------------------
// ZAI Provider (default — uses z-ai-web-dev-sdk)
// ---------------------------------------------------------------------------

class ZAIProvider implements AIProvider {
  id: AIProviderType = 'zai';
  name = 'Junova (GLM)';
  private zai: Awaited<ReturnType<typeof ZAI.create>> | null = null;

  private async getZAI() {
    if (!this.zai) this.zai = await ZAI.create();
    return this.zai;
  }

  async chat(
    messages: { role: 'user' | 'assistant'; content: string }[],
    systemPrompt?: string,
  ): Promise<string> {
    const zai = await this.getZAI();
    const fullMessages = systemPrompt
      ? [{ role: 'assistant' as const, content: systemPrompt }, ...messages]
      : messages;
    const completion = await zai.chat.completions.create({
      messages: fullMessages,
      thinking: { type: 'disabled' },
    });
    return completion.choices[0]?.message?.content ?? '';
  }

  async json(prompt: string, systemPrompt?: string): Promise<Record<string, unknown>> {
    const text = await this.chat(
      [{ role: 'user', content: prompt }],
      systemPrompt ?? 'Return ONLY valid JSON. No markdown, no code fences.',
    );
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON found in response');
    return JSON.parse(match[0]);
  }
}

// ---------------------------------------------------------------------------
// Stub providers (architecturally ready — wire SDK when credentials available)
// ---------------------------------------------------------------------------

class StubProvider implements AIProvider {
  constructor(
    public id: AIProviderType,
    public name: string,
  ) {}
  async chat(): Promise<string> {
    throw new Error(`${this.name} provider not yet configured. Add API credentials to enable.`);
  }
  async json(): Promise<Record<string, unknown>> {
    throw new Error(`${this.name} provider not yet configured.`);
  }
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

const providers: Map<AIProviderType, AIProvider> = new Map();

function initRegistry() {
  providers.set('zai', new ZAIProvider());
  providers.set('openai', new StubProvider('openai', 'OpenAI GPT-4'));
  providers.set('gemini', new StubProvider('gemini', 'Google Gemini'));
  providers.set('claude', new StubProvider('claude', 'Anthropic Claude'));
  providers.set('grok', new StubProvider('grok', 'xAI Grok'));
  providers.set('deepseek', new StubProvider('deepseek', 'DeepSeek'));
  providers.set('glm', new StubProvider('glm', 'GLM-4'));
  providers.set('local', new StubProvider('local', 'Local Model'));
}

initRegistry();

/** Get a provider by type. Falls back to ZAI (default). */
export function getProvider(type: AIProviderType = 'zai'): AIProvider {
  return providers.get(type) ?? providers.get('zai')!;
}

/** Register a custom provider (for future SDK wiring). */
export function registerProvider(provider: AIProvider): void {
  providers.set(provider.id, provider);
}

/** List all available provider types. */
export function listProviders(): AIProviderType[] {
  return Array.from(providers.keys());
}
