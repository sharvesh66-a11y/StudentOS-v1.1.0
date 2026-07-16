'use client';
/**
 * Freelance View — full freelancing dashboard.
 * Tabs: Dashboard, Jobs, Applications, Projects, Portfolio, Profile.
 */
import { useState, useMemo } from 'react';
import {
  Briefcase,
  Search,
  FileText,
  FolderKanban,
  Image,
  User,
  Plus,
  Sparkles,
  Loader2,
  DollarSign,
  Clock,
  Star,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useFreelance } from '../hooks/use-freelance';
import { formatRelativeTime } from '@/utils/format';
import type { FreelanceJob, ApplicationStatus, ProjectStatus } from '../types';

type Tab = 'dashboard' | 'jobs' | 'applications' | 'projects' | 'portfolio' | 'profile';
const STATUS_COLORS: Record<ApplicationStatus, string> = {
  pending: 'bg-amber-500/10 text-amber-500',
  accepted: 'bg-emerald-500/10 text-emerald-500',
  rejected: 'bg-destructive/10 text-destructive',
  withdrawn: 'bg-muted text-muted-foreground',
};
const PROJECT_COLORS: Record<ProjectStatus, string> = {
  active: 'bg-primary/10 text-primary',
  completed: 'bg-emerald-500/10 text-emerald-500',
  cancelled: 'bg-destructive/10 text-destructive',
};

