'use client';

/**
 * StudentOS Planner — Main Planner View
 *
 * The main planner container. Switches between Today, Calendar, and Timeline
 * views. Includes the AI generate button, goals, countdown, and revision cards.
 */

import { Sparkles, Calendar, List, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlanner } from '../hooks/use-planner';
import { useGoals } from '../hooks/use-goals';
import { usePlannerStore } from '../store/planner.store';
import { TodayTasks } from './today-tasks';
import { CalendarView } from './calendar-view';
import { TimelineView } from './timeline-view';
import { GoalsCard } from './goals-card';
import { CountdownWidget } from './countdown-widget';
import { PLANNER_VIEWS } from '../constants';
import { cn } from '@/lib/utils';

export function PlannerView() {
  const { sessions, isLoading, isGenerating, generateAIPlan, updateSessionStatus } = usePlanner();
  const { goals, revisions, updateProgress, completeRevision } = useGoals();
  const { view, setView, selectedDate, setSelectedDate } = usePlannerStore();

  const todaySessions = sessions.filter((s) => s.date === selectedDate);

  const handleGenerate = async () => {
    // In a real app, memory would come from useMemory hook.
    // For now, use minimal defaults.
    const today = new Date();
    const weekLater = new Date();
    weekLater.setDate(weekLater.getDate() + 7);

    await generateAIPlan({
      memory: {
        uid: '',
        displayName: null,
        grade: null,
        learningStyle: null,
        preferredLanguage: 'en',
        studyPreferences: {
          preferredStudyTime: null,
          sessionLengthMinutes: 25,
          breakFrequencyMinutes: 5,
          prefersDetailedExplanations: true,
          prefersExamplesFirst: false,
        },
        subjects: ['Mathematics', 'Physics'],
        weakTopics: ['Calculus', "Newton's Laws"],
        strongTopics: ['Algebra'],
        examGoals: [],
        dailyRoutine: null,
        conversationSummary: null,
        recentTopics: [],
        revisionHistory: [],
        favoriteTeacherId: null,
        createdAt: 0,
        updatedAt: 0,
        lastSummaryUpdate: null,
      },
      startDate: today.toISOString().split('T')[0],
      endDate: weekLater.toISOString().split('T')[0],
      dailyAvailableMinutes: 180,
      preferredStartTime: '09:00',
      preferredEndTime: '12:00',
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            Smart Study Planner
          </h1>
          <p className="text-muted-foreground text-sm">
            AI-powered study scheduling with Junova AI.
          </p>
        </div>
        <Button onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate AI Plan
            </>
          )}
        </Button>
      </div>

      {/* View tabs */}
      <div className="mb-6 flex gap-2">
        {PLANNER_VIEWS.map((v) => (
          <button
            key={v.value}
            onClick={() => setView(v.value)}
            className={cn(
              'flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all',
              view === v.value
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:bg-accent',
            )}
          >
            {v.value === 'today' && <List className="h-4 w-4" />}
            {v.value === 'calendar' && <Calendar className="h-4 w-4" />}
            {v.value === 'timeline' && <Clock className="h-4 w-4" />}
            {v.label}
          </button>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : view === 'today' ? (
            <TodayTasks sessions={todaySessions} onToggleStatus={updateSessionStatus} />
          ) : view === 'calendar' ? (
            <CalendarView
              sessions={sessions}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          ) : (
            <TimelineView sessions={todaySessions} onToggleStatus={updateSessionStatus} />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <CountdownWidget
            sessions={sessions}
            revisions={revisions}
            onCompleteRevision={completeRevision}
          />
          <GoalsCard goals={goals} onUpdateProgress={updateProgress} />
        </div>
      </div>
    </div>
  );
}
