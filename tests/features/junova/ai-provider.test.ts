/**
 * Unit tests for the AI Provider Registry.
 *
 * The registry is server-only (`import 'server-only'`) and uses the
 * `z-ai-web-dev-sdk`. Both are mocked — the registry logic itself is
 * what we're verifying:
 *   - The default ZAI provider is registered
 *   - getProvider() returns the requested provider and falls back to ZAI
 *   - registerProvider() lets a caller replace / add providers
 *   - listProviders() returns every registered id
 *   - Stub providers throw a friendly "not configured" error
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// --- Mocks --------------------------------------------------------------

// `server-only` is a Next.js marker that throws when imported on the client.
// Mock it so the registry module can load inside the test runner.
vi.mock('server-only', () => ({}));

// Mock the z-ai-web-dev-sdk so the ZAIProvider class can be instantiated
// without real credentials. We expose a `createMock` reference so tests
// can re-configure the per-call mock between cases.
const sdkMock = vi.hoisted(() => {
  const createChatCompletion = vi.fn().mockResolvedValue({
    choices: [{ message: { content: 'mocked-response' } }],
  });
  const instance = {
    chat: { completions: { create: createChatCompletion } },
  };
  const create = vi.fn().mockResolvedValue(instance);
  return { create, createChatCompletion, instance };
});

vi.mock('z-ai-web-dev-sdk', () => ({ default: sdkMock }));

// Import AFTER mocks are registered.
import {
  getProvider,
  registerProvider,
  listProviders,
  type AIProvider,
} from '@/features/junova/services/ai-provider-registry';
import type { AIProviderType } from '@/features/tools/types';

// --- Tests ---------------------------------------------------------------

describe('AI Provider Registry', () => {
  it('exposes the default ZAI provider when called with no args', () => {
    const p = getProvider();
    expect(p.id).toBe('zai');
    expect(p.name).toBe('Junova (GLM)');
  });

  it('returns the ZAI provider when "zai" is requested', () => {
    expect(getProvider('zai').id).toBe('zai');
  });

  it('falls back to ZAI when an unknown provider type is requested', () => {
    // 'unknown' isn't in the registry — should fall back to zai.
    const p = getProvider('unknown' as AIProviderType);
    expect(p.id).toBe('zai');
  });

  it('listProviders() includes the default ZAI provider and all stub providers', () => {
    const list = listProviders();
    expect(list).toContain('zai');
    expect(list).toContain('openai');
    expect(list).toContain('gemini');
    expect(list).toContain('claude');
    expect(list).toContain('grok');
    expect(list).toContain('deepseek');
    expect(list).toContain('glm');
    expect(list).toContain('local');
    expect(list.length).toBeGreaterThanOrEqual(8);
  });

  it('stub providers (openai, gemini, claude, etc.) throw a "not configured" error', async () => {
    const stub = getProvider('openai');
    expect(stub.id).toBe('openai');
    await expect(stub.chat([])).rejects.toThrow(/not yet configured/);
    await expect(stub.json('prompt')).rejects.toThrow(/not yet configured/);
  });

  it('registerProvider() lets callers add a new provider type', () => {
    const custom: AIProvider = {
      id: 'custom-test' as AIProviderType,
      name: 'Custom Test Provider',
      chat: vi.fn().mockResolvedValue('custom-response'),
      json: vi.fn().mockResolvedValue({ ok: true }),
    };

    registerProvider(custom);

    expect(listProviders()).toContain('custom-test');
    expect(getProvider('custom-test' as AIProviderType)).toBe(custom);
  });

  it('registerProvider() lets callers replace an existing provider', () => {
    const replacement: AIProvider = {
      id: 'local',
      name: 'Replaced Local',
      chat: vi.fn().mockResolvedValue('local-response'),
      json: vi.fn().mockResolvedValue({ local: true }),
    };

    registerProvider(replacement);

    const p = getProvider('local');
    expect(p.name).toBe('Replaced Local');
    expect(p).toBe(replacement);
  });
});

describe('ZAIProvider (default provider) integration', () => {
  beforeEach(() => {
    sdkMock.createChatCompletion.mockClear();
    sdkMock.create.mockClear();
  });

  it('chat() returns the SDK response content', async () => {
    const p = getProvider('zai');
    const result = await p.chat([{ role: 'user', content: 'Hi' }]);
    expect(result).toBe('mocked-response');
  });

  it('chat() prepends the system prompt as an assistant message when provided', async () => {
    const p = getProvider('zai');
    await p.chat([{ role: 'user', content: 'Hello' }], 'SYSTEM-PROMPT');

    expect(sdkMock.createChatCompletion).toHaveBeenCalledTimes(1);
    const call = sdkMock.createChatCompletion.mock.calls[0][0];
    // The implementation prepends the system prompt as the first message.
    expect(call.messages[0]).toMatchObject({
      role: 'assistant',
      content: 'SYSTEM-PROMPT',
    });
    expect(call.messages[1]).toMatchObject({
      role: 'user',
      content: 'Hello',
    });
  });

  it('json() extracts JSON from the chat response', async () => {
    sdkMock.createChatCompletion.mockResolvedValueOnce({
      choices: [{ message: { content: 'Here is your data: {"answer":42, "ok":true} — enjoy.' } }],
    });

    const p = getProvider('zai');
    const result = await p.json('What is the answer?');

    expect(result).toEqual({ answer: 42, ok: true });
  });

  it('json() throws when no JSON object is found in the response', async () => {
    sdkMock.createChatCompletion.mockResolvedValueOnce({
      choices: [{ message: { content: 'I cannot help with that.' } }],
    });

    const p = getProvider('zai');
    await expect(p.json('prompt')).rejects.toThrow(/No JSON found/);
  });
});
