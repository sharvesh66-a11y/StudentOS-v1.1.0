/**
 * StudentOS Planner — Zustand Store
 *
 * Holds the active plan, selected date, and current view mode.
 */

import { create } from 'zustand';
import type { PlannerView } from '../types';

interface PlannerStore {
  selectedDate: string;
  view: PlannerView;
  showGenerateDialog: boolean;

  setSelectedDate: (date: string) => void;
  setView: (view: PlannerView) => void;
  setShowGenerateDialog: (show: boolean) => void;
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export const usePlannerStore = create<PlannerStore>((set) => ({
  selectedDate: todayISO(),
  view: 'today',
  showGenerateDialog: false,

  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setView: (view) => set({ view }),
  setShowGenerateDialog: (showGenerateDialog) => set({ showGenerateDialog: showGenerateDialog }),
}));
