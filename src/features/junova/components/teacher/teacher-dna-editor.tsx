'use client';

/**
 * StudentOS Junova AI — Teacher DNA Editor
 *
 * Visual editor for the 11 DNA traits. Sliders for 0–100 traits, switches
 * for boolean traits, and a difficulty selector. Used inside the teacher form.
 *
 * @see src/features/junova/constants.ts — DNA_TRAITS, DIFFICULTY_LEVELS
 */

import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DNA_TRAITS, DIFFICULTY_LEVELS } from '../../constants';
import type { TeacherDNA } from '../../types';
import { cn } from '@/lib/utils';

export interface TeacherDNAEditorProps {
  dna: TeacherDNA;
  onChange: (dna: TeacherDNA) => void;
  className?: string;
}

export function TeacherDNAEditor({ dna, onChange, className }: TeacherDNAEditorProps) {
  const updateTrait = (
    key: keyof TeacherDNA,
    value: number | boolean | TeacherDNA['difficulty'],
  ) => {
    onChange({ ...dna, [key]: value });
  };

  return (
    <div className={cn('space-y-5', className)}>
      <div>
        <h3 className="text-foreground text-sm font-semibold">Teacher DNA</h3>
        <p className="text-muted-foreground mt-0.5 text-xs">
          Fine-tune your AI teacher&apos;s personality. Every response uses this configuration.
        </p>
      </div>

      {/* Difficulty level */}
      <div className="space-y-2">
        <Label className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
          Difficulty Level
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {DIFFICULTY_LEVELS.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => updateTrait('difficulty', level.value)}
              className={cn(
                'rounded-lg border px-3 py-2 text-center transition-all',
                dna.difficulty === level.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-background/50 text-muted-foreground hover:bg-accent',
              )}
            >
              <div className="text-sm font-medium">{level.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Numeric traits (sliders) */}
      <div className="space-y-4">
        {DNA_TRAITS.filter((t) => !t.isBoolean).map((trait) => {
          const value = dna[trait.key] as number;
          return (
            <div key={trait.key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-foreground text-sm font-medium">{trait.label}</Label>
                <span className="text-muted-foreground font-mono text-xs">{value}</span>
              </div>
              <p className="text-muted-foreground text-xs">{trait.description}</p>
              <Slider
                value={[value]}
                onValueChange={([v]) => updateTrait(trait.key, v)}
                min={0}
                max={100}
                step={5}
                aria-label={trait.label}
                className="mt-2"
              />
            </div>
          );
        })}
      </div>

      {/* Boolean traits (switches) */}
      <div className="border-border space-y-3 border-t pt-4">
        {DNA_TRAITS.filter((t) => t.isBoolean).map((trait) => {
          const value = dna[trait.key] as boolean;
          return (
            <div key={trait.key} className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <Label className="text-foreground text-sm font-medium">{trait.label}</Label>
                <p className="text-muted-foreground text-xs">{trait.description}</p>
              </div>
              <Switch
                checked={value}
                onCheckedChange={(v) => updateTrait(trait.key, v)}
                aria-label={trait.label}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
