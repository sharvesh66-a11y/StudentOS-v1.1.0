'use client';
/**
 * Notes Hub View — main container with tabs: Notes, Generate, Doubt Solver.
 */
import { memo, useState } from 'react';
import {
  Sparkles,
  HelpCircle,
  Search,
  Pin,
  Star,
  Bookmark,
  Trash2,
  FileText,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MarkdownRenderer } from '@/features/junova';
import { useNotes } from '../hooks/use-notes';
import { useDoubts } from '../hooks/use-doubts';
import { useNotesStore } from '../store/notes.store';
import { NOTE_TYPES } from '../constants';
import { SUBJECTS } from '@/features/junova/constants';
import { formatRelativeTime } from '@/utils/format';
import { cn } from '@/lib/utils';
import type { Note } from '../types';

type Tab = 'notes' | 'generate' | 'doubt';

export function NotesHubView() {
  const [tab, setTab] = useState<Tab>('notes');
  const {
    notes,
    isLoading,
    isGenerating,
    generateNotes,
    deleteNote,
    togglePin,
    toggleFavourite,
    toggleBookmark,
  } = useNotes();
  const { doubts, isSolving, solveDoubt, deleteDoubt } = useDoubts();
  const { noteConfig, setNoteConfig, doubtConfig, setDoubtConfig } = useNotesStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedDoubt, setSelectedDoubt] = useState<(typeof doubts)[0] | null>(null);

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      !searchQuery ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = !filterSubject || n.subject === filterSubject;
    return matchesSearch && matchesSubject;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const regularNotes = filteredNotes.filter((n) => !n.isPinned);

  const handleGenerate = async () => {
    await generateNotes(noteConfig);
    setTab('notes');
  };

  const handleSolveDoubt = async () => {
    await solveDoubt(doubtConfig);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">Notes Hub</h1>
        <p className="text-muted-foreground text-sm">
          AI-generated notes, flashcards, and doubt solving — powered by Junova AI.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-border mb-6 flex gap-1 border-b">
        {[
          { id: 'notes' as Tab, label: 'My Notes', icon: FileText },
          { id: 'generate' as Tab, label: 'Generate', icon: Sparkles },
          { id: 'doubt' as Tab, label: 'Doubt Solver', icon: HelpCircle },
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
            {id === 'notes' && notes.length > 0 && (
              <span className="bg-muted ml-1 rounded-full px-1.5 py-0.5 text-xs">
                {notes.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* --- Notes Tab --- */}
      {tab === 'notes' && (
        <>
          {/* Search + filter */}
          <div className="mb-4 flex gap-3">
            <div className="relative flex-1">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes…"
                aria-label="Search notes"
                className="pl-9"
              />
            </div>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              aria-label="Filter by subject"
              className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
            >
              <option value="" className="bg-card">
                All subjects
              </option>
              {[...new Set(notes.map((n) => n.subject))].map((s) => (
                <option key={s} value={s} className="bg-card">
                  {s}
                </option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="text-muted-foreground py-12 text-center text-sm">Loading notes…</div>
          ) : filteredNotes.length === 0 ? (
            <div className="border-border bg-card/30 rounded-xl border border-dashed py-16 text-center">
              <FileText className="text-muted-foreground/40 mx-auto mb-2 h-8 w-8" />
              <p className="text-foreground text-sm font-medium">No notes yet</p>
              <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-sm">
                Generate AI notes or create your own to get started.
              </p>
              <Button className="mt-4" onClick={() => setTab('generate')}>
                <Sparkles className="mr-2 h-4 w-4" /> Generate Notes
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {pinnedNotes.length > 0 && (
                <div>
                  <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
                    <Pin className="mr-1 inline h-3 w-3" /> Pinned
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {pinnedNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onView={setSelectedNote}
                        onDelete={deleteNote}
                        onPin={togglePin}
                        onFav={toggleFavourite}
                        onBookmark={toggleBookmark}
                      />
                    ))}
                  </div>
                </div>
              )}
              {regularNotes.length > 0 && (
                <div>
                  {pinnedNotes.length > 0 && (
                    <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
                      All Notes
                    </p>
                  )}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {regularNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onView={setSelectedNote}
                        onDelete={deleteNote}
                        onPin={togglePin}
                        onFav={toggleFavourite}
                        onBookmark={toggleBookmark}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* --- Generate Tab --- */}
      {tab === 'generate' && (
        <div className="border-border bg-card/50 mx-auto max-w-2xl space-y-6 rounded-xl border p-6 backdrop-blur-sm">
          <div className="text-center">
            <div className="bg-primary/10 ring-primary/20 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl ring-1">
              <Sparkles className="text-primary h-6 w-6" />
            </div>
            <h2 className="text-foreground text-lg font-semibold">Generate AI Notes</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Junova AI will create personalized notes with key points, definitions, formulas,
              examples, and flashcards.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="note-subject" className="text-foreground text-sm font-medium">
                Subject
              </label>
              <select
                id="note-subject"
                value={noteConfig.subject}
                onChange={(e) => setNoteConfig({ subject: e.target.value })}
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
              <label htmlFor="note-chapter" className="text-foreground text-sm font-medium">
                Chapter
              </label>
              <Input
                id="note-chapter"
                value={noteConfig.chapter}
                onChange={(e) => setNoteConfig({ chapter: e.target.value })}
                placeholder="e.g. Chapter 5"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="note-topic" className="text-foreground text-sm font-medium">
              Topic (optional)
            </label>
            <Input
              id="note-topic"
              value={noteConfig.topic}
              onChange={(e) => setNoteConfig({ topic: e.target.value })}
              placeholder="e.g. Photosynthesis"
            />
          </div>
          <div className="space-y-2">
            <span className="text-foreground text-sm font-medium">Note Type</span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {NOTE_TYPES.map((nt) => (
                <button
                  key={nt.value}
                  onClick={() => setNoteConfig({ type: nt.value })}
                  className={cn(
                    'rounded-lg border p-3 text-left transition-all',
                    noteConfig.type === nt.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-accent',
                  )}
                >
                  <div className="text-foreground text-sm font-medium">{nt.label}</div>
                  <div className="text-muted-foreground text-xs">{nt.description}</div>
                </button>
              ))}
            </div>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !noteConfig.chapter.trim()}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              'Generating…'
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Generate Notes
              </>
            )}
          </Button>
        </div>
      )}

      {/* --- Doubt Solver Tab --- */}
      {tab === 'doubt' && (
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="border-border bg-card/50 rounded-xl border p-6 backdrop-blur-sm">
            <div className="mb-4 text-center">
              <div className="bg-primary/10 ring-primary/20 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl ring-1">
                <HelpCircle className="text-primary h-6 w-6" />
              </div>
              <h2 className="text-foreground text-lg font-semibold">AI Doubt Solver</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Ask any question — Junova will solve it step-by-step with multiple methods, common
                mistakes, and exam tips.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="doubt-subject" className="text-foreground text-sm font-medium">
                  Subject
                </label>
                <select
                  id="doubt-subject"
                  value={doubtConfig.subject}
                  onChange={(e) => setDoubtConfig({ subject: e.target.value })}
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
                <label htmlFor="doubt-topic" className="text-foreground text-sm font-medium">
                  Topic (optional)
                </label>
                <Input
                  id="doubt-topic"
                  value={doubtConfig.topic}
                  onChange={(e) => setDoubtConfig({ topic: e.target.value })}
                  placeholder="e.g. Quadratic Equations"
                />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <label htmlFor="doubt-question" className="text-foreground text-sm font-medium">
                Your Question
              </label>
              <textarea
                id="doubt-question"
                value={doubtConfig.question}
                onChange={(e) => setDoubtConfig({ question: e.target.value })}
                placeholder="Type your doubt here… e.g. How do I solve x² + 5x + 6 = 0?"
                rows={3}
                className="border-input w-full rounded-md border bg-transparent px-3 py-2 text-sm"
              />
            </div>
            <Button
              onClick={handleSolveDoubt}
              disabled={isSolving || !doubtConfig.question.trim()}
              className="mt-4 w-full"
              size="lg"
            >
              {isSolving ? (
                'Solving…'
              ) : (
                <>
                  <HelpCircle className="mr-2 h-4 w-4" /> Solve Doubt
                </>
              )}
            </Button>
          </div>

          {/* Doubt history */}
          {doubts.length > 0 && (
            <div className="border-border bg-card/50 rounded-xl border p-5 backdrop-blur-sm">
              <h3 className="text-foreground mb-3 text-sm font-semibold">Recent Doubts</h3>
              <div className="space-y-2">
                {doubts.slice(0, 10).map((d) => (
                  <div
                    key={d.id}
                    className="border-border bg-background/50 flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                  >
                    <button
                      onClick={() => setSelectedDoubt(d)}
                      className="flex-1 truncate text-left"
                    >
                      <span className="text-foreground font-medium">{d.question}</span>
                      <span className="text-muted-foreground ml-2 text-xs">
                        {d.subject} · {formatRelativeTime(new Date(d.createdAt))}
                      </span>
                    </button>
                    <button
                      onClick={() => deleteDoubt(d.id)}
                      className="text-muted-foreground/40 hover:text-destructive"
                      aria-label={`Delete doubt: ${d.question}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Note detail modal */}
      {selectedNote && (
        <div
          className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedNote(null)}
        >
          <div
            className="border-border bg-card max-h-[85vh] max-w-2xl overflow-y-auto rounded-xl border p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-foreground text-lg font-semibold">{selectedNote.title}</h2>
              <button
                onClick={() => setSelectedNote(null)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close note"
              >
                ✕
              </button>
            </div>
            {selectedNote.summary && (
              <p className="border-border bg-background/50 text-muted-foreground mb-4 rounded-lg border p-3 text-sm">
                {selectedNote.summary}
              </p>
            )}
            <MarkdownRenderer content={selectedNote.content} />
            {selectedNote.keyPoints.length > 0 && (
              <div className="mt-4">
                <h3 className="text-foreground mb-2 text-sm font-semibold">Key Points</h3>
                <ul className="space-y-1">
                  {selectedNote.keyPoints.map((kp, i) => (
                    <li key={i} className="text-muted-foreground text-sm">
                      • {kp.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {selectedNote.flashcards.length > 0 && (
              <div className="mt-4">
                <h3 className="text-foreground mb-2 text-sm font-semibold">
                  Flashcards ({selectedNote.flashcards.length})
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {selectedNote.flashcards.map((fc) => (
                    <div
                      key={fc.id}
                      className="border-border bg-background/50 rounded-lg border p-3 text-xs"
                    >
                      <p className="text-foreground font-medium">{fc.front}</p>
                      <p className="text-muted-foreground mt-1">{fc.back}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Doubt detail modal */}
      {selectedDoubt && (
        <div
          className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedDoubt(null)}
        >
          <div
            className="border-border bg-card max-h-[85vh] max-w-2xl overflow-y-auto rounded-xl border p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-foreground text-lg font-semibold">{selectedDoubt.question}</h2>
              <button
                onClick={() => setSelectedDoubt(null)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close doubt"
              >
                ✕
              </button>
            </div>
            <MarkdownRenderer content={selectedDoubt.solution} />
            {selectedDoubt.solutionMethods.length > 0 && (
              <div className="mt-4">
                <h3 className="text-foreground mb-2 text-sm font-semibold">Alternative Methods</h3>
                {selectedDoubt.solutionMethods.map((m, i) => (
                  <p key={i} className="text-muted-foreground mb-2 text-sm">
                    {i + 1}. {m}
                  </p>
                ))}
              </div>
            )}
            {selectedDoubt.commonMistakes.length > 0 && (
              <div className="mt-4">
                <h3 className="text-destructive mb-2 text-sm font-semibold">Common Mistakes</h3>
                {selectedDoubt.commonMistakes.map((m, i) => (
                  <p key={i} className="text-muted-foreground mb-1 text-sm">
                    • {m}
                  </p>
                ))}
              </div>
            )}
            {selectedDoubt.examTips.length > 0 && (
              <div className="mt-4">
                <h3 className="text-primary mb-2 text-sm font-semibold">Exam Tips</h3>
                {selectedDoubt.examTips.map((m, i) => (
                  <p key={i} className="text-muted-foreground mb-1 text-sm">
                    • {m}
                  </p>
                ))}
              </div>
            )}
            {selectedDoubt.followUpQuestions.length > 0 && (
              <div className="mt-4">
                <h3 className="text-foreground mb-2 text-sm font-semibold">Follow-up Questions</h3>
                {selectedDoubt.followUpQuestions.map((m, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setDoubtConfig({ question: m });
                      setSelectedDoubt(null);
                      setTab('doubt');
                    }}
                    className="border-border bg-background/50 text-foreground hover:bg-accent mb-1 block w-full rounded-lg border px-3 py-2 text-left text-sm"
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Note Card sub-component (memoized: props are stable references from
// useNotes useCallback + setSelectedNote useState setter, so React.memo skips
// re-renders of unchanged notes when the parent's filter/selection changes.)
const NoteCard = memo(function NoteCard({
  note,
  onView,
  onDelete,
  onPin,
  onFav,
  onBookmark,
}: {
  note: Note;
  onView: (note: Note) => void;
  onDelete: (id: string) => void;
  onPin: (id: string, isPinned: boolean) => void;
  onFav: (id: string, isFavourite: boolean) => void;
  onBookmark: (id: string, isBookmarked: boolean) => void;
}) {
  return (
    <div className="group border-border bg-card/50 hover:border-primary/40 rounded-xl border p-4 transition-all">
      <div className="flex items-start justify-between">
        <button onClick={() => onView(note)} className="flex-1 text-left">
          <h3 className="text-foreground font-semibold">{note.title}</h3>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {note.subject} · {note.chapter || 'General'}
          </p>
        </button>
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => onPin(note.id, note.isPinned)}
            className={cn(
              'text-muted-foreground hover:text-foreground',
              note.isPinned && 'text-primary',
            )}
            aria-label={note.isPinned ? 'Unpin note' : 'Pin note'}
          >
            <Pin className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onFav(note.id, note.isFavourite)}
            className={cn(
              'text-muted-foreground hover:text-foreground',
              note.isFavourite && 'text-amber-500',
            )}
            aria-label={note.isFavourite ? 'Remove from favourites' : 'Add to favourites'}
          >
            <Star className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onBookmark(note.id, note.isBookmarked)}
            className={cn(
              'text-muted-foreground hover:text-foreground',
              note.isBookmarked && 'text-primary',
            )}
            aria-label={note.isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            <Bookmark className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="text-muted-foreground hover:text-destructive"
            aria-label={`Delete note: ${note.title}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {note.summary && (
        <p className="text-muted-foreground mt-2 line-clamp-2 text-xs">{note.summary}</p>
      )}
      <div className="text-muted-foreground mt-2 flex items-center gap-2 text-xs">
        {note.aiGenerated && (
          <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5">AI</span>
        )}
        {note.flashcards.length > 0 && <span>{note.flashcards.length} flashcards</span>}
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" /> {formatRelativeTime(new Date(note.updatedAt))}
        </span>
      </div>
    </div>
  );
});
