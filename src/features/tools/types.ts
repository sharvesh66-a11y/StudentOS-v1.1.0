/**
 * StudentOS AI Tools — Domain Types
 */

export type ToolType =
  | 'formula-solver'
  | 'scientific-calculator'
  | 'unit-converter'
  | 'ocr'
  | 'pdf-summarizer'
  | 'handwriting'
  | 'grammar-checker'
  | 'translator'
  | 'text-summarizer'
  | 'flashcard-generator'
  | 'mindmap-generator'
  | 'citation-generator';

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface FlashcardResult {
  id: string;
  front: string;
  back: string;
}
export interface MindMapNode {
  id: string;
  label: string;
  children?: MindMapNode[];
}
export interface CitationResult {
  citation: string;
  format: 'APA' | 'MLA' | 'Chicago' | 'Harvard';
}
export interface GrammarIssue {
  type: string;
  message: string;
  suggestion: string;
  offset: number;
}
export interface TranslationResult {
  translatedText: string;
  sourceLang: string;
  targetLang: string;
}
export interface SummaryResult {
  summary: string;
  keyPoints: string[];
}

export interface ToolUsage {
  id: string;
  uid: string;
  tool: ToolType;
  input: string;
  result: unknown;
  createdAt: number;
}

// ---------------------------------------------------------------------------
// AI Provider Registry
// ---------------------------------------------------------------------------

export type AIProviderType =
  'zai' | 'openai' | 'gemini' | 'claude' | 'grok' | 'deepseek' | 'glm' | 'local';

export interface AIProviderConfig {
  id: AIProviderType;
  name: string;
  description: string;
  isPremium: boolean;
  maxTokens: number;
  supportsStreaming: boolean;
  supportsVision: boolean;
  costPer1kTokens: number;
}

export const AI_PROVIDERS: AIProviderConfig[] = [
  {
    id: 'zai',
    name: 'Junova (GLM)',
    description: 'Default — fast, reliable, great for education.',
    isPremium: false,
    maxTokens: 4096,
    supportsStreaming: true,
    supportsVision: false,
    costPer1kTokens: 0,
  },
  {
    id: 'openai',
    name: 'OpenAI GPT-4',
    description: 'Advanced reasoning and code generation.',
    isPremium: true,
    maxTokens: 8192,
    supportsStreaming: true,
    supportsVision: true,
    costPer1kTokens: 0.03,
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Multimodal — great with images and PDFs.',
    isPremium: true,
    maxTokens: 8192,
    supportsStreaming: true,
    supportsVision: true,
    costPer1kTokens: 0.025,
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    description: 'Excellent for long-form analysis and writing.',
    isPremium: true,
    maxTokens: 8192,
    supportsStreaming: true,
    supportsVision: false,
    costPer1kTokens: 0.03,
  },
  {
    id: 'grok',
    name: 'xAI Grok',
    description: 'Real-time knowledge and witty responses.',
    isPremium: true,
    maxTokens: 4096,
    supportsStreaming: true,
    supportsVision: false,
    costPer1kTokens: 0.02,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'Cost-effective with strong math capabilities.',
    isPremium: true,
    maxTokens: 4096,
    supportsStreaming: false,
    supportsVision: false,
    costPer1kTokens: 0.01,
  },
  {
    id: 'glm',
    name: 'GLM-4',
    description: 'Bilingual excellence (EN/CN).',
    isPremium: true,
    maxTokens: 4096,
    supportsStreaming: true,
    supportsVision: false,
    costPer1kTokens: 0.015,
  },
  {
    id: 'local',
    name: 'Local Model',
    description: 'Run your own model — privacy first. (Future)',
    isPremium: false,
    maxTokens: 2048,
    supportsStreaming: false,
    supportsVision: false,
    costPer1kTokens: 0,
  },
];

// ---------------------------------------------------------------------------
// Premium System
// ---------------------------------------------------------------------------

export type PlanTier = 'free' | 'premium' | 'premium_plus';

export interface PremiumPlan {
  tier: PlanTier;
  name: string;
  price: number;
  features: string[];
  limits: PlanLimits;
}

export interface PlanLimits {
  aiChatsPerDay: number; // -1 = unlimited
  notesPerDay: number;
  quizzesPerDay: number;
  advancedModels: boolean;
  voiceTeacher: boolean;
  liveTeacher: boolean;
  fasterResponses: boolean;
  advancedAnalytics: boolean;
  prioritySupport: boolean;
  aiTools: ToolType[];
  maxTeachers: number;
}

