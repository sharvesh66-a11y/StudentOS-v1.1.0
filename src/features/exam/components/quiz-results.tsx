'use client';
/**
 * Quiz Results — shows score, per-question results, and retry button.
 */
import { Trophy, RotateCcw, ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { QuestionCard } from './question-card';
import type { Quiz, QuizResult } from '../types';

export interface QuizResultsProps {
  quiz: Quiz;
  result: QuizResult;
  onRetry: () => void;
  onExit: () => void;
}

export function QuizResults({ quiz, result, onRetry, onExit }: QuizResultsProps) {
  const passed = result.score >= 60;
  const mins = Math.floor(result.timeSpentSeconds / 60);
  const secs = result.timeSpentSeconds % 60;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Score header */}
      <div className="border-border bg-card/50 rounded-xl border p-6 text-center backdrop-blur-sm">
        <div
          className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full ${passed ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}
        >
          <Trophy className={`h-8 w-8 ${passed ? 'text-emerald-500' : 'text-amber-500'}`} />
        </div>
        <h2 className="text-foreground text-2xl font-bold">{result.score}%</h2>
        <p className="text-muted-foreground text-sm">
          {result.correctCount} / {result.totalQuestions} correct · {result.pointsEarned} /{' '}
          {result.totalPoints} points
        </p>
        <div className="text-muted-foreground mt-3 flex items-center justify-center gap-4 text-xs">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {mins}m {secs}s
          </span>
          {result.weakTopics.length > 0 && (
            <span className="text-destructive">{result.weakTopics.length} weak topics</span>
          )}
          {result.strongTopics.length > 0 && (
            <span className="text-emerald-500">{result.strongTopics.length} strong topics</span>
          )}
        </div>
        <Progress value={result.score} className="mt-4 h-2" />
        <p className="text-muted-foreground mt-2 text-xs">
          {passed ? '🎉 Great job! You passed.' : "💪 Keep practicing — you'll get there!"}
        </p>
        <p className="text-muted-foreground/60 mt-1 text-xs">
          Your memory has been updated with weak and strong topics. Junova AI will use this in
          future conversations.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button onClick={onExit} variant="outline" className="flex-1">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Quizzes
        </Button>
        <Button onClick={onRetry} className="flex-1">
          <RotateCcw className="mr-2 h-4 w-4" /> Retry Quiz
        </Button>
      </div>

      {/* Per-question results */}
      <div className="space-y-4">
        <h3 className="text-foreground text-sm font-semibold">Detailed Results</h3>
        {quiz.questions.map((q, i) => {
          const qr = result.questionResults.find((r) => r.questionId === q.id);
          return (
            <QuestionCard
              key={q.id}
              question={q}
              index={i}
              total={quiz.questions.length}
              answer={qr?.studentAnswer ?? ''}
              onAnswer={() => {}}
              showResult
              correctAnswer={qr?.correctAnswer}
              isCorrect={qr?.isCorrect}
            />
          );
        })}
      </div>
    </div>
  );
}
