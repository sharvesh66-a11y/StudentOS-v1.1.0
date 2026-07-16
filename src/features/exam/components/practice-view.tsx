'use client';
/**
 * Practice View — AI Practice modes selection + recent practice sessions.
 */
import { useState } from 'react';
import {
  Loader2,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Clock,
  RotateCcw,
  CheckCircle,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PRACTICE_MODES } from '../constants';
import { usePractice } from '../hooks/use-practice';
import type { PracticeMode, Quiz } from '../types';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/utils/format';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  calendar: Calendar,
  'alert-circle': AlertCircle,
  'check-circle': CheckCircle,
  clock: Clock,
  'trending-up': TrendingUp,
  'rotate-ccw': RotateCcw,
  sparkles: Sparkles,
};

export interface PracticeViewProps {
  onPracticeGenerated: (quiz: Quiz) => void;
}

export function PracticeView({ onPracticeGenerated }: PracticeViewProps) {
  const { sessions, analysis, isGenerating, generatePractice } = usePractice();
  const [selectedMode, setSelectedMode] = useState<PracticeMode>('daily');

  const handleStart = async () => {
    const result = await generatePractice(selectedMode, 'General', '', 'medium', 5);
    if (result) {
      const quiz: Quiz = {
        id: result.session?.id ?? '',
        uid: '',
        title: `${PRACTICE_MODES.find((m) => m.value === selectedMode)?.label}`,
        subject: 'General',
        chapter: '',
        difficulty: 'medium',
        questionCount: result.questions.length,
        questionTypes: ['mcq'],
        timeLimitMinutes: selectedMode === 'timed' ? 5 : 0,
        aiGenerated: true,
        status: 'ready',
        questions: result.questions,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      onPracticeGenerated(quiz);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mistake analysis summary */}
      {analysis && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="border-border bg-card/50 rounded-xl border p-4">
            <div className="text-muted-foreground text-xs">Accuracy</div>
            <div className="text-foreground mt-1 text-xl font-semibold">
              {analysis.accuracyRate}%
            </div>
          </div>
          <div className="border-border bg-card/50 rounded-xl border p-4">
            <div className="text-muted-foreground text-xs">Quizzes</div>
            <div className="text-foreground mt-1 text-xl font-semibold">
              {analysis.totalQuizzes}
            </div>
          </div>
          <div className="border-border bg-card/50 rounded-xl border p-4">
            <div className="text-muted-foreground text-xs">Weak Topics</div>
            <div className="text-destructive mt-1 text-xl font-semibold">
              {analysis.frequentlyIncorrectTopics.length}
            </div>
          </div>
          <div className="border-border bg-card/50 rounded-xl border p-4">
            <div className="text-muted-foreground text-xs">Time/Q</div>
            <div className="text-foreground mt-1 text-xl font-semibold">
              {analysis.averageTimePerQuestion}s
            </div>
          </div>
        </div>
      )}

      {/* Practice modes */}
      <div className="border-border bg-card/50 rounded-xl border p-5 backdrop-blur-sm">
        <h3 className="text-foreground mb-3 text-sm font-semibold">Choose a Practice Mode</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PRACTICE_MODES.map((mode) => {
            const Icon = ICON_MAP[mode.icon] ?? Sparkles;
            return (
              <button
                key={mode.value}
                onClick={() => setSelectedMode(mode.value as PracticeMode)}
                className={cn(
                  'rounded-lg border p-4 text-left transition-all',
                  selectedMode === mode.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:bg-accent',
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5',
                    selectedMode === mode.value ? 'text-primary' : 'text-muted-foreground',
                  )}
                />
                <div className="text-foreground mt-2 text-sm font-medium">{mode.label}</div>
                <div className="text-muted-foreground mt-0.5 text-xs">{mode.description}</div>
              </button>
            );
          })}
        </div>
        <Button onClick={handleStart} disabled={isGenerating} className="mt-4 w-full" size="lg">
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Practice…
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Start Practice
            </>
          )}
        </Button>
      </div>

      {/* Recent sessions */}
      {sessions.length > 0 && (
        <div className="border-border bg-card/50 rounded-xl border p-5 backdrop-blur-sm">
          <h3 className="text-foreground mb-3 text-sm font-semibold">Recent Practice Sessions</h3>
          <div className="space-y-2">
            {sessions.slice(0, 5).map((s) => (
              <div
                key={s.id}
                className="border-border bg-background/50 flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
              >
                <div>
                  <span className="text-foreground font-medium">
                    {PRACTICE_MODES.find((m) => m.value === s.mode)?.label ?? s.mode}
                  </span>
                  <span className="text-muted-foreground ml-2 text-xs">
                    {formatRelativeTime(new Date(s.createdAt))}
                  </span>
                </div>
                <div className="text-muted-foreground flex items-center gap-3 text-xs">
                  {s.score !== null && (
                    <span className="text-foreground font-medium">{s.score}%</span>
                  )}
                  {s.status === 'in-progress' && (
                    <span className="text-amber-500">In progress</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
