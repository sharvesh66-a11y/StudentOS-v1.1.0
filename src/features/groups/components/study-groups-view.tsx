'use client';
/**
 * Study Groups View — main container.
 * Tabs: My Groups, Discover, Group Detail (with chat, members, sessions, files).
 */
import { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Lock,
  Globe,
  MessageSquare,
  Calendar,
  Files,
  Send,
  Trash2,
  Edit2,
  Smile,
  ArrowLeft,
  Crown,
  Shield,
  UserCircle,
  X,
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
import { MarkdownRenderer } from '@/features/junova';
import { useGroups, useGroupMembers } from '../hooks/use-groups';
import { useGroupChat } from '../hooks/use-chat';
import { SUBJECTS } from '@/features/junova/constants';
import { formatRelativeTime } from '@/utils/format';
import { cn } from '@/lib/utils';
import type { StudyGroup, CreateGroupConfig } from '../types';
import { DEFAULT_GROUP_CONFIG } from '../types';

type Tab = 'list' | 'discover' | 'detail';
type DetailTab = 'chat' | 'members' | 'sessions' | 'files';

const EMOJIS = ['👍', '❤️', '🎉', '🤔', '👀', '🔥'];

export function StudyGroupsView() {
  const { allGroups, myGroups, isLoading, create, join, leave, remove } = useGroups();
  const [tab, setTab] = useState<Tab>('list');
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('');

  const filteredMy = useMemo(
    () => myGroups.filter((g) => !search || g.name.toLowerCase().includes(search.toLowerCase())),
    [myGroups, search],
  );
  const filteredAll = useMemo(
    () =>
      allGroups.filter(
        (g) =>
          (!search || g.name.toLowerCase().includes(search.toLowerCase())) &&
          (!filterSubject || g.subject === filterSubject),
      ),
    [allGroups, search, filterSubject],
  );

  const openGroup = (g: StudyGroup) => {
    setSelectedGroup(g);
    setTab('detail');
  };

  if (tab === 'detail' && selectedGroup) {
    return (
      <GroupDetail
        group={selectedGroup}
        onBack={() => {
          setTab('list');
          setSelectedGroup(null);
        }}
        onLeave={() => {
          leave(selectedGroup.id);
          setTab('list');
          setSelectedGroup(null);
        }}
        onDelete={() => {
          remove(selectedGroup.id);
          setTab('list');
          setSelectedGroup(null);
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">Study Groups</h1>
          <p className="text-muted-foreground text-sm">Collaborate, chat, and study together.</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Group
        </Button>
      </div>

      <div className="border-border flex gap-1 border-b">
        {[
          { id: 'list' as Tab, label: 'My Groups', icon: Users },
          { id: 'discover' as Tab, label: 'Discover', icon: Search },
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

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search groups…"
            aria-label="Search study groups"
            className="pl-9"
          />
        </div>
        {tab === 'discover' && (
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            aria-label="Filter by subject"
            className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
          >
            {
              <option value="" className="bg-card">
                All subjects
              </option>
            }
            {SUBJECTS.map((s) => (
              <option key={s} value={s} className="bg-card">
                {s}
              </option>
            ))}
          </select>
        )}
      </div>

      {isLoading ? (
        <div className="text-muted-foreground py-12 text-center text-sm">Loading…</div>
      ) : tab === 'list' ? (
        filteredMy.length === 0 ? (
          <EmptyState onCreate={() => setShowCreate(true)} />
        ) : (
          <GroupGrid groups={filteredMy} onOpen={openGroup} />
        )
      ) : filteredAll.length === 0 ? (
        <div className="text-muted-foreground py-12 text-center text-sm">
          No groups found. Create one!
        </div>
      ) : (
        <GroupGrid
          groups={filteredAll}
          onOpen={openGroup}
          onJoin={join}
          myGroupIds={new Set(myGroups.map((g) => g.id))}
        />
      )}

      {showCreate && (
        <CreateGroupDialog
          onClose={() => setShowCreate(false)}
          onCreate={async (config) => {
            await create(config);
            setShowCreate(false);
          }}
        />
      )}
    </div>
  );
}

// --- Group Grid ---
function GroupGrid({
  groups,
  onOpen,
  onJoin,
  myGroupIds,
}: {
  groups: StudyGroup[];
  onOpen: (g: StudyGroup) => void;
  onJoin?: (g: StudyGroup) => void;
  myGroupIds?: Set<string>;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {groups.map((g) => (
        <div
          key={g.id}
          className="group border-border bg-card/50 hover:border-primary/40 cursor-pointer rounded-xl border p-4 transition-all"
          onClick={() => onOpen(g)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary ring-primary/20 flex h-10 w-10 items-center justify-center rounded-lg ring-1">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-foreground font-semibold">{g.name}</h3>
                <p className="text-muted-foreground text-xs">
                  {g.subject} · {g.memberCount} members
                </p>
              </div>
            </div>
            {g.privacy === 'private' ? (
              <Lock className="text-muted-foreground h-3.5 w-3.5" />
            ) : (
              <Globe className="text-muted-foreground h-3.5 w-3.5" />
            )}
          </div>
          <p className="text-muted-foreground mt-2 line-clamp-2 text-xs">
            {g.description || 'No description'}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex gap-1">
              {g.tags.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px]"
                >
                  {t}
                </span>
              ))}
            </div>
            {onJoin && !myGroupIds?.has(g.id) ? (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onJoin(g);
                }}
              >
                Join
              </Button>
            ) : (
              <span className="text-muted-foreground text-xs">
                {formatRelativeTime(new Date(g.lastActivityAt))}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Empty State ---
function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="border-border bg-card/30 rounded-xl border border-dashed py-16 text-center">
      <Users className="text-muted-foreground/40 mx-auto mb-2 h-8 w-8" />
      <p className="text-foreground text-sm font-medium">No groups yet</p>
      <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-sm">
        Create a study group or join one from Discover.
      </p>
      <Button className="mt-4" onClick={onCreate}>
        <Plus className="mr-2 h-4 w-4" /> Create Group
      </Button>
    </div>
  );
}

// --- Create Group Dialog ---
function CreateGroupDialog({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (c: CreateGroupConfig) => Promise<void>;
}) {
  const [config, setConfig] = useState<CreateGroupConfig>(DEFAULT_GROUP_CONFIG);
  const [tagInput, setTagInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    await onCreate(config);
    setIsCreating(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Study Group</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">Group Name</Label>
            <Input
              id="group-name"
              value={config.name}
              onChange={(e) => setConfig({ ...config, name: e.target.value })}
              placeholder="e.g. Calculus Study Squad"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="group-desc">Description</Label>
            <Textarea
              id="group-desc"
              value={config.description}
              onChange={(e) => setConfig({ ...config, description: e.target.value })}
              placeholder="What's this group about?"
              rows={2}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="group-subject">Subject</Label>
              <select
                id="group-subject"
                value={config.subject}
                onChange={(e) => setConfig({ ...config, subject: e.target.value })}
                className="border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm"
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s} className="bg-card">
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="group-class">Class/Level</Label>
              <Input
                id="group-class"
                value={config.classLevel}
                onChange={(e) => setConfig({ ...config, classLevel: e.target.value })}
                placeholder="e.g. Grade 12"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="group-language">Language</Label>
              <select
                id="group-language"
                value={config.language}
                onChange={(e) => setConfig({ ...config, language: e.target.value })}
                className="border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm"
              >
                <option value="en" className="bg-card">
                  English
                </option>
                <option value="es" className="bg-card">
                  Spanish
                </option>
                <option value="fr" className="bg-card">
                  French
                </option>
                <option value="hi" className="bg-card">
                  Hindi
                </option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="group-max">Max Members</Label>
              <Input
                id="group-max"
                type="number"
                value={config.maxMembers}
                onChange={(e) => setConfig({ ...config, maxMembers: Number(e.target.value) })}
                min={2}
                max={500}
              />
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-foreground text-sm font-medium">Privacy</span>
            <div className="flex gap-2">
              {(['public', 'private'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setConfig({ ...config, privacy: p })}
                  aria-pressed={config.privacy === p}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm capitalize transition-all',
                    config.privacy === p
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:bg-accent',
                  )}
                >
                  {p === 'public' ? (
                    <Globe className="h-3.5 w-3.5" />
                  ) : (
                    <Lock className="h-3.5 w-3.5" />
                  )}{' '}
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="group-tag">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="group-tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tag + Enter"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && tagInput.trim()) {
                    setConfig({ ...config, tags: [...config.tags, tagInput.trim()] });
                    setTagInput('');
                  }
                }}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (tagInput.trim()) {
                    setConfig({ ...config, tags: [...config.tags, tagInput.trim()] });
                    setTagInput('');
                  }
                }}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {config.tags.map((t) => (
                <span
                  key={t}
                  className="bg-muted text-muted-foreground flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
                >
                  {t}
                  <button
                    onClick={() =>
                      setConfig({ ...config, tags: config.tags.filter((x) => x !== t) })
                    }
                    aria-label={`Remove tag ${t}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating || !config.name.trim()}>
            {isCreating ? 'Creating…' : 'Create Group'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Group Detail ---
function GroupDetail({
  group,
  onBack,
  onLeave,
  onDelete,
}: {
  group: StudyGroup;
  onBack: () => void;
  onLeave: () => void;
  onDelete: () => void;
}) {
  const [detailTab, setDetailTab] = useState<DetailTab>('chat');
  const members = useGroupMembers(group.id);
  const { messages, sessions, files, send, edit, del, react } = useGroupChat(group.id);
  const [chatInput, setChatInput] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [showEmojiFor, setShowEmojiFor] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleSend = async () => {
    if (!chatInput.trim()) return;
    await send(chatInput, replyTo ?? undefined);
    setChatInput('');
    setReplyTo(null);
  };

  const ROLE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    owner: Crown,
    admin: Shield,
    moderator: UserCircle,
    member: Users,
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="border-border flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} aria-label="Back to groups list">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-foreground text-sm font-semibold">{group.name}</h2>
            <p className="text-muted-foreground text-xs">
              {group.memberCount} members · {group.subject}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={onLeave} className="text-xs">
            Leave
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive text-xs">
            Delete
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-border flex gap-1 border-b px-4">
        {[
          { id: 'chat' as DetailTab, label: 'Chat', icon: MessageSquare },
          { id: 'members' as DetailTab, label: `Members (${members.length})`, icon: Users },
          { id: 'sessions' as DetailTab, label: 'Sessions', icon: Calendar },
          { id: 'files' as DetailTab, label: 'Files', icon: Files },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setDetailTab(id)}
            className={cn(
              'flex items-center gap-1 border-b-2 px-3 py-2 text-xs font-medium transition-colors',
              detailTab === id
                ? 'border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground border-transparent',
            )}
          >
            <Icon className="h-3 w-3" /> {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {detailTab === 'chat' && (
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center text-sm">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'group hover:bg-accent/30 rounded-lg p-3 transition-colors',
                    msg.isPinned && 'border-primary bg-primary/5 border-l-2',
                  )}
                >
                  {msg.replyTo && (
                    <p className="text-muted-foreground mb-1 text-xs">↩ Replying to a message</p>
                  )}
                  <div className="flex items-start gap-2">
                    <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                      {msg.displayName?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground text-sm font-medium">
                          {msg.displayName}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {formatRelativeTime(new Date(msg.createdAt))}
                        </span>
                        {msg.isEdited && (
                          <span className="text-muted-foreground text-[10px]">(edited)</span>
                        )}
                      </div>
                      {editingId === msg.id ? (
                        <div className="mt-1 flex gap-2">
                          <Input
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="h-8 text-sm"
                          />
                          <Button
                            size="sm"
                            onClick={async () => {
                              await edit(msg.id, editContent);
                              setEditingId(null);
                            }}
                          >
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="text-muted-foreground mt-0.5 text-sm">
                          <MarkdownRenderer content={msg.content} />
                        </div>
                      )}
                      {/* Reactions */}
                      {Object.entries(msg.reactions).length > 0 && (
                        <div className="mt-1 flex gap-1">
                          {Object.entries(msg.reactions).map(([emoji, uids]) => (
                            <span key={emoji} className="bg-muted rounded-full px-2 py-0.5 text-xs">
                              {emoji} {uids.length}
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Attachments */}
                      {msg.attachments.length > 0 && (
                        <div className="mt-1 flex gap-2">
                          {msg.attachments.map((a, i) => (
                            <span
                              key={i}
                              className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs"
                            >
                              {a.filename}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Actions */}
                    <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => {
                          setShowEmojiFor(showEmojiFor === msg.id ? null : msg.id);
                        }}
                        className="text-muted-foreground hover:text-foreground rounded p-1"
                        aria-label="Add reaction"
                      >
                        <Smile className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setReplyTo(msg.id)}
                        className="text-muted-foreground hover:text-foreground rounded p-1"
                        aria-label="Reply to message"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(msg.id);
                          setEditContent(msg.content);
                        }}
                        className="text-muted-foreground hover:text-foreground rounded p-1"
                        aria-label="Edit message"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => del(msg.id)}
                        className="text-muted-foreground hover:text-destructive rounded p-1"
                        aria-label="Delete message"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {/* Emoji picker */}
                  {showEmojiFor === msg.id && (
                    <div className="mt-1 flex gap-1">
                      {EMOJIS.map((e) => (
                        <button
                          key={e}
                          onClick={() => {
                            react(msg.id, e, msg.reactions);
                            setShowEmojiFor(null);
                          }}
                          className="hover:bg-accent rounded p-1 text-lg"
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {detailTab === 'members' && (
          <div className="space-y-2">
            {members.map((m) => {
              const RoleIcon = ROLE_ICONS[m.role] ?? Users;
              return (
                <div
                  key={m.id}
                  className="border-border bg-card/30 flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold">
                      {m.displayName?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div>
                      <p className="text-foreground text-sm font-medium">{m.displayName}</p>
                      <p className="text-muted-foreground text-xs capitalize">
                        {m.role} ·{' '}
                        {m.isOnline
                          ? '🟢 Online'
                          : `Last seen ${formatRelativeTime(new Date(m.lastSeenAt))}`}
                      </p>
                    </div>
                  </div>
                  <RoleIcon className="text-muted-foreground h-4 w-4" />
                </div>
              );
            })}
          </div>
        )}

        {detailTab === 'sessions' && (
          <div className="space-y-2">
            {sessions.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                No sessions scheduled.
              </p>
            ) : (
              sessions.map((s) => (
                <div key={s.id} className="border-border bg-card/30 rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground text-sm font-medium">{s.title}</span>
                    <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs capitalize">
                      {s.status}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">{s.description}</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {new Date(s.scheduledAt).toLocaleString()} · {s.durationMinutes} min
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {detailTab === 'files' && (
          <div className="space-y-2">
            {files.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">No files shared yet.</p>
            ) : (
              files.map((f) => (
                <div
                  key={f.id}
                  className="border-border bg-card/30 flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-foreground text-sm font-medium">{f.filename}</p>
                    <p className="text-muted-foreground text-xs">
                      {f.uploadedByName} · {formatRelativeTime(new Date(f.createdAt))}
                    </p>
                  </div>
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-xs hover:underline"
                  >
                    Download
                  </a>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Chat input */}
      {detailTab === 'chat' && (
        <div className="border-border border-t p-4">
          {replyTo && (
            <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs">
              <span>Replying to message</span>
              <button onClick={() => setReplyTo(null)} aria-label="Cancel reply">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type a message…"
              aria-label="Type a message"
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!chatInput.trim()} aria-label="Send message">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
