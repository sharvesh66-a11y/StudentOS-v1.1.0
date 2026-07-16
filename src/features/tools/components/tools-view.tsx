'use client';
import { useState } from 'react';
import {
  Calculator,
  FileText,
  Languages,
  SpellCheck,
  Quote,
  Network,
  FunctionSquare,
  ArrowLeftRight,
  ScanLine,
  PenTool,
  Layers,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { authedFetch } from '@/lib/api-client';
import { usePremium } from '@/features/premium/hooks/use-premium';
import { useSettings } from '@/features/settings/hooks/use-settings';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { ToolType } from '../types';

const TOOLS: {
  id: ToolType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}[] = [
  {
    id: 'text-summarizer',
    label: 'Text Summarizer',
    icon: FileText,
    description: 'Summarize any text into key points.',
  },
  {
    id: 'flashcard-generator',
    label: 'Flashcards',
    icon: Layers,
    description: 'Generate flashcards from text.',
  },
  {
    id: 'translator',
    label: 'Translator',
    icon: Languages,
    description: 'Translate text to any language.',
  },
  {
    id: 'grammar-checker',
    label: 'Grammar Checker',
    icon: SpellCheck,
    description: 'Check and fix grammar issues.',
  },
  {
    id: 'citation-generator',
    label: 'Citations',
    icon: Quote,
    description: 'Generate APA, MLA, Chicago citations.',
  },
  {
    id: 'mindmap-generator',
    label: 'Mind Map',
    icon: Network,
    description: 'Create a mind map from a topic.',
  },
  {
    id: 'formula-solver',
    label: 'Formula Solver',
    icon: FunctionSquare,
    description: 'Solve formulas step-by-step.',
  },
  {
    id: 'scientific-calculator',
    label: 'Calculator',
    icon: Calculator,
    description: 'Scientific calculator.',
  },
  {
    id: 'unit-converter',
    label: 'Unit Converter',
    icon: ArrowLeftRight,
    description: 'Convert units (km→miles, kg→lbs).',
  },
  {
    id: 'pdf-summarizer',
    label: 'PDF Summarizer',
    icon: FileText,
    description: 'Summarize PDF text content.',
  },
  { id: 'ocr', label: 'OCR', icon: ScanLine, description: 'Extract text from images.' },
  { id: 'handwriting', label: 'Handwriting', icon: PenTool, description: 'Recognize handwriting.' },
];

export function ToolsView() {
  const { limits } = usePremium();
  const { settings } = useSettings();
  const [selectedTool, setSelectedTool] = useState<ToolType | null>(null);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleExecute = async () => {
    if (!selectedTool || !input.trim()) return;
    if (!limits.aiTools.includes(selectedTool)) {
      toast.error('Premium required', { description: 'Upgrade to access this tool.' });
      return;
    }
    setIsLoading(true);
    try {
      const response = await authedFetch('/api/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: selectedTool,
          input,
          options: { targetLang: 'es', format: 'APA' },
          provider: settings.defaultAIProvider,
        }),
      });
      const data = await response.json();
      setIsLoading(false);
      if (data.success) {
        setResult(JSON.stringify(data.result, null, 2));
        toast.success('Tool executed');
      } else {
        toast.error('Tool failed', { description: data.error });
      }
    } catch (err) {
      setIsLoading(false);
      toast.error('Failed', { description: err instanceof Error ? err.message : 'Unknown error' });
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">AI Tools</h1>
        <p className="text-muted-foreground text-sm">
          12 AI-powered study tools — powered by Junova AI.
        </p>
      </div>

      {/* Tool grid */}
      {!selectedTool && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isPremium = !limits.aiTools.includes(tool.id);
            return (
              <button
                key={tool.id}
                onClick={() => {
                  setSelectedTool(tool.id);
                  setResult('');
                }}
                className={cn(
                  'group border-border bg-card/50 hover:border-primary/40 rounded-xl border p-4 text-left transition-all',
                  isPremium && 'opacity-70',
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="bg-primary/10 text-primary ring-primary/20 flex h-10 w-10 items-center justify-center rounded-lg ring-1">
                    <Icon className="h-5 w-5" />
                  </div>
                  {isPremium && (
                    <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-500">
                      Premium
                    </span>
                  )}
                </div>
                <h3 className="text-foreground mt-3 text-sm font-semibold">{tool.label}</h3>
                <p className="text-muted-foreground mt-0.5 text-xs">{tool.description}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Tool executor */}
      {selectedTool && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-foreground text-lg font-semibold">
              {TOOLS.find((t) => t.id === selectedTool)?.label}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedTool(null);
                setInput('');
                setResult('');
              }}
            >
              ← Back to Tools
            </Button>
          </div>
          <div className="border-border bg-card/50 rounded-xl border p-5 backdrop-blur-sm">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text or input for the tool…"
              aria-label="Tool input"
              rows={5}
            />
            <Button
              onClick={handleExecute}
              disabled={isLoading || !input.trim()}
              className="mt-3 w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Run Tool
                </>
              )}
            </Button>
          </div>
          {result && (
            <div className="border-border bg-card/50 rounded-xl border p-5 backdrop-blur-sm">
              <h3 className="text-foreground mb-2 text-sm font-semibold">Result</h3>
              <pre className="text-muted-foreground overflow-x-auto text-sm whitespace-pre-wrap">
                {result}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
