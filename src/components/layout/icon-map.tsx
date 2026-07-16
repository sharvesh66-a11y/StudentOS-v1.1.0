/**
 * StudentOS Icon Map
 *
 * Maps string icon names (used in `APP_MODULES` and `NAV_ITEMS`) to Lucide
 * React icon components. Centralized so adding a new icon is a one-line
 * change.
 *
 * @see src/lib/constants.ts — APP_MODULES uses string icon names
 * @see src/lib/nav.ts — NAV_ITEMS uses string icon names
 */

import {
  Sparkles,
  LayoutDashboard,
  ClipboardList,
  NotebookPen,
  Users,
  Target,
  GraduationCap,
  Briefcase,
  Globe,
  Settings,
  Calendar,
  TrendingUp,
  User,
  FileText,
  Layers,
  type LucideIcon,
} from 'lucide-react';

export const ICON_MAP: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  'layout-dashboard': LayoutDashboard,
  'clipboard-list': ClipboardList,
  'notebook-pen': NotebookPen,
  users: Users,
  target: Target,
  'graduation-cap': GraduationCap,
  briefcase: Briefcase,
  globe: Globe,
  settings: Settings,
  calendar: Calendar,
  'trending-up': TrendingUp,
  user: User,
  'file-text': FileText,
  layers: Layers,
};

/** Get a Lucide icon component by string name. Falls back to Sparkles. */
export function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Sparkles;
}
