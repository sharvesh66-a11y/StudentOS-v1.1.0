/**
 * StudentOS Exam Center — Zustand Store
 */
import { create } from 'zustand';
import type { QuizConfig } from '../types';
import { DEFAULT_QUIZ_CONFIG } from '../types';

type ExamView = 'list' | 'config' | 'playing' | 'results';

interface ExamStore {
  view: ExamView;
  config: QuizConfig;
  isGenerating: boolean;
  setView: (v: ExamView) => void;
  setConfig: (c: Partial<QuizConfig>) => void;
  setIsGenerating: (v: boolean) => void;
  reset: () => void;
}

export const useExamStore = create<ExamStore>((set) => ({
  view: 'list',
  config: DEFAULT_QUIZ_CONFIG,
  isGenerating: false,
  setView: (view) => set({ view }),
  setConfig: (config) => set((s) => ({ config: { ...s.config, ...config } })),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  reset: () => set({ view: 'list', config: DEFAULT_QUIZ_CONFIG, isGenerating: false }),
}));
