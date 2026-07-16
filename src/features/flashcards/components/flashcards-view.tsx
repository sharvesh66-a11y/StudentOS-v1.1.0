'use client';

/**
 * Flashcards View
 *
 * Create flashcard decks, study with flip cards, and track progress.
 * Supports manual card creation and AI-generated decks from topics.
 *
 * Features:
 *   - Create/edit/delete decks
 *   - Add/edit/delete flashcards
 *   - Study mode with card flipping
 *   - Progress tracking (known/unknown)
 *   - AI deck generation from a topic
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Layers,
  Play,
  Trash2,
  Edit2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Loader2,
  Brain,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

interface Deck {
  id: string;
  name: string;
  description: string;
  cards: Flashcard[];
  createdAt: number;
}

const SAMPLE_DECKS: Deck[] = [
  {
    id: 'deck-1',
    name: 'Biology — Cell Structure',
    description: 'Key terms about cellular biology',
    createdAt: Date.now() - 86400000,
    cards: [
      { id: 'c1', front: 'What is the powerhouse of the cell?', back: 'Mitochondria' },
      { id: 'c2', front: 'What organelle controls the cell?', back: 'The nucleus' },
      { id: 'c3', front: 'What is the function of ribosomes?', back: 'Protein synthesis' },
      { id: 'c4', front: 'What is the cell membrane made of?', back: 'Phospholipid bilayer' },
    ],
  },
  {
    id: 'deck-2',
    name: 'Spanish — Basic Vocabulary',
    description: 'Common Spanish words for beginners',
    createdAt: Date.now() - 172800000,
    cards: [
      { id: 'c5', front: 'Hello', back: 'Hola' },
      { id: 'c6', front: 'Thank you', back: 'Gracias' },
      { id: 'c7', front: 'Goodbye', back: 'Adiós' },
      { id: 'c8', front: 'Please', back: 'Por favor' },
    ],
  },
];

type View = 'list' | 'study' | 'edit';

export function FlashcardsView() {
  const [decks, setDecks] = useState<Deck[]>(SAMPLE_DECKS);
  const [view, setView] = useState<View>('list');
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDesc, setNewDeckDesc] = useState('');
  const [aiTopic, setAiTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Study mode state
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [unknownCount, setUnknownCount] = useState(0);
  const [studyComplete, setStudyComplete] = useState(false);

  // Edit mode state
  const [editingCards, setEditingCards] = useState<Flashcard[]>([]);

  const handleCreateDeck = () => {
    if (!newDeckName.trim()) {
      toast.error('Please enter a deck name');
      return;
    }
    const newDeck: Deck = {
      id: `deck-${Date.now()}`,
      name: newDeckName.trim(),
      description: newDeckDesc.trim(),
      cards: [],
      createdAt: Date.now(),
    };
    setDecks((prev) => [newDeck, ...prev]);
    setNewDeckName('');
    setNewDeckDesc('');
    setShowCreateDialog(false);
    toast.success('Deck created');
  };

  const handleGenerateAiDeck = () => {
    if (!aiTopic.trim()) {
      toast.error('Please enter a topic');
      return;
    }
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      const aiDeck: Deck = {
        id: `deck-ai-${Date.now()}`,
        name: `AI: ${aiTopic.trim()}`,
        description: `AI-generated flashcards about ${aiTopic.trim()}`,
        cards: [
          {
            id: `ai-${Date.now()}-1`,
            front: `What is the main concept of ${aiTopic.trim()}?`,
            back: `The main concept involves understanding the fundamental principles and their applications.`,
          },
          {
            id: `ai-${Date.now()}-2`,
            front: `Name a key term in ${aiTopic.trim()}.`,
            back: `A key term is "core principle" which refers to the foundational idea.`,
          },
          {
            id: `ai-${Date.now()}-3`,
            front: `What is an application of ${aiTopic.trim()}?`,
            back: `It is applied in real-world scenarios to solve practical problems.`,
          },
          {
            id: `ai-${Date.now()}-4`,
            front: `Explain ${aiTopic.trim()} in one sentence.`,
            back: `It is a subject that encompasses various interconnected concepts and methodologies.`,
          },
          {
            id: `ai-${Date.now()}-5`,
            front: `What are common misconceptions about ${aiTopic.trim()}?`,
            back: `A common misconception is oversimplifying the topic without understanding its nuances.`,
          },
        ],
        createdAt: Date.now(),
      };
      setDecks((prev) => [aiDeck, ...prev]);
      setIsGenerating(false);
      setAiTopic('');
      setShowAiDialog(false);
      toast.success('AI deck generated', {
        description: `${aiDeck.cards.length} cards created`,
      });
    }, 2000);
  };

  const handleStartStudy = (deck: Deck) => {
    if (deck.cards.length === 0) {
      toast.error('This deck has no cards. Add some first!');
      return;
    }
    setActiveDeck(deck);
    setCurrentCardIdx(0);
    setIsFlipped(false);
    setKnownCount(0);
    setUnknownCount(0);
    setStudyComplete(false);
    setView('study');
  };

  const handleAnswer = (known: boolean) => {
    if (known) setKnownCount((c) => c + 1);
    else setUnknownCount((c) => c + 1);

    if (currentCardIdx + 1 >= (activeDeck?.cards.length ?? 0)) {
      setStudyComplete(true);
    } else {
      setCurrentCardIdx((i) => i + 1);
      setIsFlipped(false);
    }
  };

  const handleEditDeck = (deck: Deck) => {
    setActiveDeck(deck);
    setEditingCards([...deck.cards]);
    setView('edit');
  };

  const handleSaveCards = () => {
    if (!activeDeck) return;
    setDecks((prev) =>
      prev.map((d) => (d.id === activeDeck.id ? { ...d, cards: editingCards } : d)),
    );
    toast.success('Cards saved');
    setView('list');
    setActiveDeck(null);
  };

  const handleAddCard = () => {
    setEditingCards((prev) => [...prev, { id: `card-${Date.now()}`, front: '', back: '' }]);
  };

  const handleUpdateCard = (id: string, field: 'front' | 'back', value: string) => {
    setEditingCards((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const handleDeleteCard = (id: string) => {
    setEditingCards((prev) => prev.filter((c) => c.id !== id));
  };

  const handleDeleteDeck = (id: string) => {
    setDecks((prev) => prev.filter((d) => d.id !== id));
    toast.success('Deck deleted');
  };

  // -----------------------------------------------------------------------
  // LIST VIEW
  // -----------------------------------------------------------------------
  if (view === 'list') {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 ring-primary/20 flex h-12 w-12 items-center justify-center rounded-xl ring-1">
              <Layers className="text-primary h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Flashcards</h1>
              <p className="text-muted-foreground text-sm">Study smarter with spaced repetition</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowAiDialog(true)}>
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              AI Generate
            </Button>
            <Button size="sm" onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-3.5 w-3.5" />
              New Deck
            </Button>
          </div>
        </div>

        {/* Decks grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck, i) => (
            <motion.div
              key={deck.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="group hover:border-border hover:shadow-primary/5 relative overflow-hidden p-5 transition-all hover:shadow-lg">
                <div
                  aria-hidden
                  className="bg-primary/10 pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-100"
                />
                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 ring-1 ring-white/10">
                      <Layers className="text-primary h-5 w-5" />
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditDeck(deck)}
                        className="text-muted-foreground hover:bg-muted hover:text-foreground rounded p-1"
                        aria-label="Edit"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteDeck(deck.id)}
                        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded p-1"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <h3 className="mt-3 font-semibold">{deck.name}</h3>
                  <p className="text-muted-foreground mt-1 text-sm">{deck.description}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="secondary">{deck.cards.length} cards</Badge>
                    <span className="text-muted-foreground text-xs">
                      {new Date(deck.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Button
                    className="mt-4 w-full"
                    size="sm"
                    onClick={() => handleStartStudy(deck)}
                    disabled={deck.cards.length === 0}
                  >
                    <Play className="mr-2 h-3.5 w-3.5" />
                    Study
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Create deck dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Deck</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="deck-name">Deck Name</Label>
                <Input
                  id="deck-name"
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  placeholder="e.g. Chemistry — Periodic Table"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deck-desc">Description (optional)</Label>
                <Textarea
                  id="deck-desc"
                  value={newDeckDesc}
                  onChange={(e) => setNewDeckDesc(e.target.value)}
                  placeholder="Brief description of what this deck covers"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateDeck}>Create Deck</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* AI generate dialog */}
        <Dialog open={showAiDialog} onOpenChange={setShowAiDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="text-primary h-5 w-5" />
                Generate AI Deck
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="ai-topic">Topic</Label>
                <Input
                  id="ai-topic"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="e.g. World War II, Calculus Derivatives, Spanish Verbs"
                />
                <p className="text-muted-foreground text-xs">
                  AI will generate 5 flashcards about your topic.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAiDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleGenerateAiDeck} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // STUDY VIEW
  // -----------------------------------------------------------------------
  if (view === 'study' && activeDeck) {
    if (studyComplete) {
      const total = activeDeck.cards.length;
      const percentage = Math.round((knownCount / total) * 100);
      return (
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-16">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 ring-4 ring-green-500/20">
              <CheckCircle2 className="h-10 w-10 text-green-400" />
            </div>
          </motion.div>
          <h2 className="mt-6 text-2xl font-bold">Study Complete!</h2>
          <p className="text-muted-foreground mt-2">
            You studied {total} cards from &ldquo;{activeDeck.name}&rdquo;
          </p>
          <div className="mt-8 grid w-full grid-cols-2 gap-4">
            <Card className="p-6 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-green-400" />
              <div className="mt-2 text-3xl font-bold text-green-400">{knownCount}</div>
              <div className="text-muted-foreground text-xs">Known</div>
            </Card>
            <Card className="p-6 text-center">
              <XCircle className="mx-auto h-8 w-8 text-red-400" />
              <div className="mt-2 text-3xl font-bold text-red-400">{unknownCount}</div>
              <div className="text-muted-foreground text-xs">Need Review</div>
            </Card>
          </div>
          <div className="mt-6 w-full">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Score</span>
              <span className="font-bold">{percentage}%</span>
            </div>
            <div className="bg-muted h-3 overflow-hidden rounded-full">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
              />
            </div>
          </div>
          <div className="mt-8 flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setCurrentCardIdx(0);
                setIsFlipped(false);
                setKnownCount(0);
                setUnknownCount(0);
                setStudyComplete(false);
              }}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Study Again
            </Button>
            <Button onClick={() => setView('list')}>Back to Decks</Button>
          </div>
        </div>
      );
    }

    const card = activeDeck.cards[currentCardIdx];
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setView('list')}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Exit
          </Button>
          <div className="text-center">
            <p className="text-sm font-medium">{activeDeck.name}</p>
            <p className="text-muted-foreground text-xs">
              Card {currentCardIdx + 1} of {activeDeck.cards.length}
            </p>
          </div>
          <div className="flex gap-2 text-xs">
            <Badge variant="outline" className="border-green-500/30 text-green-500">
              {knownCount} known
            </Badge>
            <Badge variant="outline" className="border-red-500/30 text-red-500">
              {unknownCount} review
            </Badge>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-muted mb-6 h-2 overflow-hidden rounded-full">
          <motion.div
            animate={{
              width: `${((currentCardIdx + 1) / activeDeck.cards.length) * 100}%`,
            }}
            className="from-primary to-secondary h-full rounded-full bg-gradient-to-r"
          />
        </div>

        {/* Flashcard */}
        <div className="mb-6" style={{ perspective: '1000px' }}>
          <motion.div
            className="relative h-80 w-full cursor-pointer"
            style={{ transformStyle: 'preserve-3d' }}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => setIsFlipped((v) => !v)}
          >
            {/* Front */}
            <div
              className="border-border/50 bg-card/60 absolute inset-0 flex flex-col items-center justify-center rounded-2xl border p-8 text-center backdrop-blur-xl"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <Badge variant="secondary" className="mb-4">
                Question
              </Badge>
              <p className="text-xl font-medium">{card.front}</p>
              <p className="text-muted-foreground absolute bottom-4 text-xs">Click to flip</p>
            </div>
            {/* Back */}
            <div
              className="border-primary/30 from-primary/10 to-secondary/10 absolute inset-0 flex flex-col items-center justify-center rounded-2xl border bg-gradient-to-br p-8 text-center backdrop-blur-xl"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <Badge variant="secondary" className="mb-4">
                Answer
              </Badge>
              <p className="text-xl font-medium">{card.back}</p>
              <p className="text-muted-foreground absolute bottom-4 text-xs">Click to flip back</p>
            </div>
          </motion.div>
        </div>

        {/* Answer buttons */}
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-3"
          >
            <Button
              variant="outline"
              size="lg"
              className="border-red-500/30 text-red-500 hover:bg-red-500/10"
              onClick={() => handleAnswer(false)}
            >
              <X className="mr-2 h-5 w-5" />
              Need Review
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-green-500/30 text-green-500 hover:bg-green-500/10"
              onClick={() => handleAnswer(true)}
            >
              <Check className="mr-2 h-5 w-5" />I Knew It
            </Button>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (currentCardIdx > 0) {
                setCurrentCardIdx((i) => i - 1);
                setIsFlipped(false);
              }
            }}
            disabled={currentCardIdx === 0}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          <span className="text-muted-foreground text-xs">
            {Math.round(((currentCardIdx + 1) / activeDeck.cards.length) * 100)}% complete
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (currentCardIdx < activeDeck.cards.length - 1) {
                setCurrentCardIdx((i) => i + 1);
                setIsFlipped(false);
              }
            }}
            disabled={currentCardIdx === activeDeck.cards.length - 1}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // EDIT VIEW
  // -----------------------------------------------------------------------
  if (view === 'edit' && activeDeck) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setView('list')}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-xl font-bold">{activeDeck.name}</h1>
          </div>
          <Button size="sm" onClick={handleSaveCards}>
            <Check className="mr-2 h-3.5 w-3.5" />
            Save
          </Button>
        </div>

        {/* Cards list */}
        <div className="space-y-3">
          <AnimatePresence>
            {editingCards.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-muted-foreground text-xs font-medium">Card {i + 1}</span>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Delete card"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs">Front (Question)</Label>
                      <Textarea
                        value={card.front}
                        onChange={(e) => handleUpdateCard(card.id, 'front', e.target.value)}
                        placeholder="Question..."
                        rows={2}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs">Back (Answer)</Label>
                      <Textarea
                        value={card.back}
                        onChange={(e) => handleUpdateCard(card.id, 'back', e.target.value)}
                        placeholder="Answer..."
                        rows={2}
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {editingCards.length === 0 && (
            <Card className="flex h-40 items-center justify-center">
              <div className="text-center">
                <Brain className="text-muted-foreground/40 mx-auto h-8 w-8" />
                <p className="text-muted-foreground mt-2 text-sm">No cards yet</p>
              </div>
            </Card>
          )}
        </div>

        {/* Add card button */}
        <Button className="mt-4 w-full" variant="outline" onClick={handleAddCard}>
          <Plus className="mr-2 h-4 w-4" />
          Add Card
        </Button>
      </div>
    );
  }

  return null;
}
