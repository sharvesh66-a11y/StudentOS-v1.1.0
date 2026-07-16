'use client';
/**
 * Community View — full social network dashboard.
 * Tabs: Feed, Communities, Profile.
 */
import { useState, useMemo, useCallback, memo } from 'react';
import {
  Globe,
  Search,
  Plus,
  Sparkles,
  Loader2,
  Pin,
  Bookmark,
  Trash2,
  Heart,
  ThumbsUp,
  Lightbulb,
  Brain,
  PartyPopper,
  Send,
  Users,
  MessageSquare,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { MarkdownRenderer } from '@/features/junova';
import { useCommunity } from '../hooks/use-community';
import { REACTIONS } from '../types';
import { formatRelativeTime } from '@/utils/format';
import { cn } from '@/lib/utils';
import type { CommunityPost } from '../types';

type Tab = 'feed' | 'communities' | 'profile';
const REACTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  like: ThumbsUp,
  love: Heart,
  helpful: Lightbulb,
  genius: Brain,
  celebrate: PartyPopper,
};

export function CommunityView() {
  const c = useCommunity();
  const [tab, setTab] = useState<Tab>('feed');
  const [search, setSearch] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateCommunity, setShowCreateCommunity] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postTags, setPostTags] = useState('');
  const [, setCommentFor] = useState<string | null>(null);
  const [, setCommentText] = useState('');
  const [aiTopic, setAiTopic] = useState('');

  const filteredPosts = useMemo(
    () =>
      c.posts.filter(
        (p) =>
          !search ||
          p.content.toLowerCase().includes(search.toLowerCase()) ||
          p.authorName.toLowerCase().includes(search.toLowerCase()),
      ),
    [c.posts, search],
  );
  const pinnedPosts = filteredPosts.filter((p) => p.isPinned);
  const regularPosts = filteredPosts.filter((p) => !p.isPinned);

  // Stable callback so PostCard's React.memo doesn't re-render every post when
  // the comment-box state changes.
  const handleOpenComment = useCallback((id: string) => {
    setCommentFor(id);
    setCommentText('');
  }, []);

  if (c.isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-6 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            Student Community
          </h1>
          <p className="text-muted-foreground text-sm">
            Connect, share knowledge, and learn together.
          </p>
        </div>
        {tab === 'feed' && (
          <Button onClick={() => setShowCreatePost(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Post
          </Button>
        )}
        {tab === 'communities' && (
          <Button onClick={() => setShowCreateCommunity(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-border flex gap-1 border-b">
        {[
          { id: 'feed' as Tab, label: 'Feed', icon: Globe },
          { id: 'communities' as Tab, label: 'Communities', icon: Users },
          { id: 'profile' as Tab, label: 'Profile', icon: MessageSquare },
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

      {/* Search */}
      {tab !== 'profile' && (
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === 'feed' ? 'Search posts…' : 'Search communities…'}
            aria-label={tab === 'feed' ? 'Search posts' : 'Search communities'}
            className="pl-9"
          />
        </div>
      )}

      {/* --- Feed --- */}
      {tab === 'feed' && (
        <div className="space-y-4">
          {pinnedPosts.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              onReact={c.toggleReaction}
              onPin={c.togglePin}
              onBookmark={c.toggleBookmark}
              onDelete={c.removePost}
              onComment={handleOpenComment}
              isPinned
            />
          ))}
          {regularPosts.length === 0 && pinnedPosts.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center text-sm">
              No posts yet. Be the first to share!
            </div>
          ) : (
            regularPosts.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                onReact={c.toggleReaction}
                onPin={c.togglePin}
                onBookmark={c.toggleBookmark}
                onDelete={c.removePost}
                onComment={handleOpenComment}
              />
            ))
          )}
        </div>
      )}

      {/* --- Communities --- */}
      {tab === 'communities' && (
        <div className="grid gap-3 sm:grid-cols-2">
          {c.communities.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center text-sm">
              No communities yet.
            </div>
          ) : (
            c.communities.map((comm) => (
              <div key={comm.id} className="border-border bg-card/50 rounded-xl border p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-foreground font-semibold">{comm.name}</h3>
                    <p className="text-muted-foreground text-xs">
                      {comm.subject} · {comm.memberCount} members
                    </p>
                  </div>
                  {comm.privacy === 'private' && (
                    <span className="text-muted-foreground text-xs">🔒</span>
                  )}
                </div>
                <p className="text-muted-foreground mt-2 line-clamp-2 text-xs">
                  {comm.description}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 w-full"
                  onClick={() => c.joinCommunity(comm.id)}
                >
                  Join
                </Button>
              </div>
            ))
          )}
        </div>
      )}

      {/* --- Profile --- */}
      {tab === 'profile' && c.communityProfile && (
        <div className="space-y-4">
          <div className="border-border bg-card/50 rounded-xl border p-5">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-full text-xl font-semibold">
                {c.communityProfile.displayName?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div>
                <h2 className="text-foreground text-lg font-semibold">
                  {c.communityProfile.displayName}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {c.communityProfile.bio || 'No bio yet'}
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-foreground text-xl font-semibold">
                  {c.communityProfile.postsCount}
                </div>
                <div className="text-muted-foreground text-xs">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-foreground text-xl font-semibold">
                  {c.communityProfile.followersCount}
                </div>
                <div className="text-muted-foreground text-xs">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-foreground text-xl font-semibold">
                  {c.communityProfile.reputationScore}
                </div>
                <div className="text-muted-foreground text-xs">Reputation</div>
              </div>
            </div>
            {c.communityProfile.skills.length > 0 && (
              <div className="mt-4">
                <p className="text-muted-foreground text-xs font-medium">Skills</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {c.communityProfile.skills.map((s) => (
                    <span
                      key={s}
                      className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Post Dialog */}
      {showCreatePost && (
        <div
          className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setShowCreatePost(false)}
        >
          <div
            className="border-border bg-card w-full max-w-lg rounded-xl border p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-foreground text-lg font-semibold">Create Post</h2>
              <button
                onClick={() => setShowCreatePost(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close create post dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* AI Generate */}
            <div className="mb-3 flex gap-2">
              <Input
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="AI: Enter a topic to generate a post…"
                aria-label="AI post topic"
                className="flex-1"
              />
              <Button
                size="sm"
                variant="outline"
                disabled={c.isGenerating || !aiTopic.trim()}
                onClick={async () => {
                  const text = await c.generatePost(aiTopic);
                  if (text) setPostContent(text);
                }}
              >
                {c.isGenerating ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}{' '}
                AI
              </Button>
            </div>
            <Textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              rows={5}
              placeholder="What's on your mind?"
              aria-label="Post content"
            />
            <div className="mt-3">
              <Label htmlFor="post-tags">Tags (comma-separated)</Label>
              <Input
                id="post-tags"
                value={postTags}
                onChange={(e) => setPostTags(e.target.value)}
                placeholder="e.g. math, physics, tips"
              />
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={() => setShowCreatePost(false)}>
                Cancel
              </Button>
              <Button
                disabled={!postContent.trim()}
                onClick={() => {
                  c.createPost({
                    content: postContent,
                    type: 'text',
                    tags: postTags
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean),
                  });
                  setShowCreatePost(false);
                  setPostContent('');
                  setPostTags('');
                  setAiTopic('');
                }}
              >
                <Send className="mr-2 h-4 w-4" /> Post
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Community Dialog */}
      {showCreateCommunity && (
        <div
          className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setShowCreateCommunity(false)}
        >
          <div
            className="border-border bg-card w-full max-w-md rounded-xl border p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-foreground text-lg font-semibold">Create Community</h2>
              <button
                onClick={() => setShowCreateCommunity(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close create community dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <CreateCommunityForm
              onCreate={async (name, desc, subject, privacy) => {
                await c.createCommunity(name, desc, subject, privacy);
                setShowCreateCommunity(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// --- PostCard (memoized: post prop + handlers are stable references from
// useCommunity useCallback + handleOpenComment useCallback, so React.memo skips
// re-renders of unchanged posts when the comment-box state changes.)
const PostCard = memo(function PostCard({
  post,
  onReact,
  onPin,
  onBookmark,
  onDelete,
  onComment,
  isPinned,
}: {
  post: CommunityPost;
  onReact: (id: string, emoji: string, reactions: Record<string, string[]>) => void;
  onPin: (id: string, pinned: boolean) => void;
  onBookmark: (id: string, bookmarked: boolean) => void;
  onDelete: (id: string) => void;
  onComment: (id: string) => void;
  isPinned?: boolean;
}) {
  return (
    <div
      className={cn(
        'border-border bg-card/50 rounded-xl border p-4 backdrop-blur-sm',
        isPinned && 'border-primary/30 bg-primary/5',
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold">
            {post.authorName?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="text-foreground text-sm font-medium">{post.authorName}</p>
            <p className="text-muted-foreground text-xs">
              {formatRelativeTime(new Date(post.createdAt))}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          {isPinned && <Pin className="text-primary h-3.5 w-3.5" />}
          <button
            onClick={() => onPin(post.id, post.isPinned)}
            className="text-muted-foreground/40 hover:text-foreground"
            aria-label={post.isPinned ? 'Unpin post' : 'Pin post'}
          >
            <Pin className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onBookmark(post.id, post.isBookmarked)}
            className={cn(
              'text-muted-foreground/40 hover:text-foreground',
              post.isBookmarked && 'text-primary',
            )}
            aria-label={post.isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            <Bookmark className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(post.id)}
            className="text-muted-foreground/40 hover:text-destructive"
            aria-label="Delete post"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="mt-3">
        <MarkdownRenderer content={post.content} />
      </div>
      {post.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {post.tags.map((t) => (
            <span
              key={t}
              className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs"
            >
              #{t}
            </span>
          ))}
        </div>
      )}
      {/* Reactions */}
      <div className="mt-3 flex items-center gap-2">
        {REACTIONS.map((r) => {
          const Icon = REACTION_ICONS[r.id] ?? ThumbsUp;
          const count = post.reactions[r.id]?.length ?? 0;
          return (
            <button
              key={r.id}
              onClick={() => onReact(post.id, r.id, post.reactions)}
              className={cn(
                'flex items-center gap-1 rounded-full border px-2 py-1 text-xs transition-colors',
                count > 0
                  ? 'border-primary/30 bg-primary/5 text-primary'
                  : 'border-border text-muted-foreground hover:bg-accent',
              )}
              aria-label={`${r.label}${count > 0 ? ` (${count})` : ''}`}
            >
              <Icon className="h-3 w-3" /> {count > 0 && count}
            </button>
          );
        })}
        <button
          onClick={() => onComment(post.id)}
          className="border-border text-muted-foreground hover:bg-accent flex items-center gap-1 rounded-full border px-2 py-1 text-xs"
          aria-label={`Comment${post.commentsCount ? ` (${post.commentsCount})` : ''}`}
        >
          <MessageSquare className="h-3 w-3" /> {post.commentsCount || ''}
        </button>
      </div>
    </div>
  );
});

function CreateCommunityForm({
  onCreate,
}: {
  onCreate: (
    name: string,
    desc: string,
    subject: string,
    privacy: 'public' | 'private',
  ) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [subject, setSubject] = useState('General');
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="community-name">Name</Label>
        <Input
          id="community-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Calculus Help Desk"
        />
      </div>
      <div>
        <Label htmlFor="community-desc">Description</Label>
        <Textarea
          id="community-desc"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={2}
        />
      </div>
      <div>
        <Label htmlFor="community-subject">Subject</Label>
        <Input
          id="community-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>
      <div>
        <span className="text-foreground text-sm font-medium">Privacy</span>
        <div className="flex gap-2">
          {(['public', 'private'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPrivacy(p)}
              aria-pressed={privacy === p}
              className={cn(
                'rounded-lg border px-3 py-2 text-sm capitalize transition-all',
                privacy === p
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground',
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <Button
        disabled={!name.trim()}
        onClick={() => onCreate(name, desc, subject, privacy)}
        className="w-full"
      >
        Create
      </Button>
    </div>
  );
}
