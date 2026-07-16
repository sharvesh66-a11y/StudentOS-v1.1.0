/**
 * StudentOS AI Provider Configuration
 *
 * Single source of truth for all AI providers supported by StudentOS.
 * Adding a new provider requires ONLY editing this file — no other code
 * changes needed.
 *
 * Categories:
 *   - free:    Free providers (open-source models, free tiers, local models)
 *   - premium: Paid providers (require API key + billing)
 *
 * Status:
 *   - available: Ready to connect (free providers)
 *   - coming-soon: Architecture exists, API not wired yet (premium providers)
 *
 * @see src/features/providers/components/providers-view.tsx
 */

export type ProviderCategory = 'free' | 'premium';
export type ProviderStatus = 'available' | 'coming-soon' | 'connected';

export interface AIProvider {
  /** Unique identifier (kebab-case). */
  id: string;
  /** Display name. */
  name: string;
  /** Provider category. */
  category: ProviderCategory;
  /** Current status. */
  status: ProviderStatus;
  /** Short description. */
  description: string;
  /** Logo URL (or null to use initials). */
  logoUrl: string | null;
  /** Brand color (hex) for the logo background fallback. */
  brandColor: string;
  /** Provider website URL. */
  website: string;
  /** Whether the user needs to provide an API key. */
  requiresApiKey: boolean;
  /** Where to get the API key (URL). */
  apiKeyUrl?: string;
  /** Models supported (for display). */
  models: string[];
  /** Sprint when this provider was added. */
  addedIn: string;
}

/**
 * FREE AI Providers — available now, no payment required.
 */
export const FREE_PROVIDERS: AIProvider[] = [
  {
    id: 'deepseek',
    name: 'DeepSeek',
    category: 'free',
    status: 'available',
    description: 'Open-source models with strong reasoning. Free API tier available.',
    logoUrl: null,
    brandColor: '#4D6BFE',
    website: 'https://deepseek.com',
    requiresApiKey: true,
    apiKeyUrl: 'https://platform.deepseek.com/api_keys',
    models: ['DeepSeek-V3', 'DeepSeek-R1', 'DeepSeek-Coder'],
    addedIn: 'v1.1',
  },
  {
    id: 'gemini-free',
    name: 'Gemini Free',
    category: 'free',
    status: 'available',
    description: 'Google Gemini free tier. Great for general tasks and multimodal input.',
    logoUrl: null,
    brandColor: '#4285F4',
    website: 'https://ai.google.dev',
    requiresApiKey: true,
    apiKeyUrl: 'https://aistudio.google.com/app/apikey',
    models: ['gemini-1.5-flash', 'gemini-1.5-pro (limited)'],
    addedIn: 'v1.1',
  },
  {
    id: 'qwen',
    name: 'Qwen',
    category: 'free',
    status: 'available',
    description: 'Alibaba Qwen models. Strong multilingual support.',
    logoUrl: null,
    brandColor: '#615CED',
    website: 'https://qwenlm.ai',
    requiresApiKey: true,
    apiKeyUrl: 'https://platform.qwenlm.ai/api-keys',
    models: ['Qwen2.5-72B', 'Qwen2.5-Coder', 'Qwen2-VL'],
    addedIn: 'v1.1',
  },
  {
    id: 'glm',
    name: 'GLM',
    category: 'free',
    status: 'available',
    description: 'Zhipu AI GLM models. Excellent for Chinese + English tasks.',
    logoUrl: null,
    brandColor: '#1A6DFF',
    website: 'https://open.bigmodel.cn',
    requiresApiKey: true,
    apiKeyUrl: 'https://open.bigmodel.cn/usercenter/apikeys',
    models: ['GLM-4', 'GLM-4V', 'GLM-4-Flash'],
    addedIn: 'v1.1',
  },
  {
    id: 'openrouter-free',
    name: 'OpenRouter Free',
    category: 'free',
    status: 'available',
    description: 'Access free models from OpenRouter. Multiple providers in one API.',
    logoUrl: null,
    brandColor: '#6366F1',
    website: 'https://openrouter.ai',
    requiresApiKey: true,
    apiKeyUrl: 'https://openrouter.ai/keys',
    models: ['Llama 3.1 8B', 'Mistral 7B', 'Gemini Flash (free)'],
    addedIn: 'v1.1',
  },
  {
    id: 'huggingface',
    name: 'HuggingFace Inference',
    category: 'free',
    status: 'available',
    description: 'Free inference API for 100,000+ open-source models on Hugging Face Hub.',
    logoUrl: null,
    brandColor: '#FFD21E',
    website: 'https://huggingface.co',
    requiresApiKey: true,
    apiKeyUrl: 'https://huggingface.co/settings/tokens',
    models: ['Llama 3.1 70B', 'Mixtral 8x7B', 'Phi-3', 'Qwen2 72B'],
    addedIn: 'v1.2',
  },
  {
    id: 'groq',
    name: 'Groq',
    category: 'free',
    status: 'available',
    description:
      'Ultra-fast inference for open-source models. Free tier with generous rate limits.',
    logoUrl: null,
    brandColor: '#F55036',
    website: 'https://groq.com',
    requiresApiKey: true,
    apiKeyUrl: 'https://console.groq.com/keys',
    models: ['Llama 3.1 70B', 'Llama 3.1 8B', 'Mixtral 8x7B', 'Gemma 2 9B'],
    addedIn: 'v1.3',
  },
  {
    id: 'custom-api',
    name: 'Custom API',
    category: 'free',
    status: 'available',
    description:
      'Connect any OpenAI-compatible API endpoint. Supports local, self-hosted, or third-party providers.',
    logoUrl: null,
    brandColor: '#6366F1',
    website: '#',
    requiresApiKey: false,
    models: ['Any OpenAI-compatible model'],
    addedIn: 'v1.3',
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    category: 'free',
    status: 'coming-soon',
    description:
      'Run models locally on your machine. No internet required. Integration in progress.',
    logoUrl: null,
    brandColor: '#000000',
    website: 'https://ollama.ai',
    requiresApiKey: false,
    models: ['Llama 3.1', 'Mistral', 'Phi-3', 'Gemma 2'],
    addedIn: 'v1.1',
  },
  {
    id: 'lm-studio',
    name: 'LM Studio',
    category: 'free',
    status: 'coming-soon',
    description: 'Local model runner with OpenAI-compatible API. Integration in progress.',
    logoUrl: null,
    brandColor: '#00D9FF',
    website: 'https://lmstudio.ai',
    requiresApiKey: false,
    models: ['Any GGML/GGUF model'],
    addedIn: 'v1.1',
  },
];

