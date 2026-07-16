/**
 * StudentOS AI Tools Service
 * Handles AI-powered tool execution + usage tracking.
 */
import 'server-only';
import { getProvider } from '@/features/junova/services/ai-provider-registry';
import type {
  AIProviderType,
  ToolType,
  FlashcardResult,
  MindMapNode,
  CitationResult,
  GrammarIssue,
  TranslationResult,
  SummaryResult,
} from '../types';

export interface ToolExecuteParams {
  tool: ToolType;
  input: string;
  options?: Record<string, unknown>;
  provider?: AIProviderType;
}

export async function executeTool({ tool, input, options, provider = 'zai' }: ToolExecuteParams) {
  const ai = getProvider(provider);

  switch (tool) {
    case 'text-summarizer':
      return executeTextSummarizer(ai, input, options);
    case 'flashcard-generator':
      return executeFlashcardGenerator(ai, input, options);
    case 'translator':
      return executeTranslator(ai, input, options);
    case 'grammar-checker':
      return executeGrammarChecker(ai, input);
    case 'citation-generator':
      return executeCitationGenerator(ai, input, options);
    case 'mindmap-generator':
      return executeMindMapGenerator(ai, input);
    case 'formula-solver':
      return executeFormulaSolver(ai, input);
    case 'pdf-summarizer':
      return executePdfSummarizer(ai, input);
    case 'ocr':
      return executeOCR(ai, input);
    case 'handwriting':
      return executeHandwriting(ai, input);
    case 'unit-converter':
      return executeUnitConverter(input);
    case 'scientific-calculator':
      return executeScientificCalculator(input);
    default:
      throw new Error(`Unknown tool: ${tool}`);
  }
}

async function executeTextSummarizer(
  ai: ReturnType<typeof getProvider>,
  text: string,
  _options?: Record<string, unknown>,
): Promise<SummaryResult> {
  const result = await ai.json(
    `Summarize the following text. Return JSON: {"summary": "concise summary", "keyPoints": ["point1", "point2", "point3"]}\n\nText: ${text}`,
  );
  return {
    summary: String(result.summary ?? ''),
    keyPoints: Array.isArray(result.keyPoints) ? result.keyPoints.map(String) : [],
  };
}

async function executeFlashcardGenerator(
  ai: ReturnType<typeof getProvider>,
  text: string,
  _options?: Record<string, unknown>,
): Promise<FlashcardResult[]> {
  const result = await ai.json(
    `Generate 5-10 flashcards from this text. Return JSON: {"flashcards": [{"id": "fc1", "front": "question", "back": "answer"}]}\n\nText: ${text}`,
  );
  const cards = Array.isArray(result.flashcards) ? result.flashcards : [];
  return cards.map((c: Record<string, unknown>, i: number) => ({
    id: String(c.id ?? `fc${i + 1}`),
    front: String(c.front ?? ''),
    back: String(c.back ?? ''),
  }));
}

async function executeTranslator(
  ai: ReturnType<typeof getProvider>,
  text: string,
  options?: Record<string, unknown>,
): Promise<TranslationResult> {
  const targetLang = String(options?.targetLang ?? 'es');
  const result = await ai.json(
    `Translate to ${targetLang}. Return JSON: {"translatedText": "translation", "sourceLang": "detected source", "targetLang": "${targetLang}"}\n\nText: ${text}`,
  );
  return {
    translatedText: String(result.translatedText ?? ''),
    sourceLang: String(result.sourceLang ?? 'auto'),
    targetLang,
  };
}

async function executeGrammarChecker(
  ai: ReturnType<typeof getProvider>,
  text: string,
): Promise<{ issues: GrammarIssue[] }> {
  const result = await ai.json(
    `Check grammar. Return JSON: {"issues": [{"type": "grammar", "message": "error description", "suggestion": "corrected text", "offset": 0}]}\n\nText: ${text}`,
  );
  return {
    issues: Array.isArray(result.issues)
      ? result.issues.map((i: Record<string, unknown>) => ({
          type: String(i.type ?? ''),
          message: String(i.message ?? ''),
          suggestion: String(i.suggestion ?? ''),
          offset: Number(i.offset ?? 0),
        }))
      : [],
  };
}

