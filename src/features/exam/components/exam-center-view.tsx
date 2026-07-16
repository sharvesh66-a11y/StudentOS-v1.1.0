'use client';
/**
 * Exam Center View — main container.
 * Orchestrates: quiz list → config → generate → play → results.
 */
import { useState } from 'react';
import { Plus, ClipboardList, Clock, TrendingUp, Trash2, Sparkles, BarChart3 } from 'lucide-react';
import { authedFetch } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { QuizConfigForm } from './quiz-config-form';
import { QuizPlayer } from './quiz-player';
import { QuizResults } from './quiz-results';
import { PracticeView } from './practice-view';
import { MistakeAnalysisView } from './mistake-analysis-view';
import { useExamStore } from '../store/exam.store';
import { useQuizzes } from '../hooks/use-quizzes';
import { useQuizAttempt } from '../hooks/use-quiz-attempt';
import type { Quiz } from '../types';
import { formatRelativeTime } from '@/utils/format';
import { DIFFICULTIES } from '../constants';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Tab = 'quizzes' | 'practice' | 'analysis';

export function ExamCenterView() {
  const { view, config, setConfig, setIsGenerating } = useExamStore();
  const { quizzes, isLoading, remove } = useQuizzes();
  const {
    activeQuiz,
    currentIndex,
    answers,
    result,
    timeRemaining,
    isSubmitting,
    startQuiz,
    setAnswer,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    submitQuiz,
    retryQuiz,
    exitQuiz,
  } = useQuizAttempt();
  const [, setGeneratedQuiz] = useState<Quiz | null>(null);
  const [tab, setTab] = useState<Tab>('quizzes');

  // Generate quiz via API
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await authedFetch('/api/exam/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...config, uid: 'placeholder' }), // uid fetched server-side from memory
      });
      const data = await response.json();
      if (data.success && data.questions) {
        const quiz: Quiz = {
          id: '',
          uid: '',
          title: `${config.subject} — ${config.chapter}`,
          subject: config.subject,
          chapter: config.chapter,
          difficulty: config.difficulty,
          questionCount: data.questions.length,
          questionTypes: config.questionTypes,
          timeLimitMinutes: config.timeLimitMinutes,
          aiGenerated: true,
          status: 'ready',
          questions: data.questions,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        // Save to Firestore
        // Note: we skip saving for now — the quiz is ephemeral until completed
        setGeneratedQuiz(quiz);
        startQuiz(quiz);
        useExamStore.getState().setView('playing');
      } else {
        toast.error('Failed to generate quiz', { description: data.error ?? 'Unknown error' });
      }
    } catch (err) {
      toast.error('Failed to generate quiz', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Results view ---
  if (view === 'playing' && result && activeQuiz) {
    return (
      <QuizResults
        quiz={activeQuiz}
        result={result}
        onRetry={retryQuiz}
        onExit={() => {
          exitQuiz();
          useExamStore.getState().setView('list');
        }}
      />
    );
  }

  // --- Playing view ---
  if (view === 'playing' && activeQuiz) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <QuizPlayer
          quiz={activeQuiz}
          currentIndex={currentIndex}
          answers={answers}
          timeRemaining={timeRemaining}
          onAnswer={setAnswer}
          onNext={nextQuestion}
          onPrev={prevQuestion}
          onNavigate={goToQuestion}
          onSubmit={submitQuiz}
          isSubmitting={isSubmitting}
        />
      </div>
    );
  }

  // --- Config view ---
  if (view === 'config') {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <QuizConfigForm
          config={config}
          onConfigChange={setConfig}
          onGenerate={handleGenerate}
          isGenerating={useExamStore.getState().isGenerating}
        />
      </div>
    );
  }

  // --- List view (default) ---
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">Exam Center</h1>
          <p className="text-muted-foreground text-sm">
            AI-generated quizzes, practice sessions, and mistake analysis.
          </p>
        </div>
        {tab === 'quizzes' && (
          <Button onClick={() => useExamStore.getState().setView('config')}>
            <Plus className="mr-2 h-4 w-4" /> New Quiz
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-border mb-6 flex gap-1 border-b">
        {[
          { id: 'quizzes' as Tab, label: 'Quizzes', icon: ClipboardList },
          { id: 'practice' as Tab, label: 'Practice', icon: Sparkles },
          { id: 'analysis' as Tab, label: 'Mistake Analysis', icon: BarChart3 },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'flex items-center gap-1.5 border-b-2 px-4 py-2 text-sm font-medium transition-colors',
              tab === id
                ? 'border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground border-transparent',
            )}
          >
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'practice' && (
        <PracticeView
          onPracticeGenerated={(quiz) => {
            startQuiz(quiz);
            useExamStore.getState().setView('playing');
          }}
        />
      )}

      {tab === 'analysis' && <MistakeAnalysisView />}

      {tab === 'quizzes' && (
        <>
          {/* Stats cards */}
          <div className="mb-6 grid grid-cols-3 gap-3">
            <div className="border-border bg-card/50 rounded-xl border p-4">
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <ClipboardList className="h-3.5 w-3.5" /> Total Quizzes
              </div>
              <div className="text-foreground mt-1 text-2xl font-semibold">{quizzes.length}</div>
            </div>
            <div className="border-border bg-card/50 rounded-xl border p-4">
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <TrendingUp className="h-3.5 w-3.5" /> Avg Score
              </div>
              <div className="text-foreground mt-1 text-2xl font-semibold">—</div>
            </div>
            <div className="border-border bg-card/50 rounded-xl border p-4">
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <Clock className="h-3.5 w-3.5" /> Time Studied
              </div>
              <div className="text-foreground mt-1 text-2xl font-semibold">—</div>
            </div>
          </div>

          {/* Quiz list */}
          {isLoading ? (
            <div className="text-muted-foreground py-12 text-center text-sm">Loading quizzes…</div>
          ) : quizzes.length === 0 ? (
            <div className="border-border bg-card/30 rounded-xl border border-dashed py-16 text-center">
              <div className="bg-primary/10 ring-primary/20 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ring-1">
                <ClipboardList className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-foreground text-sm font-semibold">No quizzes yet</h3>
              <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-sm">
                Generate your first AI quiz. Junova will create personalized questions based on your
                subjects and memory.
              </p>
              <Button className="mt-4" onClick={() => useExamStore.getState().setView('config')}>
                <Plus className="mr-2 h-4 w-4" /> Generate Your First Quiz
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {quizzes.map((quiz) => {
                const diffMeta = DIFFICULTIES.find((d) => d.value === quiz.difficulty);
                return (
                  <div
                    key={quiz.id}
                    className="group border-border bg-card/50 hover:border-primary/40 rounded-xl border p-5 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-foreground font-semibold">{quiz.title}</h3>
                        <p className="text-muted-foreground text-xs">
                          {quiz.subject} · {quiz.questionCount} questions
                        </p>
                      </div>
                      <button
                        onClick={() => remove(quiz.id)}
                        className="text-muted-foreground/40 hover:text-destructive opacity-0 transition-opacity group-hover:opacity-100"
                        aria-label={`Delete quiz: ${quiz.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-muted-foreground mt-3 flex items-center gap-3 text-xs">
                      <span className={cn('font-medium', diffMeta?.color)}>{diffMeta?.label}</span>
                      {quiz.timeLimitMinutes > 0 && <span>{quiz.timeLimitMinutes} min limit</span>}
                      <span>{formatRelativeTime(new Date(quiz.createdAt))}</span>
                    </div>
                    <Button size="sm" className="mt-4 w-full" onClick={() => startQuiz(quiz)}>
                      {quiz.status === 'completed' ? 'Retry Quiz' : 'Start Quiz'}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