/**
 * PREMIUM AI Providers — architecture exists, paid APIs not wired yet.
 * Users can see them but cannot connect (Coming Soon badge).
 */
export const PREMIUM_PROVIDERS: AIProvider[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    category: 'premium',
    status: 'coming-soon',
    description: 'OpenAI GPT-4o, GPT-4 Turbo, and GPT-3.5. The industry standard.',
    logoUrl: null,
    brandColor: '#10A37F',
    website: 'https://openai.com',
    requiresApiKey: true,
    apiKeyUrl: 'https://platform.openai.com/api-keys',
    models: ['GPT-4o', 'GPT-4 Turbo', 'GPT-3.5 Turbo'],
    addedIn: 'v1.1',
  },
  {
    id: 'claude',
    name: 'Claude',
    category: 'premium',
    status: 'coming-soon',
    description: 'Anthropic Claude 3.5 Sonnet, Opus, and Haiku. Best for long-context reasoning.',
    logoUrl: null,
    brandColor: '#D97757',
    website: 'https://anthropic.com',
    requiresApiKey: true,
    apiKeyUrl: 'https://console.anthropic.com/settings/keys',
    models: ['Claude 3.5 Sonnet', 'Claude 3 Opus', 'Claude 3 Haiku'],
    addedIn: 'v1.1',
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    category: 'premium',
    status: 'coming-soon',
    description: 'Google Gemini Pro with higher rate limits and advanced features.',
    logoUrl: null,
    brandColor: '#4285F4',
    website: 'https://ai.google.dev',
    requiresApiKey: true,
    apiKeyUrl: 'https://aistudio.google.com/app/apikey',
    models: ['Gemini 1.5 Pro', 'Gemini 1.0 Pro'],
    addedIn: 'v1.1',
  },
  {
    id: 'grok',
    name: 'Grok',
    category: 'premium',
    status: 'coming-soon',
    description: 'xAI Grok — real-time knowledge with a witty personality.',
    logoUrl: null,
    brandColor: '#1DA1F2',
    website: 'https://x.ai',
    requiresApiKey: true,
    apiKeyUrl: 'https://x.ai/api',
    models: ['Grok-2', 'Grok-2-mini', 'Grok-1.5'],
    addedIn: 'v1.1',
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    category: 'premium',
    status: 'coming-soon',
    description: 'Perplexity Sonar models with built-in web search and citations.',
    logoUrl: null,
    brandColor: '#20B8CD',
    website: 'https://perplexity.ai',
    requiresApiKey: true,
    apiKeyUrl: 'https://docs.perplexity.ai',
    models: ['Sonar Large', 'Sonar Small', 'Sonar Huge'],
    addedIn: 'v1.1',
  },
  {
    id: 'mistral',
    name: 'Mistral',
    category: 'premium',
    status: 'coming-soon',
    description: 'Mistral AI models. Efficient and strong at reasoning tasks.',
    logoUrl: null,
    brandColor: '#FF7000',
    website: 'https://mistral.ai',
    requiresApiKey: true,
    apiKeyUrl: 'https://console.mistral.ai/api-keys',
    models: ['Mistral Large 2', 'Codestral', 'Mistral Nemo'],
    addedIn: 'v1.1',
  },
];

/** All providers combined. */
export const ALL_PROVIDERS: AIProvider[] = [...FREE_PROVIDERS, ...PREMIUM_PROVIDERS];

/** Get a provider by ID. */
export function getProvider(id: string): AIProvider | undefined {
  return ALL_PROVIDERS.find((p) => p.id === id);
}

/** Get all providers in a category. */
export function getProvidersByCategory(category: ProviderCategory): AIProvider[] {
  return ALL_PROVIDERS.filter((p) => p.category === category);
}