export const PREMIUM_PLANS: PremiumPlan[] = [
  {
    tier: 'free',
    name: 'Free',
    price: 0,
    features: [
      '10 AI chats/day',
      '5 notes/day',
      '3 quizzes/day',
      'Basic analytics',
      '1 AI Teacher',
      'Basic tools',
    ],
    limits: {
      aiChatsPerDay: 10,
      notesPerDay: 5,
      quizzesPerDay: 3,
      advancedModels: false,
      voiceTeacher: false,
      liveTeacher: false,
      fasterResponses: false,
      advancedAnalytics: false,
      prioritySupport: false,
      aiTools: ['text-summarizer', 'unit-converter', 'flashcard-generator'],
      maxTeachers: 1,
    },
  },
  {
    tier: 'premium',
    name: 'Premium',
    price: 9.99,
    features: [
      'Unlimited AI chats',
      'Unlimited notes',
      '20 quizzes/day',
      'Voice Teacher',
      'Advanced analytics',
      '5 AI Teachers',
      'All AI tools',
      'Faster responses',
    ],
    limits: {
      aiChatsPerDay: -1,
      notesPerDay: -1,
      quizzesPerDay: 20,
      advancedModels: false,
      voiceTeacher: true,
      liveTeacher: false,
      fasterResponses: true,
      advancedAnalytics: true,
      prioritySupport: false,
      aiTools: [
        'formula-solver',
        'scientific-calculator',
        'unit-converter',
        'ocr',
        'pdf-summarizer',
        'handwriting',
        'grammar-checker',
        'translator',
        'text-summarizer',
        'flashcard-generator',
        'mindmap-generator',
        'citation-generator',
      ],
      maxTeachers: 5,
    },
  },
  {
    tier: 'premium_plus',
    name: 'Premium+',
    price: 19.99,
    features: [
      'Everything in Premium',
      'Advanced AI models (GPT-4, Gemini, Claude)',
      'Live AI Teacher',
      'Unlimited quizzes',
      'Priority support',
      'Unlimited AI Teachers',
    ],
    limits: {
      aiChatsPerDay: -1,
      notesPerDay: -1,
      quizzesPerDay: -1,
      advancedModels: true,
      voiceTeacher: true,
      liveTeacher: true,
      fasterResponses: true,
      advancedAnalytics: true,
      prioritySupport: true,
      aiTools: [
        'formula-solver',
        'scientific-calculator',
        'unit-converter',
        'ocr',
        'pdf-summarizer',
        'handwriting',
        'grammar-checker',
        'translator',
        'text-summarizer',
        'flashcard-generator',
        'mindmap-generator',
        'citation-generator',
      ],
      maxTeachers: -1,
    },
  },
];

export interface UserSubscription {
  uid: string;
  tier: PlanTier;
  startedAt: number;
  expiresAt: number | null;
  autoRenew: boolean;
  usage: { date: string; aiChats: number; notes: number; quizzes: number };
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// User Settings
// ---------------------------------------------------------------------------

export interface UserSettings {
  uid: string;
  // AI
  defaultAIProvider: AIProviderType;
  preferredTeacherId: string | null;
  aiPreferences: {
    responseStyle: 'concise' | 'balanced' | 'detailed';
    creativityLevel: 'low' | 'medium' | 'high';
    autoGenerateFlashcards: boolean;
    autoGenerateSummary: boolean;
    showCitations: boolean;
    autoSuggestions: boolean;
    autoSpeak: boolean;
    memoryEnabled: boolean;
  };
  // Personalization
  theme: 'dark' | 'light' | 'system';
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  fontFamily: 'sans' | 'serif' | 'mono';
  uiDensity: 'compact' | 'comfortable' | 'spacious';
  sidebarCollapsed: boolean;
  sidebarStyle: 'compact' | 'default' | 'expanded';
  backgroundStyle: 'gradient' | 'space' | 'stars' | 'glass' | 'minimal';
  animationsEnabled: boolean;
  language: string;
  timezone: string;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  // Notifications
  notifications: {
    push: boolean;
    email: boolean;
    studyReminders: boolean;
    planner: boolean;
    quiz: boolean;
    community: boolean;
    scholarship: boolean;
    career: boolean;
    freelancing: boolean;
    soundEffects: boolean;
  };
  // Privacy
  privacy: {
    twoFactorEnabled: boolean;
    profileVisibility: 'public' | 'private' | 'friends';
    showOnlineStatus: boolean;
    allowDirectMessages: boolean;
    showActivity: boolean;
  };
  // Accessibility
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    screenReader: boolean;
    keyboardNavigation: boolean;
    fontScaling: number;
    colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  };
  // Voice
  voiceEnabled: boolean;
  // Account
  phone: string | null;
  dateOfBirth: string | null;
  bio: string;
  updatedAt: number;
}

export const DEFAULT_USER_SETTINGS: Omit<UserSettings, 'uid'> = {
  defaultAIProvider: 'zai',
  preferredTeacherId: null,
  aiPreferences: {
    responseStyle: 'balanced',
    creativityLevel: 'medium',
    autoGenerateFlashcards: true,
    autoGenerateSummary: true,
    showCitations: false,
    autoSuggestions: true,
    autoSpeak: false,
    memoryEnabled: true,
  },
  theme: 'dark',
  accentColor: '#7c3aed',
  fontSize: 'medium',
  fontFamily: 'sans',
  uiDensity: 'comfortable',
  sidebarCollapsed: false,
  sidebarStyle: 'default',
  backgroundStyle: 'gradient',
  animationsEnabled: true,
  language: 'en',
  timezone: 'UTC',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: '24h',
  notifications: {
    push: true,
    email: true,
    studyReminders: true,
    planner: true,
    quiz: true,
    community: true,
    scholarship: true,
    career: true,
    freelancing: true,
    soundEffects: true,
  },
  privacy: {
    twoFactorEnabled: false,
    profileVisibility: 'public',
    showOnlineStatus: true,
    allowDirectMessages: true,
    showActivity: true,
  },
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: false,
    fontScaling: 100,
    colorBlindMode: 'none',
  },
  voiceEnabled: false,
  phone: null,
  dateOfBirth: null,
  bio: '',
  updatedAt: 0,
};
