'use client';
/**
 * Quiz Player — the active quiz taking experience.
 * Shows current question, navigator, timer, prev/next/submit buttons.
 */
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuestionCard } from './question-card';
import { QuestionNavigator } from './question-navigator';
import { QuizTimer } from './quiz-timer';
import type { Quiz } from '../types';
import { useState } from 'react';
import { toast } from 'sonner';

export interface QuizPlayerProps {
  quiz: Quiz;
  currentIndex: number;
  answers: Record<string, string>;
  timeRemaining: number | null;
  onAnswer: (questionId: string, answer: string) => void;
  onNext: () => void;
  onPrev: () => void;
  onNavigate: (index: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function QuizPlayer({
  quiz,
  currentIndex,
  answers,
  timeRemaining,
  onAnswer,
  onNext,
  onPrev,
  onNavigate,
  onSubmit,
  isSubmitting,
}: QuizPlayerProps) {
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const question = quiz.questions[currentIndex];
  const answeredIndices = new Set(
    quiz.questions.map((q, i) => (answers[q.id] ? i : -1)).filter((i) => i >= 0),
  );
  const answeredCount = answeredIndices.size;
  const isLast = currentIndex === quiz.questions.length - 1;

  const handleSubmit = () => {
    if (!confirmSubmit) {
      setConfirmSubmit(true);
      toast.info('Submit quiz?', {
        description: `You've answered ${answeredCount} of ${quiz.questions.length} questions. Click Submit again to confirm.`,
      });
      setTimeout(() => setConfirmSubmit(false), 5000);
      return;
    }
    onSubmit();
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {/* Header bar */}
      <div className="border-border bg-card/50 flex items-center justify-between rounded-xl border px-4 py-3 backdrop-blur-sm">
        <div>
          <h2 className="text-foreground text-sm font-semibold">{quiz.title}</h2>
          <p className="text-muted-foreground text-xs">
            {quiz.subject} · {answeredCount}/{quiz.questions.length} answered
          </p>
        </div>
        <QuizTimer secondsRemaining={timeRemaining} />
      </div>

      {/* Question */}
      <QuestionCard
        question={question}
        index={currentIndex}
        total={quiz.questions.length}
        answer={answers[question.id] ?? ''}
        onAnswer={(a) => onAnswer(question.id, a)}
      />

      {/* Navigator */}
      <div className="border-border bg-card/30 rounded-xl border p-4">
        <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
          Question Navigator
        </p>
        <QuestionNavigator
          total={quiz.questions.length}
          currentIndex={currentIndex}
          answeredIds={answeredIndices}
          onNavigate={onNavigate}
        />
      </div>

      {/* Nav buttons */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onPrev} disabled={currentIndex === 0}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Previous
        </Button>
        {isLast ? (
          <Button onClick={handleSubmit} disabled={isSubmitting} variant="default">
            <Send className="mr-2 h-4 w-4" /> {confirmSubmit ? 'Confirm Submit' : 'Submit Quiz'}
          </Button>
        ) : (
          <Button onClick={onNext}>
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
