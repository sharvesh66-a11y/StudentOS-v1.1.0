'use client';
/**
 * Scholarship Finder View — full scholarship discovery + tracking dashboard.
 * Tabs: Browse, Saved, AI Advisor, Profile.
 */
import { useState, useMemo } from 'react';
import {
  Search,
  Bookmark,
  Sparkles,
  User,
  Trash2,
  ExternalLink,
  Clock,
  Award,
  FileText,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useScholarships } from '../hooks/use-scholarships';
import type { Scholarship, ApplicationStatus } from '../types';

type Tab = 'browse' | 'saved' | 'advisor' | 'profile';

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  saved: 'bg-muted text-muted-foreground',
  applied: 'bg-primary/10 text-primary',
  pending: 'bg-amber-500/10 text-amber-500',
  approved: 'bg-emerald-500/10 text-emerald-500',
  rejected: 'bg-destructive/10 text-destructive',
};

export function ScholarshipFinderView() {
  const sch = useScholarships();
  const [tab, setTab] = useState<Tab>('browse');
  const [search, setSearch] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [selected, setSelected] = useState<Scholarship | null>(null);

  const filtered = useMemo(
    () =>
      sch.allScholarships.filter(
        (s) =>
          (!search ||
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.description.toLowerCase().includes(search.toLowerCase())) &&
          (!filterCountry || s.country === filterCountry),
      ),
    [sch.allScholarships, search, filterCountry],
  );
  const upcoming = useMemo(
    () =>
      sch.myScholarships
        .filter((s) => s.status === 'saved' || s.status === 'applied')
        .sort((a, b) => a.deadline.localeCompare(b.deadline))
        .slice(0, 5),
    [sch.myScholarships],
  );

  if (sch.isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-6 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            Scholarship Finder
          </h1>
          <p className="text-muted-foreground text-sm">
            Discover, track, and apply for scholarships with AI guidance.
          </p>
        </div>
        {tab === 'advisor' && (
          <Button onClick={sch.generateRecs} disabled={sch.isGenerating}>
            <Sparkles className="mr-2 h-4 w-4" />
            {sch.isGenerating ? 'Generating…' : 'Get AI Advice'}
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Award} label="Available" value={sch.allScholarships.length} />
        <StatCard
          icon={Bookmark}
          label="Saved"
          value={sch.myScholarships.filter((s) => s.status === 'saved').length}
        />
        <StatCard
          icon={FileText}
          label="Applied"
          value={
            sch.myScholarships.filter((s) => s.status === 'applied' || s.status === 'pending')
              .length
          }
        />
        <StatCard
          icon={CheckCircle}
          label="Approved"
          value={sch.myScholarships.filter((s) => s.status === 'approved').length}
        />
      </div>

      {/* Tabs */}
      <div className="border-border flex gap-1 border-b">
        {[
          { id: 'browse' as Tab, label: 'Browse', icon: Search },
          { id: 'saved' as Tab, label: 'My Scholarships', icon: Bookmark },
          { id: 'advisor' as Tab, label: 'AI Advisor', icon: Sparkles },
          { id: 'profile' as Tab, label: 'Profile', icon: User },
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

      {/* Upcoming deadlines */}
      {upcoming.length > 0 && tab !== 'profile' && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-amber-500">
            <Clock className="h-3.5 w-3.5" /> Upcoming Deadlines
          </h3>
          <div className="space-y-1">
            {upcoming.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-xs">
                <span className="text-foreground">{s.scholarshipName}</span>
                <span className="text-amber-500">{s.deadline}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- Browse --- */}
      {tab === 'browse' && (
        <>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search scholarships…"
                className="pl-9"
              />
            </div>
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
            >
              <option value="" className="bg-card">
                All countries
              </option>
              {[...new Set(sch.allScholarships.map((s) => s.country))].map((c) => (
                <option key={c} value={c} className="bg-card">
                  {c}
                </option>
              ))}
            </select>
          </div>
          {filtered.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center text-sm">
              No scholarships found.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {filtered.map((s) => (
                <div
                  key={s.id}
                  className="border-border bg-card/50 hover:border-primary/40 cursor-pointer rounded-xl border p-4 transition-all"
                  onClick={() => setSelected(s)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-foreground font-semibold">{s.name}</h3>
                      <p className="text-muted-foreground text-xs">
                        {s.provider} · {s.country}
                      </p>
                    </div>
                    {s.featured && (
                      <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-medium">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="text-foreground mt-2 text-sm font-medium">{s.amount}</p>
                  <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">{s.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex gap-1">
                      {s.tags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-amber-500">Deadline: {s.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* --- Saved --- */}
      {tab === 'saved' && (
        <div className="space-y-3">
          {sch.myScholarships.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center text-sm">
              No scholarships saved yet. Browse and save some!
            </div>
          ) : (
            sch.myScholarships.map((s) => (
              <div key={s.id} className="border-border bg-card/50 rounded-xl border p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-foreground font-semibold">{s.scholarshipName}</h3>
                    <p className="text-muted-foreground text-xs">Deadline: {s.deadline}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={s.status}
                      onChange={(e) => sch.updateStatus(s.id, e.target.value as ApplicationStatus)}
                      className="border-border h-7 rounded border bg-transparent px-2 text-xs"
                    >
                      <option value="saved" className="bg-card">
                        Saved
                      </option>
                      <option value="applied" className="bg-card">
                        Applied
                      </option>
                      <option value="pending" className="bg-card">
                        Pending
                      </option>
                      <option value="approved" className="bg-card">
                        Approved
                      </option>
                      <option value="rejected" className="bg-card">
                        Rejected
                      </option>
                    </select>
                    <button
                      onClick={() => sch.remove(s.id)}
                      className="text-muted-foreground/40 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {s.notes && <p className="text-muted-foreground mt-2 text-xs">{s.notes}</p>}
                <span
                  className={cn(
                    'mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium',
                    STATUS_COLORS[s.status],
                  )}
                >
                  {s.status}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* --- AI Advisor --- */}
      {tab === 'advisor' && (
        <div className="space-y-4">
          {sch.recommendations ? (
            <>
              <div className="border-primary/20 from-primary/5 via-card/50 to-secondary/5 rounded-xl border bg-gradient-to-br p-5 backdrop-blur-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles className="text-primary h-4 w-4" />
                  <h3 className="text-foreground text-sm font-semibold">AI Scholarship Advisor</h3>
                </div>
                <div className="mb-3">
                  <div className="text-muted-foreground flex items-center justify-between text-xs">
                    <span>Success Probability</span>
                    <span className="text-foreground font-medium">
                      {sch.recommendations.successProbability}%
                    </span>
                  </div>
                  <Progress value={sch.recommendations.successProbability} className="mt-1 h-2" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {sch.recommendations.bestScholarships.length > 0 && (
                    <div>
                      <p className="text-muted-foreground mb-1 text-xs font-medium">Best Matches</p>
                      {sch.recommendations.bestScholarships.map((s, i) => (
                        <div
                          key={i}
                          className="border-border bg-background/50 mb-1 rounded-lg border p-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-foreground font-medium">{s.name}</span>
                            <span className="text-primary">{s.matchScore}%</span>
                          </div>
                          <p className="text-muted-foreground">{s.reason}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {sch.recommendations.missingEligibility.length > 0 && (
                    <RecList
                      title="Missing Eligibility"
                      items={sch.recommendations.missingEligibility}
                    />
                  )}
                  {sch.recommendations.requiredImprovements.length > 0 && (
                    <RecList
                      title="Required Improvements"
                      items={sch.recommendations.requiredImprovements}
                    />
                  )}
                  {sch.recommendations.suggestedDocuments.length > 0 && (
                    <RecList
                      title="Suggested Documents"
                      items={sch.recommendations.suggestedDocuments}
                    />
                  )}
                  {sch.recommendations.applicationTips.length > 0 && (
                    <RecList title="Application Tips" items={sch.recommendations.applicationTips} />
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center">
              <Sparkles className="text-muted-foreground/40 mx-auto mb-2 h-8 w-8" />
              <p className="text-muted-foreground text-sm">
                Click "Get AI Advice" to generate personalized scholarship recommendations.
              </p>
            </div>
          )}
        </div>
      )}

      {/* --- Profile --- */}
      {tab === 'profile' && (
        <div className="border-border bg-card/50 mx-auto max-w-2xl space-y-4 rounded-xl border p-6 backdrop-blur-sm">
          <h3 className="text-foreground text-sm font-semibold">Scholarship Profile</h3>
          <p className="text-muted-foreground text-xs">
            This profile is used by AI to find the best scholarships for you.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="scholar-gpa">GPA</Label>
              <Input
                id="scholar-gpa"
                defaultValue={sch.profile?.academicInfo.gpa ?? ''}
                placeholder="e.g. 3.8"
                onChange={(e) =>
                  sch.updateProfile({
                    academicInfo: {
                      ...(sch.profile?.academicInfo ?? {
                        grade: '',
                        gpa: '',
                        school: '',
                        graduationYear: '',
                      }),
                      gpa: e.target.value,
                    },
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="scholar-grade">Grade/Year</Label>
              <Input
                id="scholar-grade"
                defaultValue={sch.profile?.academicInfo.grade ?? ''}
                placeholder="e.g. Grade 12"
                onChange={(e) =>
                  sch.updateProfile({
                    academicInfo: {
                      ...(sch.profile?.academicInfo ?? {
                        grade: '',
                        gpa: '',
                        school: '',
                        graduationYear: '',
                      }),
                      grade: e.target.value,
                    },
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="scholar-country">Preferred Country</Label>
              <Input
                id="scholar-country"
                defaultValue={sch.profile?.preferredCountry ?? ''}
                placeholder="e.g. USA"
                onChange={(e) => sch.updateProfile({ preferredCountry: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="scholar-course">Preferred Course</Label>
              <Input
                id="scholar-course"
                defaultValue={sch.profile?.preferredCourse ?? ''}
                placeholder="e.g. Computer Science"
                onChange={(e) => sch.updateProfile({ preferredCourse: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="scholar-skills">Skills (comma-separated)</Label>
            <Input
              id="scholar-skills"
              defaultValue={sch.profile?.skills.join(', ') ?? ''}
              placeholder="e.g. Python, Leadership, Public Speaking"
              onChange={(e) =>
                sch.updateProfile({
                  skills: e.target.value
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
          </div>
          <div>
            <Label htmlFor="scholar-achievements">Achievements (comma-separated)</Label>
            <Textarea
              id="scholar-achievements"
              defaultValue={sch.profile?.achievements.join(', ') ?? ''}
              rows={2}
              placeholder="e.g. Science Fair Winner, Student Council President"
              onChange={(e) =>
                sch.updateProfile({
                  achievements: e.target.value
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
          </div>
          <div>
            <Label htmlFor="scholar-income">Income Category</Label>
            <select
              id="scholar-income"
              defaultValue={sch.profile?.incomeCategory ?? 'not-specified'}
              onChange={(e) =>
                sch.updateProfile({
                  incomeCategory: e.target.value as 'low' | 'middle' | 'high' | 'not-specified',
                })
              }
              className="border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm"
            >
              <option value="not-specified" className="bg-card">
                Not specified
              </option>
              <option value="low" className="bg-card">
                Low
              </option>
              <option value="middle" className="bg-card">
                Middle
              </option>
              <option value="high" className="bg-card">
                High
              </option>
            </select>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div
          className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="border-border bg-card max-h-[85vh] max-w-lg overflow-y-auto rounded-xl border p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-foreground text-lg font-semibold">{selected.name}</h2>
              <button
                onClick={() => setSelected(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <p className="text-muted-foreground mb-3 text-sm">{selected.description}</p>
            <div className="space-y-2 text-sm">
              <InfoRow label="Provider" value={selected.provider} />
              <InfoRow label="Amount" value={selected.amount} />
              <InfoRow label="Country" value={selected.country} />
              <InfoRow label="Category" value={selected.category} />
              <InfoRow label="Deadline" value={selected.deadline} />
              <InfoRow label="Required Marks" value={selected.requiredMarks} />
              <InfoRow label="Required Class" value={selected.requiredClass} />
            </div>
            {selected.eligibility.length > 0 && (
              <div className="mt-3">
                <p className="text-foreground text-xs font-medium">Eligibility</p>
                <ul className="mt-1 space-y-0.5">
                  {selected.eligibility.map((e, i) => (
                    <li key={i} className="text-muted-foreground text-xs">
                      • {e}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {selected.requiredDocuments.length > 0 && (
              <div className="mt-3">
                <p className="text-foreground text-xs font-medium">Required Documents</p>
                <ul className="mt-1 space-y-0.5">
                  {selected.requiredDocuments.map((d, i) => (
                    <li key={i} className="text-muted-foreground text-xs">
                      • {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => {
                  sch.save(selected);
                  setSelected(null);
                }}
                className="flex-1"
              >
                <Bookmark className="mr-2 h-4 w-4" /> Save
              </Button>
              {selected.applicationLink && (
                <a
                  href={selected.applicationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-border text-foreground hover:bg-accent flex items-center gap-1.5 rounded-md border px-4 py-2 text-sm"
                >
                  <ExternalLink className="h-4 w-4" /> Apply
                </a>
              )}
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
  value: number;
}) {
  return (
    <div className="border-border bg-card/50 rounded-xl border p-4">
      <Icon className="text-primary mb-1 h-4 w-4" />
      <div className="text-foreground text-2xl font-semibold">{value}</div>
      <div className="text-muted-foreground text-xs">{label}</div>
    </div>
  );
}
function RecList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-muted-foreground mb-1 text-xs font-medium">{title}</p>
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
function InfoRow({ label, value }: { label: string; value: string }) {
  return value ? (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}:</span>
      <span className="text-foreground">{value}</span>
    </div>
  ) : null;
}