export function FreelanceView() {
  const f = useFreelance();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [selectedJob, setSelectedJob] = useState<FreelanceJob | null>(null);
  const [proposal, setProposal] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPortfolioDialog, setShowPortfolioDialog] = useState(false);

  const filteredJobs = useMemo(
    () =>
      f.jobs.filter(
        (j) =>
          j.status === 'open' &&
          (!search || j.title.toLowerCase().includes(search.toLowerCase())) &&
          (!filterCategory || j.category === filterCategory),
      ),
    [f.jobs, search, filterCategory],
  );
  const totalEarnings = f.earnings
    .filter((e) => e.status === 'completed')
    .reduce((s, e) => s + e.amount, 0);
  const pendingEarnings = f.earnings
    .filter((e) => e.status === 'pending')
    .reduce((s, e) => s + e.amount, 0);
  const activeProjects = f.projects.filter((p) => p.status === 'active').length;
  const completedProjects = f.projects.filter((p) => p.status === 'completed').length;

  if (f.isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-6 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const handleApply = async () => {
    if (!selectedJob || !proposal.trim()) return;
    await f.apply(selectedJob, proposal, coverLetter);
    setSelectedJob(null);
    setProposal('');
    setCoverLetter('');
  };
  const handleGenerate = async (type: 'proposal' | 'cover-letter') => {
    if (!selectedJob) return;
    setIsGenerating(true);
    const text = await f.generateAI(type, selectedJob.title, selectedJob.description);
    setIsGenerating(false);
    if (type === 'proposal') setProposal(text);
    else setCoverLetter(text);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          Student Freelancing
        </h1>
        <p className="text-muted-foreground text-sm">
          Find jobs, manage projects, and build your portfolio.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={DollarSign} label="Total Earned" value={`$${totalEarnings}`} />
        <StatCard icon={Clock} label="Pending" value={`$${pendingEarnings}`} />
        <StatCard icon={Briefcase} label="Active" value={activeProjects} />
        <StatCard icon={Star} label="Completed" value={completedProjects} />
      </div>

      {/* Tabs */}
      <div className="border-border flex gap-1 overflow-x-auto border-b">
        {[
          { id: 'dashboard' as Tab, label: 'Dashboard', icon: Briefcase },
          { id: 'jobs' as Tab, label: 'Jobs', icon: Search },
          { id: 'applications' as Tab, label: 'Applications', icon: FileText },
          { id: 'projects' as Tab, label: 'Projects', icon: FolderKanban },
          { id: 'portfolio' as Tab, label: 'Portfolio', icon: Image },
          { id: 'profile' as Tab, label: 'Profile', icon: User },
        ].map(({ id, label, icon: Icon }) => (
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

      {/* --- Dashboard --- */}
      {tab === 'dashboard' && (
        <div className="space-y-4">
          <div className="border-border bg-card/50 rounded-xl border p-5">
            <h3 className="text-foreground mb-3 text-sm font-semibold">Earnings Overview</h3>
            {f.earnings.length > 0 ? (
              <div className="space-y-2">
                {f.earnings.slice(0, 5).map((e) => (
                  <div key={e.id} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{e.projectTitle}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs',
                          e.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-amber-500/10 text-amber-500',
                        )}
                      >
                        {e.status}
                      </span>
                      <span className="text-foreground font-medium">${e.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No earnings yet. Apply for jobs to start earning!
              </p>
            )}
          </div>
        </div>
      )}

      {/* --- Jobs --- */}
      {tab === 'jobs' && (
        <>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search jobs…"
                aria-label="Search freelance jobs"
                className="pl-9"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              aria-label="Filter by category"
              className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
            >
              <option value="" className="bg-card">
                All categories
              </option>
              {[...new Set(f.jobs.map((j) => j.category))].map((c) => (
                <option key={c} value={c} className="bg-card">
                  {c}
                </option>
              ))}
            </select>
          </div>
          {filteredJobs.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center text-sm">No jobs found.</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {filteredJobs.map((j) => (
                <div
                  key={j.id}
                  className="border-border bg-card/50 hover:border-primary/40 cursor-pointer rounded-xl border p-4 transition-all"
                  onClick={() => {
                    setSelectedJob(j);
                    setProposal('');
                    setCoverLetter('');
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-foreground font-semibold">{j.title}</h3>
                      <p className="text-muted-foreground text-xs">
                        {j.category} · {j.clientName}
                      </p>
                    </div>
                    {j.isFeatured && (
                      <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-medium">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="text-foreground mt-2 text-sm font-medium">${j.budget}</p>
                  <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">{j.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex gap-1">
                      {j.skillsRequired.slice(0, 2).map((s) => (
                        <span
                          key={s}
                          className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-amber-500">Deadline: {j.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* --- Applications --- */}
      {tab === 'applications' && (
        <div className="space-y-3">
          {f.applications.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center text-sm">
              No applications yet. Browse jobs and apply!
            </div>
          ) : (
            f.applications.map((a) => (
              <div key={a.id} className="border-border bg-card/50 rounded-xl border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-foreground font-semibold">{a.jobTitle}</h3>
                    <p className="text-muted-foreground text-xs">
                      {formatRelativeTime(new Date(a.createdAt))}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                      STATUS_COLORS[a.status],
                    )}
                  >
                    {a.status}
                  </span>
                </div>
                {a.proposal && (
                  <p className="text-muted-foreground mt-2 line-clamp-2 text-xs">{a.proposal}</p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* --- Projects --- */}
      {tab === 'projects' && (
        <div className="space-y-3">
          {f.projects.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center text-sm">
              No projects yet. Get accepted for a job to start a project!
            </div>
          ) : (
            f.projects.map((p) => (
              <div key={p.id} className="border-border bg-card/50 rounded-xl border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-foreground font-semibold">{p.title}</h3>
                    <p className="text-muted-foreground text-xs">
                      Client: {p.clientName} · ${p.budget}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                      PROJECT_COLORS[p.status],
                    )}
                  >
                    {p.status}
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-muted-foreground flex items-center justify-between text-xs">
                    <span>Progress</span>
                    <span>{p.progress}%</span>
                  </div>
                  <Progress value={p.progress} className="mt-1 h-1.5" />
                </div>
                {p.milestones.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {p.milestones.map((m) => (
                      <div key={m.id} className="flex items-center gap-2 text-xs">
                        <span
                          className={cn(
                            'h-1.5 w-1.5 rounded-full',
                            m.completed ? 'bg-emerald-500' : 'bg-muted-foreground/40',
                          )}
                        />
                        {m.title} · ${m.amount}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* --- Portfolio --- */}
      {tab === 'portfolio' && (
        <div className="space-y-4">
          <Button onClick={() => setShowPortfolioDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Portfolio Item
          </Button>
          {f.portfolio.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center text-sm">
              No portfolio items yet.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {f.portfolio.map((p) => (
                <div key={p.id} className="border-border bg-card/50 rounded-xl border p-4">
                  <h3 className="text-foreground font-semibold">{p.title}</h3>
                  <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">{p.description}</p>
                  {p.skillsUsed.length > 0 && (
                    <div className="mt-2 flex gap-1">
                      {p.skillsUsed.map((s) => (
                        <span
                          key={s}
                          className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  {p.rating && (
                    <p className="mt-2 text-xs text-amber-500">{'⭐'.repeat(p.rating)}</p>
                  )}
                </div>
              ))}
            </div>
          )}
          {showPortfolioDialog && (
            <PortfolioDialog
              onClose={() => setShowPortfolioDialog(false)}
              onCreate={async (d) => {
                await f.addPortfolioItem(d);
                setShowPortfolioDialog(false);
              }}
            />
          )}
        </div>
      )}

      {/* --- Profile --- */}
      {tab === 'profile' && (
        <div className="border-border bg-card/50 mx-auto max-w-2xl space-y-4 rounded-xl border p-6 backdrop-blur-sm">
          <h3 className="text-foreground text-sm font-semibold">Freelance Profile</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Bio</Label>
              <Textarea
                defaultValue={f.freelanceProfile?.bio ?? ''}
                rows={3}
                placeholder="Tell clients about yourself…"
                onChange={(e) => f.updateFreelanceProfile({ bio: e.target.value })}
              />
            </div>
            <div>
              <Label>Skills (comma-separated)</Label>
              <Input
                defaultValue={f.freelanceProfile?.skills.join(', ') ?? ''}
                placeholder="e.g. Python, Design, Writing"
                onChange={(e) =>
                  f.updateFreelanceProfile({
                    skills: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
            </div>
            <div>
              <Label>Education</Label>
              <Input
                defaultValue={f.freelanceProfile?.education ?? ''}
                placeholder="e.g. B.Tech Computer Science"
                onChange={(e) => f.updateFreelanceProfile({ education: e.target.value })}
              />
            </div>
            <div>
              <Label>Languages (comma-separated)</Label>
              <Input
                defaultValue={f.freelanceProfile?.languages.join(', ') ?? ''}
                placeholder="e.g. English, Spanish"
                onChange={(e) =>
                  f.updateFreelanceProfile({
                    languages: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
            </div>
            <div>
              <Label>Hourly Rate ($)</Label>
              <Input
                type="number"
                defaultValue={f.freelanceProfile?.hourlyRate ?? 0}
                onChange={(e) => f.updateFreelanceProfile({ hourlyRate: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Availability</Label>
              <select
                defaultValue={f.freelanceProfile?.availability ?? 'available'}
                onChange={(e) =>
                  f.updateFreelanceProfile({
                    availability: e.target.value as 'available' | 'busy' | 'unavailable',
                  })
                }
                className="border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm"
              >
                <option value="available" className="bg-card">
                  Available
                </option>
                <option value="busy" className="bg-card">
                  Busy
                </option>
                <option value="unavailable" className="bg-card">
                  Unavailable
                </option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Apply Dialog */}
      {selectedJob && (
        <div
          className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedJob(null)}
        >
          <div
            className="border-border bg-card max-h-[85vh] max-w-lg overflow-y-auto rounded-xl border p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-foreground text-lg font-semibold">Apply: {selectedJob.title}</h2>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close apply dialog"
              >
                ✕
              </button>
            </div>
            <div className="mb-4 space-y-1 text-sm">
              <p className="text-foreground">Budget: ${selectedJob.budget}</p>
              <p className="text-muted-foreground">{selectedJob.description}</p>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="proposal">Proposal</Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleGenerate('proposal')}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="mr-1 h-3 w-3" />
                    )}{' '}
                    AI Generate
                  </Button>
                </div>
                <Textarea
                  id="proposal"
                  value={proposal}
                  onChange={(e) => setProposal(e.target.value)}
                  rows={4}
                  placeholder="Write your proposal…"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="cover-letter">Cover Letter (optional)</Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleGenerate('cover-letter')}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="mr-1 h-3 w-3" />
                    )}{' '}
                    AI Generate
                  </Button>
                </div>
                <Textarea
                  id="cover-letter"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={3}
                  placeholder="Write your cover letter…"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={() => setSelectedJob(null)}>
                Cancel
              </Button>
              <Button onClick={handleApply} disabled={!proposal.trim()}>
                <Send className="mr-2 h-4 w-4" /> Submit Application
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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

function PortfolioDialog({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (d: {
    title: string;
    description: string;
    skillsUsed: string[];
    imageURL: string | null;
    projectURL: string | null;
  }) => Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [skills, setSkills] = useState('');
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Portfolio Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="portfolio-title">Title</Label>
            <Input
              id="portfolio-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. E-commerce Website"
            />
          </div>
          <div>
            <Label htmlFor="portfolio-desc">Description</Label>
            <Textarea
              id="portfolio-desc"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="portfolio-skills">Skills Used (comma-separated)</Label>
            <Input
              id="portfolio-skills"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. React, Node.js"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!title.trim()}
            onClick={() =>
              onCreate({
                title,
                description: desc,
                skillsUsed: skills
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
                imageURL: null,
                projectURL: null,
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
