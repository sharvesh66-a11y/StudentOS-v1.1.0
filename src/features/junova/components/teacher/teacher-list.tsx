'use client';

/**
 * StudentOS Junova AI — Teacher List
 *
 * Shows the user's AI teachers in a grid. Includes a "Create Teacher" button
 * and handles the empty state. Uses the teacher form dialog for creation/editing.
 */

import { Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TeacherCard } from './teacher-card';
import { TeacherForm } from './teacher-form';
import { useTeachers } from '../../hooks/use-teachers';
import { useJunovaStore } from '../../store/junova.store';
import { Loader2 } from 'lucide-react';

export function TeacherList() {
  const { teachers, isLoading } = useTeachers();
  const { showTeacherForm, setShowTeacherForm, editingTeacher, setActiveTeacher } =
    useJunovaStore();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground text-lg font-semibold">AI Teachers</h2>
          <p className="text-muted-foreground text-sm">
            Create unlimited AI teachers, each with their own personality.
          </p>
        </div>
        <Button
          onClick={() => {
            useJunovaStore.getState().setEditingTeacher(null);
            setShowTeacherForm(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Teacher
        </Button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && teachers.length === 0 && (
        <div className="border-border bg-card/30 rounded-xl border border-dashed py-16 text-center">
          <div className="bg-primary/10 ring-primary/20 mx-auto flex h-12 w-12 items-center justify-center rounded-full ring-1">
            <Sparkles className="text-primary h-6 w-6" />
          </div>
          <h3 className="text-foreground mt-4 text-sm font-semibold">No teachers yet</h3>
          <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-sm">
            Create your first AI teacher to start chatting. Choose a personality preset or customize
            every trait with Teacher DNA.
          </p>
          <Button
            className="mt-4"
            onClick={() => {
              useJunovaStore.getState().setEditingTeacher(null);
              setShowTeacherForm(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Teacher
          </Button>
        </div>
      )}

      {/* Teacher grid */}
      {!isLoading && teachers.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher) => (
            <TeacherCard
              key={teacher.id}
              teacher={teacher}
              variant="grid"
              onSelect={setActiveTeacher}
            />
          ))}
        </div>
      )}

      {/* Form dialog */}
      <TeacherForm
        open={showTeacherForm}
        onOpenChange={setShowTeacherForm}
        editingTeacher={editingTeacher}
      />
    </div>
  );
}
