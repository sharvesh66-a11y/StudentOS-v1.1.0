'use client';
/**
 * StudentOS Analytics — Analytics Dashboard
 * Full analytics + gamification view with charts, streaks, achievements, challenges.
 */
import { useMemo } from 'react';
import {
  Flame,
  Trophy,
  Zap,
  Crown,
  Award,
  TrendingUp,
  Clock,
  Target,
  Sparkles,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useAnalytics } from '../hooks/use-analytics';
import { gamificationService } from '../services/gamification.service';
import type { AchievementRarity } from '../types';

const RARITY_COLORS: Record<AchievementRarity, string> = {
  common: '#6b7280',
  rare: '#3b82f6',
  epic: '#7c3aed',
  legendary: '#f59e0b',
};

const CHART_COLORS = [
  '#7c3aed',
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#8b5cf6',
  '#06b6d4',
];

export function AnalyticsDashboard() {
  const { summary, streak, achievements, challenges, levelInfo, isLoading } = useAnalytics();

  const weeklyChart = useMemo(() => {
    if (!summary) return [];
    return summary.weeklyData.map((d) => ({
      date: d.date.slice(5),
      study: Math.round((d.studyTimeMinutes / 60) * 10) / 10,
      xp: d.xpEarned,
    }));
  }, [summary]);

  const activityPie = useMemo(() => {
    if (!summary) return [];
    return [
      { name: 'Study Time', value: summary.totalStudyMinutes },
      { name: 'Quizzes', value: summary.totalQuizzes * 10 },
      { name: 'Practice', value: summary.totalPractice * 10 },
      { name: 'Notes', value: summary.totalNotes * 5 },
      { name: 'AI Chats', value: summary.totalAIChats * 3 },
    ].filter((d) => d.value > 0);
  }, [summary]);

  if (isLoading) {
    return (
      <div className="text-muted-foreground py-12 text-center text-sm">Loading analytics…</div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          Progress Analytics
        </h1>
        <p className="text-muted-foreground text-sm">
          Track your learning journey with AI-powered insights and gamification.
        </p>
      </div>

      {/* Top stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={Flame}
          label="Day Streak"
          value={streak?.currentStreak ?? 0}
          color="text-amber-500"
        />
        <StatCard
          icon={Zap}
          label="Total XP"
          value={levelInfo ? levelInfo.currentXP + (levelInfo.level - 1) * 100 : 0}
          color="text-primary"
        />
        <StatCard icon={TrendingUp} label="Level" value={levelInfo.level} color="text-secondary" />
        <StatCard
          icon={Target}
          label="Exam Ready"
          value={`${summary?.examReadiness ?? 0}%`}
          color="text-emerald-500"
        />
      </div>

      {/* Level progress */}
      <div className="border-border bg-card/50 rounded-xl border p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-foreground text-sm font-semibold">Level {levelInfo.level}</h3>
            <p className="text-muted-foreground text-xs">
              {levelInfo.currentXP} / {levelInfo.xpForNextLevel} XP to Level {levelInfo.level + 1}
            </p>
          </div>
          <span className="text-primary text-2xl font-bold">{levelInfo.progressPercent}%</span>
        </div>
        <Progress value={levelInfo.progressPercent} className="mt-3 h-2" />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Weekly study + XP line chart */}
        <div className="border-border bg-card/50 rounded-xl border p-5 backdrop-blur-sm">
          <h3 className="text-foreground mb-4 text-sm font-semibold">Weekly Study Time & XP</h3>
          {weeklyChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a26',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="study"
                  stroke="#7c3aed"
                  strokeWidth={2}
                  name="Study (hrs)"
                />
                <Line type="monotone" dataKey="xp" stroke="#3b82f6" strokeWidth={2} name="XP" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-muted-foreground flex h-[200px] items-center justify-center text-sm">
              No data yet
            </div>
          )}
        </div>

        {/* Activity pie chart */}
        <div className="border-border bg-card/50 rounded-xl border p-5 backdrop-blur-sm">
          <h3 className="text-foreground mb-4 text-sm font-semibold">Activity Distribution</h3>
          {activityPie.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={activityPie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name }: { name: string }) => name}
                  labelLine={false}
                  fontSize={11}
                >
                  {activityPie.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a26',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-muted-foreground flex h-[200px] items-center justify-center text-sm">
              No activity yet
            </div>
          )}
        </div>
      </div>

      {/* Performance metrics */}
      {summary && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard label="Avg Score" value={`${summary.averageScore}%`} icon={Award} />
          <MetricCard label="Accuracy" value={`${summary.accuracyRate}%`} icon={Target} />
          <MetricCard label="Completion" value={`${summary.completionRate}%`} icon={Clock} />
          <MetricCard label="Productivity" value={`${summary.productivityScore}`} icon={Sparkles} />
        </div>
      )}

      {/* Monthly bar chart */}
      {summary && summary.monthlyData.length > 0 && (
        <div className="border-border bg-card/50 rounded-xl border p-5 backdrop-blur-sm">
          <h3 className="text-foreground mb-4 text-sm font-semibold">Monthly Study Time (hours)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={summary.monthlyData.slice(-14).map((d) => ({
                date: d.date.slice(5),
                hours: Math.round((d.studyTimeMinutes / 60) * 10) / 10,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                fontSize={10}
                angle={-45}
                textAnchor="end"
                height={50}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a26',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="hours" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Streaks */}
      {streak && (
        <div className="grid grid-cols-3 gap-3">
          <StreakCard
            label="Daily Streak"
            value={streak.currentStreak}
            max={streak.longestStreak}
            icon={Flame}
            color="text-amber-500"
          />
          <StreakCard
            label="Weekly Streak"
            value={streak.weeklyStreak}
            max={streak.weeklyStreak}
            icon={Zap}
            color="text-primary"
          />
          <StreakCard
            label="Monthly Streak"
            value={streak.monthlyStreak}
            max={streak.monthlyStreak}
            icon={Crown}
            color="text-secondary"
          />
        </div>
      )}

      {/* Challenges */}
      {challenges.length > 0 && (
        <div className="border-border bg-card/50 rounded-xl border p-5 backdrop-blur-sm">
          <h3 className="text-foreground mb-3 text-sm font-semibold">Active Challenges</h3>
          <div className="space-y-3">
            {challenges
              .filter((c) => c.status === 'active')
              .slice(0, 3)
              .map((c) => (
                <div key={c.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground text-sm font-medium">{c.title}</span>
                      <span className="text-muted-foreground text-xs">
                        {c.progress}/{c.target} · +{c.xpReward} XP
                      </span>
                    </div>
                    <Progress value={(c.progress / c.target) * 100} className="mt-1.5 h-1.5" />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      <div className="border-border bg-card/50 rounded-xl border p-5 backdrop-blur-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-foreground text-sm font-semibold">
            Achievements ({achievements.length})
          </h3>
          <span className="text-muted-foreground text-xs">
            {gamificationService.ACHIEVEMENT_DEFINITIONS.length} total available
          </span>
        </div>
        {achievements.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {achievements.map((a) => (
              <div
                key={a.id}
                className="border-border bg-background/50 rounded-lg border p-3 text-center"
              >
                <div
                  className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${RARITY_COLORS[a.rarity]}20` }}
                >
                  <Trophy className="h-5 w-5" style={{ color: RARITY_COLORS[a.rarity] }} />
                </div>
                <p className="text-foreground text-xs font-medium">{a.title}</p>
                <p className="text-muted-foreground text-[10px] capitalize">
                  {a.rarity} · +{a.xpReward} XP
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground py-4 text-center text-sm">
            No achievements unlocked yet. Complete quizzes, notes, and study sessions to earn them!
          </p>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="border-border bg-card/50 rounded-xl border p-4">
      <Icon className={cn('mb-1 h-4 w-4', color)} />
      <div className="text-foreground text-2xl font-semibold">{value}</div>
      <div className="text-muted-foreground text-xs">{label}</div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="border-border bg-card/50 rounded-xl border p-4">
      <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="text-foreground mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}

function StreakCard({
  label,
  value,
  max,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  max: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="border-border bg-card/50 rounded-xl border p-4 text-center">
      <Icon className={cn('mx-auto mb-1 h-5 w-5', color)} />
      <div className="text-foreground text-2xl font-semibold">{value}</div>
      <div className="text-muted-foreground text-xs">{label}</div>
      {max > value && <div className="text-muted-foreground/60 text-[10px]">Best: {max}</div>}
    </div>
  );
}
