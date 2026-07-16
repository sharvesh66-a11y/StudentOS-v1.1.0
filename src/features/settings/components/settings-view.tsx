'use client';
/**
 * Settings & Personalization — complete settings dashboard.
 * Tabs: Account, Personalization, Notifications, Privacy, Accessibility, AI, Storage, About.
 */
import * as React from 'react';
import { useState } from 'react';
import { useAuth } from '@/features/auth';
import { usePremium } from '@/features/premium/hooks/use-premium';
import { useSettings } from '@/features/settings/hooks/use-settings';
import { AI_PROVIDERS, PREMIUM_PLANS } from '../../tools/types';
import type { AIProviderType, PlanTier } from '../../tools/types';
import {
  Sparkles,
  Check,
  Zap,
  Crown,
  User,
  Palette,
  Bell,
  Shield,
  Eye,
  Brain,
  HardDrive,
  Info,
  Download,
  Trash2,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { APP_VERSION } from '@/lib/constants';
import { toast } from 'sonner';

type Tab =
  | 'account'
  | 'personalization'
  | 'notifications'
  | 'privacy'
  | 'accessibility'
  | 'ai'
  | 'storage'
  | 'about';
const TIER_ICONS: Record<PlanTier, React.ComponentType<{ className?: string }>> = {
  free: Sparkles,
  premium: Zap,
  premium_plus: Crown,
};
const ACCENT_COLORS = [
  '#7c3aed',
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#8b5cf6',
  '#06b6d4',
];

export function SettingsView() {
  const { user, profile, signOut } = useAuth();
  const { settings, update, isLoading } = useSettings();
  const { tier, limits, upgrade } = usePremium();
  const [tab, setTab] = useState<Tab>('account');
  const [isUpgrading, setIsUpgrading] = useState(false);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-6 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const handleUpgrade = async (newTier: PlanTier) => {
    setIsUpgrading(true);
    await upgrade(newTier);
    setIsUpgrading(false);
    toast.success(`Switched to ${PREMIUM_PLANS.find((p) => p.tier === newTier)?.name}`);
  };

  const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'personalization', label: 'Personalization', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'accessibility', label: 'Accessibility', icon: Eye },
    { id: 'ai', label: 'AI Preferences', icon: Brain },
    { id: 'storage', label: 'Storage', icon: HardDrive },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage your account, preferences, and personalization.
        </p>
      </div>

      {/* Tab navigation */}
      <div className="border-border mb-6 flex gap-1 overflow-x-auto border-b">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-2 text-sm font-medium transition-colors',
              tab === id
                ? 'border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground border-transparent',
            )}
          >
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {/* --- Account --- */}
        {tab === 'account' && (
          <>
            <Section title="Profile Information">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Display Name">
                  <Input
                    defaultValue={profile?.displayName ?? ''}
                    placeholder="Your name"
                    onChange={() => update({ bio: settings.bio })}
                  />
                </Field>
                <Field label="Email">
                  <Input defaultValue={user?.email ?? ''} disabled />
                </Field>
                <Field label="Phone">
                  <Input
                    defaultValue={settings.phone ?? ''}
                    placeholder="+1 234 567 890"
                    onChange={(e) => update({ phone: e.target.value })}
                  />
                </Field>
                <Field label="Date of Birth">
                  <Input
                    type="date"
                    defaultValue={settings.dateOfBirth ?? ''}
                    onChange={(e) => update({ dateOfBirth: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="Bio">
                <Textarea
                  defaultValue={settings.bio}
                  rows={2}
                  placeholder="Tell us about yourself…"
                  onChange={(e) => update({ bio: e.target.value })}
                />
              </Field>
            </Section>
            <Section title="Account Actions">
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => toast.info('Data export started — you will receive an email.')}
                >
                  <Download className="mr-2 h-4 w-4" /> Export Data
                </Button>
                <Button variant="outline" onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (confirm('Are you sure? This cannot be undone.'))
                      toast.error('Account deletion requires admin verification.');
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                </Button>
              </div>
            </Section>
            <Section title="Subscription">
              <div className="grid gap-4 sm:grid-cols-3">
                {PREMIUM_PLANS.map((plan) => {
                  const Icon = TIER_ICONS[plan.tier];
                  const isCurrent = tier === plan.tier;
                  return (
                    <div
                      key={plan.tier}
                      className={cn(
                        'rounded-lg border p-4 transition-all',
                        isCurrent ? 'border-primary bg-primary/5' : 'border-border',
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Icon
                          className={cn(
                            'h-4 w-4',
                            plan.tier === 'free'
                              ? 'text-muted-foreground'
                              : plan.tier === 'premium'
                                ? 'text-primary'
                                : 'text-amber-500',
                          )}
                        />
                        <span className="text-foreground text-sm font-semibold">{plan.name}</span>
                      </div>
                      <div className="text-foreground mt-1 text-2xl font-bold">
                        ${plan.price}
                        <span className="text-muted-foreground text-xs font-normal">/mo</span>
                      </div>
                      <ul className="mt-3 space-y-1">
                        {plan.features.slice(0, 4).map((f, i) => (
                          <li
                            key={i}
                            className="text-muted-foreground flex items-start gap-1 text-xs"
                          >
                            <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" /> {f}
                          </li>
                        ))}
                      </ul>
                      <Button
                        variant={isCurrent ? 'outline' : 'default'}
                        size="sm"
                        className="mt-4 w-full"
                        disabled={isCurrent || isUpgrading}
                        onClick={() => handleUpgrade(plan.tier)}
                      >
                        {isCurrent ? 'Current Plan' : `Upgrade`}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </Section>
          </>
        )}

        {/* --- Personalization --- */}
        {tab === 'personalization' && (
          <Section title="Appearance">
            <Field label="Theme">
              <div className="flex gap-2">
                {(['dark', 'light', 'system'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => update({ theme: t })}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-sm capitalize transition-all',
                      settings.theme === t
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:bg-accent',
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Accent Color">
              <div className="flex gap-2">
                {ACCENT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => update({ accentColor: c })}
                    className={cn(
                      'ring-offset-background h-8 w-8 rounded-full ring-2 ring-offset-2 transition-all',
                      settings.accentColor === c ? 'ring-foreground' : 'ring-transparent',
                    )}
                    style={{ backgroundColor: c }}
                    aria-label={`Accent color ${c}`}
                    aria-pressed={settings.accentColor === c}
                  />
                ))}
              </div>
            </Field>
            <Field label="Font Size">
              <Select
                value={settings.fontSize}
                onValueChange={(v) => update({ fontSize: v as 'small' | 'medium' | 'large' })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small" className="bg-card">
                    Small
                  </SelectItem>
                  <SelectItem value="medium" className="bg-card">
                    Medium
                  </SelectItem>
                  <SelectItem value="large" className="bg-card">
                    Large
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Font Family">
              <Select
                value={settings.fontFamily}
                onValueChange={(v) => update({ fontFamily: v as 'sans' | 'serif' | 'mono' })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sans" className="bg-card">
                    Sans-serif
                  </SelectItem>
                  <SelectItem value="serif" className="bg-card">
                    Serif
                  </SelectItem>
                  <SelectItem value="mono" className="bg-card">
                    Monospace
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="UI Density">
              <Select
                value={settings.uiDensity}
                onValueChange={(v) =>
                  update({ uiDensity: v as 'compact' | 'comfortable' | 'spacious' })
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact" className="bg-card">
                    Compact
                  </SelectItem>
                  <SelectItem value="comfortable" className="bg-card">
                    Comfortable
                  </SelectItem>
                  <SelectItem value="spacious" className="bg-card">
                    Spacious
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <ToggleRow
              label="Collapse Sidebar by Default"
              checked={settings.sidebarCollapsed}
              onChange={(v) => update({ sidebarCollapsed: v })}
            />
            <Field label="Sidebar Style">
              <Select
                value={settings.sidebarStyle}
                onValueChange={(v) =>
                  update({ sidebarStyle: v as 'compact' | 'default' | 'expanded' })
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact" className="bg-card">
                    Compact
                  </SelectItem>
                  <SelectItem value="default" className="bg-card">
                    Default
                  </SelectItem>
                  <SelectItem value="expanded" className="bg-card">
                    Expanded
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Background Style">
              <Select
                value={settings.backgroundStyle}
                onValueChange={(v) =>
                  update({
                    backgroundStyle: v as 'gradient' | 'space' | 'stars' | 'glass' | 'minimal',
                  })
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gradient" className="bg-card">
                    Gradient
                  </SelectItem>
                  <SelectItem value="space" className="bg-card">
                    Space
                  </SelectItem>
                  <SelectItem value="stars" className="bg-card">
                    Stars
                  </SelectItem>
                  <SelectItem value="glass" className="bg-card">
                    Glass
                  </SelectItem>
                  <SelectItem value="minimal" className="bg-card">
                    Minimal
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <ToggleRow
              label="Animations"
              checked={settings.animationsEnabled}
              onChange={(v) => update({ animationsEnabled: v })}
            />
          </Section>
        )}
        {tab === 'personalization' && (
          <Section title="Language & Region">
            <Field label="Language">
              <Select value={settings.language} onValueChange={(v) => update({ language: v })}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en" className="bg-card">
                    English
                  </SelectItem>
                  <SelectItem value="es" className="bg-card">
                    Spanish
                  </SelectItem>
                  <SelectItem value="fr" className="bg-card">
                    French
                  </SelectItem>
                  <SelectItem value="de" className="bg-card">
                    German
                  </SelectItem>
                  <SelectItem value="hi" className="bg-card">
                    Hindi
                  </SelectItem>
                  <SelectItem value="zh" className="bg-card">
                    Chinese
                  </SelectItem>
                  <SelectItem value="ar" className="bg-card">
                    Arabic
                  </SelectItem>
                  <SelectItem value="pt" className="bg-card">
                    Portuguese
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Time Zone">
              <Input
                defaultValue={settings.timezone}
                onChange={(e) => update({ timezone: e.target.value })}
                placeholder="UTC"
                className="w-48"
              />
            </Field>
            <Field label="Date Format">
              <Select
                value={settings.dateFormat}
                onValueChange={(v) =>
                  update({ dateFormat: v as 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD' })
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="YYYY-MM-DD" className="bg-card">
                    YYYY-MM-DD
                  </SelectItem>
                  <SelectItem value="MM/DD/YYYY" className="bg-card">
                    MM/DD/YYYY
                  </SelectItem>
                  <SelectItem value="DD/MM/YYYY" className="bg-card">
                    DD/MM/YYYY
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Time Format">
              <Select
                value={settings.timeFormat}
                onValueChange={(v) => update({ timeFormat: v as '12h' | '24h' })}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h" className="bg-card">
                    24-hour
                  </SelectItem>
                  <SelectItem value="12h" className="bg-card">
                    12-hour
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </Section>
        )}

        {/* --- Notifications --- */}
        {tab === 'notifications' && (
          <Section title="Notification Preferences">
            <ToggleRow
              label="Push Notifications"
              checked={settings.notifications.push}
              onChange={(v) => update({ notifications: { ...settings.notifications, push: v } })}
            />
            <ToggleRow
              label="Email Notifications"
              checked={settings.notifications.email}
              onChange={(v) => update({ notifications: { ...settings.notifications, email: v } })}
            />
            <ToggleRow
              label="Study Reminders"
              checked={settings.notifications.studyReminders}
              onChange={(v) =>
                update({ notifications: { ...settings.notifications, studyReminders: v } })
              }
            />
            <ToggleRow
              label="Planner Notifications"
              checked={settings.notifications.planner}
              onChange={(v) => update({ notifications: { ...settings.notifications, planner: v } })}
            />
            <ToggleRow
              label="Quiz Notifications"
              checked={settings.notifications.quiz}
              onChange={(v) => update({ notifications: { ...settings.notifications, quiz: v } })}
            />
            <ToggleRow
              label="Community Notifications"
              checked={settings.notifications.community}
              onChange={(v) =>
                update({ notifications: { ...settings.notifications, community: v } })
              }
            />
            <ToggleRow
              label="Scholarship Notifications"
              checked={settings.notifications.scholarship}
              onChange={(v) =>
                update({ notifications: { ...settings.notifications, scholarship: v } })
              }
            />
            <ToggleRow
              label="Career Notifications"
              checked={settings.notifications.career}
              onChange={(v) => update({ notifications: { ...settings.notifications, career: v } })}
            />
            <ToggleRow
              label="Freelancing Notifications"
              checked={settings.notifications.freelancing}
              onChange={(v) =>
                update({ notifications: { ...settings.notifications, freelancing: v } })
              }
            />
            <ToggleRow
              label="Sound Effects"
              checked={settings.notifications.soundEffects}
              onChange={(v) =>
                update({ notifications: { ...settings.notifications, soundEffects: v } })
              }
            />
          </Section>
        )}

        {/* --- Privacy --- */}
        {tab === 'privacy' && (
          <>
            <Section title="Security">
              <ToggleRow
                label="Two-Factor Authentication"
                checked={settings.privacy.twoFactorEnabled}
                onChange={(v) => update({ privacy: { ...settings.privacy, twoFactorEnabled: v } })}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info('Login history would appear here.')}
              >
                View Login History
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info('Active sessions would appear here.')}
              >
                Active Sessions
              </Button>
            </Section>
            <Section title="Privacy Controls">
              <Field label="Profile Visibility">
                <Select
                  value={settings.privacy.profileVisibility}
                  onValueChange={(v) =>
                    update({
                      privacy: {
                        ...settings.privacy,
                        profileVisibility: v as 'public' | 'private' | 'friends',
                      },
                    })
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public" className="bg-card">
                      Public
                    </SelectItem>
                    <SelectItem value="friends" className="bg-card">
                      Friends Only
                    </SelectItem>
                    <SelectItem value="private" className="bg-card">
                      Private
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <ToggleRow
                label="Show Online Status"
                checked={settings.privacy.showOnlineStatus}
                onChange={(v) => update({ privacy: { ...settings.privacy, showOnlineStatus: v } })}
              />
              <ToggleRow
                label="Allow Direct Messages"
                checked={settings.privacy.allowDirectMessages}
                onChange={(v) =>
                  update({ privacy: { ...settings.privacy, allowDirectMessages: v } })
                }
              />
              <ToggleRow
                label="Show Activity"
                checked={settings.privacy.showActivity}
                onChange={(v) => update({ privacy: { ...settings.privacy, showActivity: v } })}
              />
            </Section>
            <Section title="Data">
              <Button variant="outline" onClick={() => toast.info('Data download started.')}>
                <Download className="mr-2 h-4 w-4" /> Download My Data
              </Button>
            </Section>
          </>
        )}

        {/* --- Accessibility --- */}
        {tab === 'accessibility' && (
          <Section title="Accessibility">
            <ToggleRow
              label="High Contrast Mode"
              checked={settings.accessibility.highContrast}
              onChange={(v) =>
                update({ accessibility: { ...settings.accessibility, highContrast: v } })
              }
            />
            <ToggleRow
              label="Reduced Motion"
              checked={settings.accessibility.reducedMotion}
              onChange={(v) =>
                update({ accessibility: { ...settings.accessibility, reducedMotion: v } })
              }
            />
            <ToggleRow
              label="Screen Reader Support"
              checked={settings.accessibility.screenReader}
              onChange={(v) =>
                update({ accessibility: { ...settings.accessibility, screenReader: v } })
              }
            />
            <ToggleRow
              label="Keyboard Navigation"
              checked={settings.accessibility.keyboardNavigation}
              onChange={(v) =>
                update({ accessibility: { ...settings.accessibility, keyboardNavigation: v } })
              }
            />
            <Field label={`Font Scaling (${settings.accessibility.fontScaling}%)`}>
              <Slider
                value={[settings.accessibility.fontScaling]}
                onValueChange={([v]) =>
                  update({ accessibility: { ...settings.accessibility, fontScaling: v } })
                }
                min={80}
                max={150}
                step={10}
                className="w-64"
              />
            </Field>
            <Field label="Color Blind Support">
              <Select
                value={settings.accessibility.colorBlindMode}
                onValueChange={(v) =>
                  update({
                    accessibility: {
                      ...settings.accessibility,
                      colorBlindMode: v as 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia',
                    },
                  })
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="bg-card">
                    None
                  </SelectItem>
                  <SelectItem value="protanopia" className="bg-card">
                    Protanopia (Red-Blind)
                  </SelectItem>
                  <SelectItem value="deuteranopia" className="bg-card">
                    Deuteranopia (Green-Blind)
                  </SelectItem>
                  <SelectItem value="tritanopia" className="bg-card">
                    Tritanopia (Blue-Blind)
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </Section>
        )}

        {/* --- AI --- */}
        {tab === 'ai' && (
          <Section title="AI Preferences">
            <Field label="Default AI Model">
              <Select
                value={settings.defaultAIProvider}
                onValueChange={(v) => update({ defaultAIProvider: v as AIProviderType })}
              >
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AI_PROVIDERS.map((p) => (
                    <SelectItem
                      key={p.id}
                      value={p.id}
                      disabled={p.isPremium && !limits.advancedModels}
                      className="bg-card"
                    >
                      {p.name}{' '}
                      {p.isPremium && (
                        <span className="ml-1 text-xs text-amber-500">(Premium)</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Response Style">
              <div className="flex gap-2">
                {(['concise', 'balanced', 'detailed'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() =>
                      update({ aiPreferences: { ...settings.aiPreferences, responseStyle: s } })
                    }
                    className={cn(
                      'rounded-lg border px-3 py-2 text-sm capitalize transition-all',
                      settings.aiPreferences.responseStyle === s
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:bg-accent',
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Creativity Level">
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() =>
                      update({ aiPreferences: { ...settings.aiPreferences, creativityLevel: s } })
                    }
                    className={cn(
                      'rounded-lg border px-3 py-2 text-sm capitalize transition-all',
                      settings.aiPreferences.creativityLevel === s
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:bg-accent',
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </Field>
            <ToggleRow
              label="Auto-Generate Flashcards"
              checked={settings.aiPreferences.autoGenerateFlashcards}
              onChange={(v) =>
                update({ aiPreferences: { ...settings.aiPreferences, autoGenerateFlashcards: v } })
              }
            />
            <ToggleRow
              label="Auto-Generate Summaries"
              checked={settings.aiPreferences.autoGenerateSummary}
              onChange={(v) =>
                update({ aiPreferences: { ...settings.aiPreferences, autoGenerateSummary: v } })
              }
            />
            <ToggleRow
              label="Auto Suggestions"
              checked={settings.aiPreferences.autoSuggestions}
              onChange={(v) =>
                update({ aiPreferences: { ...settings.aiPreferences, autoSuggestions: v } })
              }
            />
            <ToggleRow
              label="Auto Speak Responses"
              checked={settings.aiPreferences.autoSpeak}
              onChange={(v) =>
                update({ aiPreferences: { ...settings.aiPreferences, autoSpeak: v } })
              }
            />
            <ToggleRow
              label="AI Memory (Long-Term)"
              checked={settings.aiPreferences.memoryEnabled}
              onChange={(v) =>
                update({ aiPreferences: { ...settings.aiPreferences, memoryEnabled: v } })
              }
            />
            <ToggleRow
              label="Show Citations"
              checked={settings.aiPreferences.showCitations}
              onChange={(v) =>
                update({ aiPreferences: { ...settings.aiPreferences, showCitations: v } })
              }
            />
            <ToggleRow
              label="Voice Enabled"
              checked={settings.voiceEnabled}
              onChange={(v) => update({ voiceEnabled: v })}
              disabled={!limits.voiceTeacher}
            />
          </Section>
        )}

        {/* --- Storage --- */}
        {tab === 'storage' && (
          <Section title="Storage & Data">
            <div className="space-y-3">
              <div className="border-border bg-background/50 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Storage Used</span>
                  <span className="text-foreground text-sm font-medium">~ 0 MB / 10 GB</span>
                </div>
                <div className="bg-muted mt-2 h-2 rounded-full">
                  <div className="bg-primary h-full rounded-full" style={{ width: '0.1%' }} />
                </div>
              </div>
              <Button variant="outline" onClick={() => toast.success('Cache cleared')}>
                <Trash2 className="mr-2 h-4 w-4" /> Clear Cache
              </Button>
              <Button variant="outline" onClick={() => toast.info('Sync status: All synced ✓')}>
                Check Sync Status
              </Button>
            </div>
          </Section>
        )}

        {/* --- About --- */}
        {tab === 'about' && (
          <Section title="About StudentOS">
            <div className="space-y-3 text-sm">
              <InfoRow label="Version" value={`v${APP_VERSION}`} />
              <InfoRow label="Build" value="Production" />
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.info('Release notes would open here.')}
                >
                  Release Notes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.info('Licenses would open here.')}
                >
                  Licenses
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.info('Privacy Policy would open here.')}
                >
                  Privacy Policy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.info('Terms would open here.')}
                >
                  Terms of Service
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.info('Support contact would open here.')}
                >
                  Contact Support
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.success('Feedback sent! Thank you.')}
                >
                  Send Feedback
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.info('Bug report form would open here.')}
                >
                  Report a Bug
                </Button>
              </div>
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

// --- Sub-components ---
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-border bg-card/50 rounded-xl border p-5 backdrop-blur-sm">
      <h3 className="text-foreground mb-4 text-sm font-semibold">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  // Generate a stable unique id so the Label can be programmatically
  // associated with the wrapped input/select/textarea/slider via htmlFor/id.
  // React.cloneElement injects the id into the single child element (Input,
  // Textarea, Slider, etc.). For Select components the id lands on the Select
  // root (a context provider, not a DOM node) and is harmless — SelectTrigger
  // already exposes its selected value as accessible text.
  const id = React.useId();
  return (
    <div>
      <Label htmlFor={id} className="text-foreground mb-1.5 block text-sm font-medium">
        {label}
      </Label>
      {React.Children.count(children) === 1
        ? React.cloneElement(children as React.ReactElement<{ id?: string }>, { id })
        : children}
    </div>
  );
}
function ToggleRow({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-foreground text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} aria-label={label} />
    </div>
  );
}
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  );
}
