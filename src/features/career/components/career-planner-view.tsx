'use client';
/**
 * Career Planner View — full career planning dashboard.
 * Tabs: Overview, Goals, Skills, Colleges, Timeline.
 */
import { useState } from 'react';
import {
  Target,
  TrendingUp,
  GraduationCap,
  Clock,
  Plus,
  Sparkles,
  Trash2,
  Check,
  Award,
  BookOpen,
  Briefcase,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCareer } from '../hooks/use-career';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import type { SkillLevel } from '../types';

type Tab = 'overview' | 'goals' | 'skills' | 'colleges' | 'timeline';

const SKILL_LEVELS: SkillLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];

export function CareerPlannerView() {
  const career = useCareer();
  const [tab, setTab] = useState<Tab>('overview');
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [showSkillDialog, setShowSkillDialog] = useState(false);
  const [showCollegeDialog, setShowCollegeDialog] = useState(false);

  if (career.isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-6 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">Career Planner</h1>
          <p className="text-muted-foreground text-sm">
            AI-powered career guidance, goals, skills, and college planning.
          </p>
        </div>
        {tab === 'overview' && (
          <Button onClick={career.generateRecommendations} disabled={career.isGenerating}>
            <Sparkles className="mr-2 h-4 w-4" />
            {career.isGenerating ? 'Generating…' : 'Get AI Advice'}
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-border flex gap-1 border-b">
        {[
          { id: 'overview' as Tab, label: 'Overview', icon: Target },
          { id: 'goals' as Tab, label: 'Goals', icon: TrendingUp },
          { id: 'skills' as Tab, label: 'Skills', icon: Award },
          { id: 'colleges' as Tab, label: 'Colleges', icon: GraduationCap },
          { id: 'timeline' as Tab, label: 'Timeline', icon: Clock },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'flex items-center gap-1.5 border-b-2 px-4 py-2 text-sm font-medium transition-colors',
              tab === id
                ? 'border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground border-transparent',
            )}
          >
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* --- Overview --- */}
      {tab === 'overview' && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              icon={Target}
              label="Active Goals"
              value={career.goals.filter((g) => g.status === 'active').length}
            />
            <StatCard icon={Award} label="Skills Tracked" value={career.skills.length} />
            <StatCard icon={GraduationCap} label="Colleges" value={career.colleges.length} />
            <StatCard
              icon={TrendingUp}
              label="Avg Progress"
              value={`${Math.round(career.goals.reduce((s, g) => s + g.progress, 0) / (career.goals.length || 1))}%`}
            />
          </div>
          {/* AI Recommendations */}
          {career.recommendations && (
            <div className="border-primary/20 from-primary/5 via-card/50 to-secondary/5 rounded-xl border bg-gradient-to-br p-5 backdrop-blur-sm">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="text-primary h-4 w-4" />
                <h3 className="text-foreground text-sm font-semibold">AI Career Advisor</h3>
              </div>
              {career.recommendations.bestNextStep && (
                <p className="text-foreground mb-3 text-sm">
                  <span className="font-medium">Next step:</span>{' '}
                  {career.recommendations.bestNextStep}
                </p>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                {career.recommendations.careerSuggestions.length > 0 && (
                  <RecList
                    title="Career Suggestions"
                    items={career.recommendations.careerSuggestions}
                    icon={Briefcase}
                  />
                )}
                {career.recommendations.recommendedCourses.length > 0 && (
                  <RecList
                    title="Courses"
                    items={career.recommendations.recommendedCourses}
                    icon={BookOpen}
                  />
                )}
                {career.recommendations.recommendedBooks.length > 0 && (
                  <RecList
                    title="Books"
                    items={career.recommendations.recommendedBooks}
                    icon={BookOpen}
                  />
                )}
                {career.recommendations.recommendedCertifications.length > 0 && (
                  <RecList
                    title="Certifications"
                    items={career.recommendations.recommendedCertifications}
                    icon={Award}
                  />
                )}
                {career.recommendations.skillImprovements.length > 0 && (
                  <RecList
                    title="Skills to Improve"
                    items={career.recommendations.skillImprovements}
                    icon={TrendingUp}
                  />
                )}
                {career.recommendations.learningPath.length > 0 && (
                  <RecList
                    title="Learning Path"
                    items={career.recommendations.learningPath}
                    icon={ChevronRight}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- Goals --- */}
      {tab === 'goals' && (
        <div className="space-y-4">
          <Button onClick={() => setShowGoalDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Goal
          </Button>
          {career.goals.length === 0 ? (
            <EmptyState icon={Target} text="No goals yet. Create your first career goal!" />
          ) : (
            <div className="space-y-3">
              {career.goals.map((g) => (
                <div key={g.id} className="border-border bg-card/50 rounded-xl border p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-foreground font-semibold">{g.title}</h3>
                      <p className="text-muted-foreground text-xs">{g.description}</p>
                      {g.targetDate && (
                        <p className="text-muted-foreground mt-1 text-xs">Target: {g.targetDate}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          g.status === 'active'
                            ? 'bg-primary/10 text-primary'
                            : g.status === 'achieved'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-muted text-muted-foreground',
                        )}
                      >
                        {g.status}
                      </span>
                      <button
                        onClick={() => career.deleteGoal(g.id)}
                        className="text-muted-foreground/40 hover:text-destructive"
                        aria-label={`Delete goal: ${g.title}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-muted-foreground flex items-center justify-between text-xs">
                      <span>Progress</span>
                      <span>{g.progress}%</span>
                    </div>
                    <Progress value={g.progress} className="mt-1 h-1.5" />
                  </div>
                  {g.milestones.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {g.milestones.map((m) => (
                        <div key={m.id} className="flex items-center gap-2 text-xs">
                          <button
                            onClick={() =>
                              career.updateGoal(g.id, {
                                milestones: g.milestones.map((x) =>
                                  x.id === m.id
                                    ? {
                                        ...x,
                                        completed: !x.completed,
                                        completedAt: !x.completed ? Date.now() : null,
                                      }
                                    : x,
                                ),
                                progress: Math.round(
                                  (g.milestones.filter((x) =>
                                    x.id === m.id ? !x.completed : x.completed,
                                  ).length /
                                    g.milestones.length) *
                                    100,
                                ),
                              })
                            }
                            aria-label={
                              m.completed
                                ? `Mark milestone incomplete: ${m.title}`
                                : `Mark milestone complete: ${m.title}`
                            }
                            aria-pressed={m.completed}
                          >
                            <Check
                              className={cn(
                                'h-3.5 w-3.5',
                                m.completed ? 'text-emerald-500' : 'text-muted-foreground/40',
                              )}
                            />
                          </button>
                          <span
                            className={cn(
                              m.completed
                                ? 'text-muted-foreground line-through'
                                : 'text-foreground',
                            )}
                          >
                            {m.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {showGoalDialog && (
            <GoalDialog
              onClose={() => setShowGoalDialog(false)}
              onCreate={async (d) => {
                await career.createGoal(d);
                setShowGoalDialog(false);
              }}
            />
          )}
        </div>
      )}

      {/* --- Skills --- */}
      {tab === 'skills' && (
        <div className="space-y-4">
          <Button onClick={() => setShowSkillDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Skill
          </Button>
          {career.skills.length === 0 ? (
            <EmptyState icon={Award} text="No skills tracked yet." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {career.skills.map((s) => (
                <div key={s.id} className="border-border bg-card/50 rounded-xl border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-foreground font-semibold">{s.name}</h3>
                      <p className="text-muted-foreground text-xs">{s.category}</p>
                    </div>
                    <button
                      onClick={() => career.deleteSkill(s.id)}
                      className="text-muted-foreground/40 hover:text-destructive"
                      aria-label={`Delete skill: ${s.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground capitalize">{s.currentLevel}</span>
                    <ChevronRight className="text-muted-foreground h-3 w-3" />
                    <span className="text-primary capitalize">{s.targetLevel}</span>
                  </div>
                  <Progress value={s.progress} className="mt-2 h-1.5" />
                  {s.certificates.length > 0 && (
                    <div className="mt-2 flex gap-1">
                      {s.certificates.map((c) => (
                        <span
                          key={c.id}
                          className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-500"
                        >
                          📜 {c.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {showSkillDialog && (
            <SkillDialog
              onClose={() => setShowSkillDialog(false)}
              onCreate={async (d) => {
                await career.createSkill(d);
                setShowSkillDialog(false);
              }}
            />
          )}
        </div>
      )}

      {/* --- Colleges --- */}
      {tab === 'colleges' && (
        <div className="space-y-4">
          <Button onClick={() => setShowCollegeDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add College
          </Button>
          {career.colleges.length === 0 ? (
            <EmptyState icon={GraduationCap} text="No colleges added yet." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {career.colleges.map((c) => (
                <div key={c.id} className="border-border bg-card/50 rounded-xl border p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-foreground font-semibold">{c.name}</h3>
                        {c.isDream && <span className="text-xs">⭐</span>}
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {c.program} · {c.country}
                      </p>
                    </div>
                    <button
                      onClick={() => career.deleteCollege(c.id)}
                      className="text-muted-foreground/40 hover:text-destructive"
                      aria-label={`Delete college: ${c.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {c.entranceExams.map((e) => (
                      <span
                        key={e}
                        className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs"
                      >
                        {e}
                      </span>
                    ))}
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs capitalize',
                        c.status === 'accepted'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {c.status}
                    </span>
                  </div>
                  {c.fees && <p className="text-muted-foreground mt-2 text-xs">Fees: {c.fees}</p>}
                  {c.deadline && <p className="text-xs text-amber-500">Deadline: {c.deadline}</p>}
                </div>
              ))}
            </div>
          )}
          {showCollegeDialog && (
            <CollegeDialog
              onClose={() => setShowCollegeDialog(false)}
              onCreate={async (d) => {
                await career.createCollege(d);
                setShowCollegeDialog(false);
              }}
            />
          )}
        </div>
      )}

      {/* --- Timeline --- */}
      {tab === 'timeline' && (
        <div className="space-y-4">
          {career.timeline.length === 0 ? (
            <EmptyState icon={Clock} text="No timeline entries yet." />
          ) : (
            <div className="space-y-2">
              {career.timeline.map((t) => (
                <div
                  key={t.id}
                  className="border-border bg-card/30 flex gap-3 rounded-lg border p-3"
                >
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                      t.completed
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-primary/10 text-primary',
                    )}
                  >
                    {t.completed ? <Check className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-foreground text-sm font-medium">{t.title}</span>
                      <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[10px] capitalize">
                        {t.type}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-xs">{t.description}</p>
                    <p className="text-muted-foreground text-xs">{t.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Sub-components ---
function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
}) {
  return (
    <div className="border-border bg-card/50 rounded-xl border p-4">
      <Icon className="text-primary mb-1 h-4 w-4" />
      <div className="text-foreground text-2xl font-semibold">{value}</div>
      <div className="text-muted-foreground text-xs">{label}</div>
    </div>
  );
}
function RecList({
  title,
  items,
  icon: Icon,
}: {
  title: string;
  items: string[];
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div>
      <div className="text-muted-foreground mb-1 flex items-center gap-1 text-xs font-medium">
        <Icon className="h-3 w-3" /> {title}
      </div>
      <ul className="space-y-0.5">
        {items.map((i, idx) => (
          <li key={idx} className="text-foreground text-xs">
            • {i}
          </li>
        ))}
      </ul>
    </div>
  );
}
function EmptyState({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <div className="border-border bg-card/30 rounded-xl border border-dashed py-12 text-center">
      <Icon className="text-muted-foreground/40 mx-auto mb-2 h-8 w-8" />
      <p className="text-muted-foreground text-sm">{text}</p>
    </div>
  );
}

// --- Dialogs ---
function GoalDialog({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (d: {
    title: string;
    description: string;
    targetDate: string | null;
    milestones: { id: string; title: string; completed: boolean; completedAt: number | null }[];
  }) => Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState('');
  const [milestones, setMilestones] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Goal</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="goal-title">Title</Label>
            <Input
              id="goal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Become a Software Engineer"
            />
          </div>
          <div>
            <Label htmlFor="goal-desc">Description</Label>
            <Textarea
              id="goal-desc"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="goal-date">Target Date</Label>
            <Input
              id="goal-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="goal-milestones">Milestones (one per line)</Label>
            <Textarea
              id="goal-milestones"
              value={milestones}
              onChange={(e) => setMilestones(e.target.value)}
              rows={3}
              placeholder="Learn Python\nBuild a project\nApply for internships"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={isCreating || !title.trim()}
            onClick={async () => {
              setIsCreating(true);
              await onCreate({
                title,
                description: desc,
                targetDate: date || null,
                milestones: milestones
                  .split('\n')
                  .filter(Boolean)
                  .map((t, i) => ({
                    id: `m${i}`,
                    title: t.trim(),
                    completed: false,
                    completedAt: null,
                  })),
              });
              setIsCreating(false);
            }}
          >
            {isCreating ? 'Creating…' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
function SkillDialog({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (d: {
    name: string;
    category: string;
    currentLevel: SkillLevel;
    targetLevel: SkillLevel;
  }) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [current, setCurrent] = useState<SkillLevel>('beginner');
  const [target, setTarget] = useState<SkillLevel>('intermediate');
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Skill</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="skill-name">Skill Name</Label>
            <Input
              id="skill-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Python"
            />
          </div>
          <div>
            <Label htmlFor="skill-category">Category</Label>
            <Input
              id="skill-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Programming"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="skill-current">Current Level</Label>
              <Select value={current} onValueChange={(v) => setCurrent(v as SkillLevel)}>
                <SelectTrigger id="skill-current">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SKILL_LEVELS.map((l) => (
                    <SelectItem key={l} value={l} className="bg-card capitalize">
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="skill-target">Target Level</Label>
              <Select value={target} onValueChange={(v) => setTarget(v as SkillLevel)}>
                <SelectTrigger id="skill-target">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SKILL_LEVELS.map((l) => (
                    <SelectItem key={l} value={l} className="bg-card capitalize">
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!name.trim()}
            onClick={() => onCreate({ name, category, currentLevel: current, targetLevel: target })}
          >
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
function CollegeDialog({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (d: {
    name: string;
    country: string;
    program: string;
    fees: string;
    deadline: string | null;
    isDream: boolean;
    entranceExams: string[];
    status: 'considering';
  }) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [program, setProgram] = useState('');
  const [fees, setFees] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isDream, setIsDream] = useState(false);
  const [exams, setExams] = useState('');
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add College</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="college-name">College Name</Label>
              <Input id="college-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="college-country">Country</Label>
              <Input
                id="college-country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="college-program">Program</Label>
            <Input
              id="college-program"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              placeholder="e.g. B.Tech Computer Science"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="college-fees">Fees (annual)</Label>
              <Input
                id="college-fees"
                value={fees}
                onChange={(e) => setFees(e.target.value)}
                placeholder="e.g. $20,000"
              />
            </div>
            <div>
              <Label htmlFor="college-deadline">Deadline</Label>
              <Input
                id="college-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="college-exams">Entrance Exams (comma-separated)</Label>
            <Input
              id="college-exams"
              value={exams}
              onChange={(e) => setExams(e.target.value)}
              placeholder="e.g. SAT, TOEFL"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isDream}
              onChange={(e) => setIsDream(e.target.checked)}
            />{' '}
            Dream College ⭐
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!name.trim()}
            onClick={() =>
              onCreate({
                name,
                country,
                program,
                fees,
                deadline: deadline || null,
                isDream,
                entranceExams: exams
                  .split(',')
                  .map((e) => e.trim())
                  .filter(Boolean),
                status: 'considering',
              })
            }
          >
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
