'use client';

/**
 * StudentOS Junova AI — Teacher Card
 *
 * Displays a single AI teacher in the sidebar or grid. Shows avatar (initials
 * fallback), name, subject, and theme color accent. Clicking selects the
 * teacher for chatting. Includes edit/delete menu.
 */

import { memo } from 'react';
import { MoreVertical, Pencil, Trash2, MessageSquare } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { getInitials } from '@/utils/format';
import type { AITeacher } from '../../types';
import { useJunovaStore } from '../../store/junova.store';
import { useTeachers } from '../../hooks/use-teachers';

export interface TeacherCardProps {
  teacher: AITeacher;
  isActive?: boolean;
  onSelect?: (teacher: AITeacher) => void;
  variant?: 'sidebar' | 'grid';
}

/**
 * Memoized: `teacher` is the only meaningful prop (isActive + variant are
 * primitives, onSelect is a stable useCallback / zustand setter at the call
 * sites). Skips re-renders of unchanged teacher cards when the parent's
 * unrelated state changes (e.g. showTeacherSwitcher toggling).
 */
export const TeacherCard = memo(function TeacherCard({
  teacher,
  isActive,
  onSelect,
  variant = 'sidebar',
}: TeacherCardProps) {
  const { setEditingTeacher, setShowTeacherForm, setActiveTeacher } = useJunovaStore();
  const { remove } = useTeachers();

  const initials = getInitials(teacher.name) || '🤖';

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTeacher(teacher);
    setShowTeacherForm(true);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete ${teacher.name}? This cannot be undone.`)) {
      await remove(teacher.id);
    }
  };

  const handleClick = () => {
    setActiveTeacher(teacher);
    onSelect?.(teacher);
  };

  if (variant === 'grid') {
    return (
      <button
        onClick={handleClick}
        className={cn(
          'group relative overflow-hidden rounded-xl border p-5 text-left transition-all',
          isActive
            ? 'border-primary bg-primary/5 shadow-primary/5 shadow-lg'
            : 'border-border bg-card/50 hover:border-primary/40 hover:bg-card',
        )}
        style={isActive ? { borderColor: teacher.themeColor } : undefined}
      >
        {/* Accent line */}
        <div
          className="absolute top-0 left-0 h-1 w-full"
          style={{ backgroundColor: teacher.themeColor }}
        />
        <div className="flex items-start justify-between">
          <div
            className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl text-base font-semibold text-white ring-2 ring-white/10"
            style={{ backgroundColor: teacher.themeColor }}
          >
            {teacher.avatarURL ? (
              <img
                src={teacher.avatarURL}
                alt={teacher.name}
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="text-muted-foreground hover:text-foreground opacity-0 transition-opacity group-hover:opacity-100"
                aria-label={`Actions for ${teacher.name}`}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Pencil className="mr-2 h-3.5 w-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <h3 className="text-foreground mt-3 font-semibold">{teacher.name}</h3>
        <p className="text-muted-foreground text-xs">{teacher.subject}</p>
        {teacher.bio && (
          <p className="text-muted-foreground mt-2 line-clamp-2 text-xs">{teacher.bio}</p>
        )}
        <div className="text-primary mt-3 flex items-center gap-1 text-xs">
          <MessageSquare className="h-3 w-3" />
          <span>Start chatting</span>
        </div>
      </button>
    );
  }

  // Sidebar variant
  return (
    <div
      onClick={handleClick}
      className={cn(
        'group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-all',
        isActive ? 'bg-accent' : 'hover:bg-accent/50',
      )}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-semibold text-white"
        style={{ backgroundColor: teacher.themeColor }}
      >
        {teacher.avatarURL ? (
          <img src={teacher.avatarURL} alt={teacher.name} className="h-full w-full object-cover" />
        ) : (
          initials
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-foreground truncate text-sm font-medium">{teacher.name}</p>
        <p className="text-muted-foreground truncate text-xs">{teacher.subject}</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            className="text-muted-foreground hover:text-foreground opacity-0 transition-opacity group-hover:opacity-100"
            aria-label={`Actions for ${teacher.name}`}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleEdit}>
            <Pencil className="mr-2 h-3.5 w-3.5" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} className="text-destructive">
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
});
