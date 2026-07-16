'use client';
/**
 * Quiz Config Form — lets user select quiz options and generate.
 */
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SUBJECTS } from '@/features/junova/constants';
import {
  QUESTION_TYPES,
  DIFFICULTIES,
  QUESTION_COUNT_OPTIONS,
  TIME_LIMIT_OPTIONS,
} from '../constants';
import type { QuizConfig, QuestionType, Difficulty } from '../types';
import { cn } from '@/lib/utils';

export interface QuizConfigFormProps {
  config: QuizConfig;
  onConfigChange: (c: Partial<QuizConfig>) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function QuizConfigForm({
  config,
  onConfigChange,
  onGenerate,
  isGenerating,
}: QuizConfigFormProps) {
  const toggleQuestionType = (type: QuestionType) => {
    const has = config.questionTypes.includes(type);
    onConfigChange({
      questionTypes: has
        ? config.questionTypes.filter((t) => t !== type)
        : [...config.questionTypes, type],
    });
  };

  return (
    <div className="border-border bg-card/50 mx-auto max-w-2xl space-y-6 rounded-xl border p-6 backdrop-blur-sm">
      <div className="text-center">
        <div className="bg-primary/10 ring-primary/20 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl ring-1">
          <Sparkles className="text-primary h-6 w-6" />
        </div>
        <h2 className="text-foreground text-lg font-semibold">Generate a Quiz</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Junova AI will create personalized questions based on your selections.
        </p>
      </div>

      {/* Subject + Chapter */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="quiz-subject">Subject</Label>
          <select
            id="quiz-subject"
            value={config.subject}
            onChange={(e) => onConfigChange({ subject: e.target.value })}
            className="border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm"
          >
            {SUBJECTS.map((s) => (
              <option key={s} value={s} className="bg-card">
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="chapter">Chapter / Topic</Label>
          <Input
            id="chapter"
            placeholder="e.g. Chapter 5: Photosynthesis"
            value={config.chapter}
            onChange={(e) => onConfigChange({ chapter: e.target.value })}
          />
        </div>
      </div>

      {/* Difficulty */}
      <div className="space-y-2">
        <Label>Difficulty</Label>
        <div className="grid grid-cols-3 gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => onConfigChange({ difficulty: d.value as Difficulty })}
              className={cn(
                'rounded-lg border px-3 py-2 text-sm font-medium transition-all',
                config.difficulty === d.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:bg-accent',
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Question Types */}
      <div className="space-y-2">
        <Label>Question Types</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {QUESTION_TYPES.map((qt) => (
            <button
              key={qt.value}
              type="button"
              onClick={() => toggleQuestionType(qt.value)}
              className={cn(
                'rounded-lg border p-3 text-left transition-all',
                config.questionTypes.includes(qt.value)
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:bg-accent',
              )}
            >
              <div className="text-foreground text-sm font-medium">{qt.label}</div>
              <div className="text-muted-foreground text-xs">{qt.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Question Count */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Number of Questions</Label>
          <span className="text-muted-foreground font-mono text-sm">{config.questionCount}</span>
        </div>
        <div className="flex gap-2">
          {QUESTION_COUNT_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onConfigChange({ questionCount: n })}
              className={cn(
                'h-9 w-12 rounded-lg border text-sm font-medium transition-all',
                config.questionCount === n
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:bg-accent',
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Time Limit */}
      <div className="space-y-2">
        <Label>Time Limit</Label>
        <div className="flex flex-wrap gap-2">
          {TIME_LIMIT_OPTIONS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => onConfigChange({ timeLimitMinutes: t.value })}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-sm transition-all',
                config.timeLimitMinutes === t.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:bg-accent',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <Button
        onClick={onGenerate}
        disabled={isGenerating || !config.chapter.trim() || config.questionTypes.length === 0}
        className="w-full"
        size="lg"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Quiz…
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Quiz
          </>
        )}
      </Button>
    </div>
  );
}