async function executeCitationGenerator(
  ai: ReturnType<typeof getProvider>,
  input: string,
  options?: Record<string, unknown>,
): Promise<CitationResult> {
  const format = String(options?.format ?? 'APA');
  const result = await ai.json(
    `Generate a ${format} citation for this source. Return JSON: {"citation": "the full citation", "format": "${format}"}\n\nSource: ${input}`,
  );
  return { citation: String(result.citation ?? ''), format: format as CitationResult['format'] };
}

async function executeMindMapGenerator(
  ai: ReturnType<typeof getProvider>,
  topic: string,
): Promise<{ root: MindMapNode }> {
  const result = await ai.json(
    `Create a mind map for "${topic}". Return JSON: {"root": {"id": "root", "label": "${topic}", "children": [{"id": "n1", "label": "branch1", "children": []}]}}. Generate 4-6 main branches with 2-3 sub-branches each.`,
  );
  return { root: result.root as MindMapNode };
}

async function executeFormulaSolver(
  ai: ReturnType<typeof getProvider>,
  formula: string,
): Promise<{ solution: string; steps: string[] }> {
  const result = await ai.json(
    `Solve this formula step by step. Return JSON: {"solution": "final answer", "steps": ["step 1", "step 2"]}\n\nFormula: ${formula}`,
  );
  return {
    solution: String(result.solution ?? ''),
    steps: Array.isArray(result.steps) ? result.steps.map(String) : [],
  };
}

async function executePdfSummarizer(
  ai: ReturnType<typeof getProvider>,
  text: string,
): Promise<SummaryResult> {
  return executeTextSummarizer(ai, text);
}

async function executeOCR(
  _ai: ReturnType<typeof getProvider>,
  _imageData: string,
): Promise<{ text: string }> {
  // OCR requires vision support — stub for now
  return {
    text: 'OCR requires a vision-capable AI model (Gemini/GPT-4). Configure a premium provider to enable.',
  };
}

async function executeHandwriting(
  _ai: ReturnType<typeof getProvider>,
  _imageData: string,
): Promise<{ text: string }> {
  return {
    text: 'Handwriting recognition requires a vision-capable AI model. Configure a premium provider to enable.',
  };
}

function executeUnitConverter(input: string): { result: string } {
  const match = input.match(/([\d.]+)\s*(\w+)\s*to\s*(\w+)/i);
  if (!match) return { result: 'Format: "10 km to miles"' };
  const value = parseFloat(match[1]);
  const from = match[2].toLowerCase();
  const to = match[3].toLowerCase();
  const conversions: Record<string, Record<string, number | ((v: number) => number)>> = {
    km: { miles: 0.621371, m: 1000 },
    miles: { km: 1.60934, m: 1609.34 },
    m: { km: 0.001, miles: 0.000621371, ft: 3.28084 },
    ft: { m: 0.3048, inches: 12 },
    kg: { lbs: 2.20462, g: 1000 },
    lbs: { kg: 0.453592, g: 453.592 },
    c: { f: (c: number) => (c * 9) / 5 + 32, k: (c: number) => c + 273.15 },
    f: { c: (f: number) => ((f - 32) * 5) / 9, k: (f: number) => ((f - 32) * 5) / 9 + 273.15 },
  };
  const fromTable = conversions[from];
  if (!fromTable || !(to in fromTable))
    return { result: `Conversion ${from} → ${to} not supported.` };
  const factor = fromTable[to];
  const result = typeof factor === 'function' ? factor(value) : value * factor;
  return { result: `${value} ${from} = ${Math.round(result * 100) / 100} ${to}` };
}

function executeScientificCalculator(input: string): { result: string } {
  try {
    // Safe eval — only allow math operations
    const sanitized = input
      .replace(/[^0-9+\-*/().,%^√πe\s]/g, '')
      .replace(/\^/g, '**')
      .replace(/√/g, 'Math.sqrt')
      .replace(/π/g, 'Math.PI')
      .replace(/(?<![a-zA-Z])e(?![a-zA-Z])/g, 'Math.E');

    const result = new Function(`return ${sanitized}`)();
    return { result: `${input} = ${result}` };
  } catch {
    return { result: 'Invalid expression. Supported: +, -, *, /, ^, √, π, e, (), %' };
  }
}
