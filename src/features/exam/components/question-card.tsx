'use client';
/**
 * Question Card — renders a single question with input based on type.
 */
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import type { Question } from '../types';
import { DIFFICULTIES } from '../constants';

export interface QuestionCardProps {
  question: Question;
  index: number;
  total: number;
  answer: string;
  onAnswer: (answer: string) => void;
  showResult?: boolean;
  correctAnswer?: string;
  isCorrect?: boolean;
}

export function QuestionCard({
  question,
  index,
  total,
  answer,
  onAnswer,
  showResult,
  correctAnswer,
  isCorrect,
}: QuestionCardProps) {
  const difficultyMeta = DIFFICULTIES.find((d) => d.value === question.difficulty);

  return (
    <div className="border-border bg-card/50 space-y-4 rounded-xl border p-5 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
          Question {index + 1} of {total}
        </span>
        <span className={cn('text-xs font-medium', difficultyMeta?.color)}>
          {difficultyMeta?.label}
        </span>
      </div>

      {/* Question text */}
      <p className="text-foreground text-base font-medium">{question.text}</p>

      {/* Answer input based on type */}
      {question.type === 'mcq' && question.options && (
        <RadioGroup value={answer} onValueChange={onAnswer}>
          {question.options.map((opt, i) => (
            <div
              key={i}
              className={cn(
                'flex items-center gap-3 rounded-lg border p-3 transition-colors',
                showResult && opt === correctAnswer
                  ? 'border-emerald-500/40 bg-emerald-500/5'
                  : 'border-border hover:bg-accent',
                showResult &&
                  answer === opt &&
                  opt !== correctAnswer &&
                  'border-destructive/40 bg-destructive/5',
              )}
            >
              <RadioGroupItem value={opt} id={`opt-${i}`} />
              <Label htmlFor={`opt-${i}`} className="text-foreground flex-1 cursor-pointer text-sm">
                {opt}
              </Label>
              {showResult && opt === correctAnswer && (
                <span className="text-xs text-emerald-500">✓ Correct</span>
              )}
              {showResult && answer === opt && opt !== correctAnswer && (
                <span className="text-destructive text-xs">✗ Wrong</span>
              )}
            </div>
          ))}
        </RadioGroup>
      )}

      {question.type === 'true-false' && (
        <RadioGroup value={answer} onValueChange={onAnswer}>
          <div className="flex gap-3">
            {['true', 'false'].map((opt) => (
              <div
                key={opt}
                className={cn(
                  'flex flex-1 items-center gap-3 rounded-lg border p-4 transition-colors',
                  showResult && opt === correctAnswer
                    ? 'border-emerald-500/40 bg-emerald-500/5'
                    : 'border-border hover:bg-accent',
                  showResult &&
                    answer === opt &&
                    opt !== correctAnswer &&
                    'border-destructive/40 bg-destructive/5',
                )}
              >
                <RadioGroupItem value={opt} id={`tf-${opt}`} />
                <Label htmlFor={`tf-${opt}`} className="text-foreground cursor-pointer capitalize">
                  {opt}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      )}

      {question.type === 'fill-blank' && (
        <Input
          placeholder="Type your answer..."
          value={answer}
          onChange={(e) => onAnswer(e.target.value)}
          disabled={showResult}
          aria-label="Your answer"
          className={cn(
            showResult && !isCorrect && 'border-destructive',
            showResult && isCorrect && 'border-emerald-500',
          )}
        />
      )}

      {question.type === 'short-answer' && (
        <Input
          placeholder="Type your answer (1-2 sentences)..."
          value={answer}
          onChange={(e) => onAnswer(e.target.value)}
          disabled={showResult}
          aria-label="Your answer"
        />
      )}

      {question.type === 'long-answer' && (
        <Textarea
          placeholder="Write your detailed answer..."
          rows={4}
          value={answer}
          onChange={(e) => onAnswer(e.target.value)}
          disabled={showResult}
          aria-label="Your detailed answer"
        />
      )}

      {/* Result explanation */}
      {showResult && (
        <div
          className={cn(
            'rounded-lg border p-3 text-sm',
            isCorrect
              ? 'border-emerald-500/20 bg-emerald-500/5'
              : 'border-amber-500/20 bg-amber-500/5',
          )}
        >
          <p className="text-foreground font-medium">{isCorrect ? '✓ Correct!' : '✗ Not quite.'}</p>
          {!isCorrect && (
            <p className="text-muted-foreground mt-1">
              Correct answer: <span className="text-foreground font-medium">{correctAnswer}</span>
            </p>
          )}
          <p className="text-muted-foreground mt-2">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}
