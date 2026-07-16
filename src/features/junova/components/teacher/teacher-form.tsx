'use client';

/**
 * StudentOS Junova AI — Teacher Form
 *
 * Create or edit an AI Teacher. Includes name, avatar (URL), subject,
 * personality preset, teaching style, bio, theme color, and the DNA editor.
 *
 * When a preset is selected, the DNA is loaded from the preset. Switching to
 * "custom" preserves the current DNA.
 *
 * @see src/features/junova/schemas/teacher.schema.ts
 * @see src/features/junova/components/teacher/teacher-dna-editor.tsx
 */

import { useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Upload, X, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea as TextareaComponent } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TeacherDNAEditor } from './teacher-dna-editor';
import {
  teacherFormSchema,
  DEFAULT_TEACHER_FORM,
  type TeacherFormValues,
} from '../../schemas/teacher.schema';
import { PERSONALITY_PRESETS, TEACHING_STYLES, SUBJECTS, THEME_COLORS } from '../../constants';
import type { AITeacher } from '../../types';
import { useTeachers } from '../../hooks/use-teachers';
import { useJunovaStore } from '../../store/junova.store';
import { uploadFile } from '@/firebase';
import { getInitials } from '@/utils/format';
import { cn } from '@/lib/utils';

export interface TeacherFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTeacher?: AITeacher | null;
}

export function TeacherForm({ open, onOpenChange, editingTeacher }: TeacherFormProps) {
  const { create, update } = useTeachers();
  const { setEditingTeacher } = useJunovaStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: editingTeacher
      ? {
          name: editingTeacher.name,
          avatarURL: editingTeacher.avatarURL,
          subject: editingTeacher.subject,
          preset: editingTeacher.preset,
          teachingStyle: editingTeacher.teachingStyle,
          bio: editingTeacher.bio,
          themeColor: editingTeacher.themeColor,
          dna: editingTeacher.dna,
        }
      : DEFAULT_TEACHER_FORM,
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const selectedPreset = watch('preset');
  const selectedColor = watch('themeColor');
  const dna = watch('dna');
  const avatarURL = watch('avatarURL');
  const teacherName = watch('name');

  // Avatar upload handler — validates type + size, uploads to Firebase Storage
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type', {
        description: 'Please upload an image file (JPEG, PNG, WebP, GIF).',
      });
      return;
    }

    // Validate size (5 MB max)
    const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_AVATAR_SIZE) {
      toast.error('File too large', { description: 'Avatar must be under 5 MB.' });
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const path = `junova-teachers/avatars/${Date.now()}-${file.name}`;
      const result = await uploadFile(path, file, {
        contentType: file.type,
        customMetadata: { purpose: 'teacher-avatar' },
      });

      if (result.success && result.data) {
        setValue('avatarURL', result.data);
        toast.success('Avatar uploaded');
      } else if (result.error) {
        toast.error('Upload failed', { description: result.error.message });
      }
    } catch (err) {
      toast.error('Upload failed', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = () => {
    setValue('avatarURL', null);
  };

  // When preset changes, load the preset's DNA
  const handlePresetChange = (preset: TeacherFormValues['preset']) => {
    setValue('preset', preset);
    if (preset !== 'custom') {
      setValue('dna', PERSONALITY_PRESETS[preset].dna);
    }
  };

  const onSubmit = async (values: TeacherFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: values.name,
        avatarURL: values.avatarURL ?? null,
        subject: values.subject,
        preset: values.preset,
        teachingStyle: values.teachingStyle,
        bio: values.bio,
        themeColor: values.themeColor,
        dna: values.dna,
      };
      if (editingTeacher) {
        await update(editingTeacher.id, payload);
      } else {
        await create(payload);
      }
      setEditingTeacher(null);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingTeacher ? 'Edit Teacher' : 'Create AI Teacher'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Avatar + Name */}
          <div className="flex gap-4">
            {/* Avatar upload */}
            <div className="shrink-0">
              <Label className="mb-2 block">Avatar</Label>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <div className="relative">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar || isSubmitting}
                  className="border-border hover:border-primary/40 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-colors disabled:opacity-50"
                  style={selectedColor ? { borderColor: `${selectedColor}40` } : undefined}
                  aria-label="Upload avatar"
                >
                  {avatarURL ? (
                    <img
                      src={avatarURL}
                      alt="Teacher avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : isUploadingAvatar ? (
                    <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
                  ) : teacherName ? (
                    <span className="text-xl font-semibold" style={{ color: selectedColor }}>
                      {getInitials(teacherName) || '🤖'}
                    </span>
                  ) : (
                    <div className="text-muted-foreground flex flex-col items-center gap-1">
                      <ImageIcon className="h-5 w-5" />
                      <Upload className="h-3 w-3" />
                    </div>
                  )}
                </button>
                {avatarURL && !isUploadingAvatar && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="bg-destructive text-destructive-foreground absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110"
                    aria-label="Remove avatar"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              <p className="text-muted-foreground mt-1 text-center text-[10px]">
                {avatarURL ? 'Click to replace' : '5 MB max'}
              </p>
            </div>

            {/* Name */}
            <div className="flex-1 space-y-2">
              <Label htmlFor="name">Teacher Name</Label>
              <Input id="name" placeholder="e.g. Professor Chen" {...register('name')} />
              {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
            </div>
          </div>

          {/* Subject + Teaching Style */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="teacher-subject">Subject</Label>
              <Controller
                control={control}
                name="subject"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="teacher-subject">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.subject && (
                <p className="text-destructive text-xs">{errors.subject.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="teacher-style">Teaching Style</Label>
              <Controller
                control={control}
                name="teachingStyle"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="teacher-style">
                      <SelectValue placeholder="Select a style" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TEACHING_STYLES).map(([key, meta]) => (
                        <SelectItem key={key} value={key}>
                          {meta.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Personality preset */}
          <div className="space-y-2">
            <Label>Personality Preset</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {Object.entries(PERSONALITY_PRESETS).map(([key, meta]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handlePresetChange(key as TeacherFormValues['preset'])}
                  className={cn(
                    'rounded-lg border p-3 text-left transition-all',
                    selectedPreset === key
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-accent',
                  )}
                >
                  <div className="text-foreground text-sm font-medium">{meta.label}</div>
                  <div className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">
                    {meta.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Biography (optional)</Label>
            <TextareaComponent
              id="bio"
              placeholder="A short description of your teacher's background and approach..."
              rows={2}
              maxLength={300}
              {...register('bio')}
            />
            {errors.bio && <p className="text-destructive text-xs">{errors.bio.message}</p>}
          </div>

          {/* Theme color */}
          <div className="space-y-2">
            <Label>Theme Color</Label>
            <div className="flex flex-wrap gap-2">
              {THEME_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('themeColor', color)}
                  className={cn(
                    'ring-offset-background h-9 w-9 rounded-full ring-2 ring-offset-2 transition-all',
                    selectedColor === color ? 'ring-foreground' : 'ring-transparent',
                  )}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          {/* DNA Editor */}
          <div className="border-border bg-card/50 rounded-xl border p-4">
            <TeacherDNAEditor dna={dna} onChange={(newDna) => setValue('dna', newDna)} />
          </div>

          {/* Footer */}
          <div className="border-border flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingTeacher ? 'Saving…' : 'Creating…'}
                </>
              ) : editingTeacher ? (
                'Save Changes'
              ) : (
                'Create Teacher'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
