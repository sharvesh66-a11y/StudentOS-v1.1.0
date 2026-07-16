'use client';
/**
 * Mistake Analysis View — weak areas dashboard.
 */
import { AlertCircle, Clock, TrendingDown, Target } from 'lucide-react';
import { usePractice } from '../hooks/use-practice';

export function MistakeAnalysisView() {
  const { analysis } = usePractice();

  if (!analysis) {
    return (
      <div className="border-border bg-card/30 rounded-xl border border-dashed py-12 text-center">
        <AlertCircle className="text-muted-foreground/40 mx-auto mb-2 h-8 w-8" />
        <p className="text-muted-foreground text-sm">
          No analysis yet. Take quizzes to see your mistake analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="border-border bg-card/50 rounded-xl border p-4">
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <TrendingDown className="h-3.5 w-3.5" /> Accuracy
          </div>
          <div className="text-foreground mt-1 text-2xl font-semibold">
            {analysis.accuracyRate}%
          </div>
        </div>
        <div className="border-border bg-card/50 rounded-xl border p-4">
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <Clock className="h-3.5 w-3.5" /> Avg Time/Q
          </div>
          <div className="text-foreground mt-1 text-2xl font-semibold">
            {analysis.averageTimePerQuestion}s
          </div>
        </div>
        <div className="border-border bg-card/50 rounded-xl border p-4">
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <Target className="h-3.5 w-3.5" /> Total Wrong
          </div>
          <div className="text-destructive mt-1 text-2xl font-semibold">{analysis.totalWrong}</div>
        </div>
        <div className="border-border bg-card/50 rounded-xl border p-4">
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <AlertCircle className="h-3.5 w-3.5" /> Skipped
          </div>
          <div className="mt-1 text-2xl font-semibold text-amber-500">{analysis.totalSkipped}</div>
        </div>
      </div>

      {/* Time management */}
      {analysis.timeManagementIssues && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-amber-500">
          <Clock className="mr-1 inline h-3.5 w-3.5" /> Time management issues detected — you may be
          spending too long on individual questions.
        </div>
      )}

      {/* Weak topics */}
      {analysis.frequentlyIncorrectTopics.length > 0 && (
        <div className="border-border bg-card/50 rounded-xl border p-5">
          <h3 className="text-foreground mb-2 text-sm font-semibold">
            Frequently Incorrect Topics
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.frequentlyIncorrectTopics.map((t, i) => (
              <span
                key={i}
                className="border-destructive/20 bg-destructive/5 text-destructive rounded-full border px-3 py-1 text-xs"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Weak chapters */}
      {analysis.weakChapters.length > 0 && (
        <div className="border-border bg-card/50 rounded-xl border p-5">
          <h3 className="text-foreground mb-2 text-sm font-semibold">Weak Chapters</h3>
          <div className="flex flex-wrap gap-2">
            {analysis.weakChapters.map((t, i) => (
              <span
                key={i}
                className="rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1 text-xs text-amber-500"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
