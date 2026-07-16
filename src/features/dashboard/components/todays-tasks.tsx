'use client';

/**
 * Today's Tasks Card
 *
 * Checklist of tasks due today. Check/uncheck, progress bar, link to planner.
 */

import Link from 'next/link';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface Task {
  id: string;
  title: string;
  subject: string;
  done: boolean;
}

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Review Chemistry Chapter 5', subject: 'Chemistry', done: true },
  { id: '2', title: 'Math practice problems 1-10', subject: 'Math', done: true },
  { id: '3', title: 'Physics lab report draft', subject: 'Physics', done: false },
  { id: '4', title: 'History essay outline', subject: 'History', done: false },
  { id: '5', title: 'Spanish vocab review', subject: 'Spanish', done: false },
];

import { useState } from 'react';

export function TodaysTasks() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const doneCount = tasks.filter((t) => t.done).length;
  const progress = (doneCount / tasks.length) * 100;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-muted-foreground text-sm font-medium">
          Today&apos;s Tasks
        </CardTitle>
        <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
          <Link href="/planner">
            View all
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {/* Progress */}
        <div className="mb-4 flex items-center gap-3">
          <Progress value={progress} className="h-2 flex-1" />
          <span className="text-muted-foreground text-xs font-medium">
            {doneCount}/{tasks.length}
          </span>
        </div>

        {/* Task list */}
        <div className="space-y-1.5">
          {tasks.slice(0, 5).map((task) => (
            <button
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className="hover:bg-muted/40 flex w-full items-center gap-2 rounded-md p-1.5 text-left transition-colors"
            >
              {task.done ? (
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-400" />
              ) : (
                <Circle className="text-muted-foreground h-4 w-4 flex-shrink-0" />
              )}
              <div className="flex-1 overflow-hidden">
                <div
                  className={`truncate text-sm ${task.done ? 'text-muted-foreground line-through' : ''}`}
                >
                  {task.title}
                </div>
                <div className="text-muted-foreground text-[10px]">{task.subject}</div>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
