import { useState } from 'react';
import { 
  Lightbulb, Plus, RotateCw, ChevronRight, CheckCircle2, 
  Clock, BookOpen, X, ArrowRight, ArrowLeft, Shuffle
} from 'lucide-react';
import { usePersistentState } from '../lib/storage';
import { scheduleCard, isDue, todayISO } from '../lib/srs';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  /** Display label derived from `ease`. Kept in sync by `scheduleCard`. */
  difficulty: 'easy' | 'medium' | 'hard';
  /** SM-2 ease factor (1.3–2.5). Present on cards studied after the SRS update. */
  ease?: number;
  /** Current spacing interval in days. Drives the next interval after each review. */
  interval?: number;
  lastReviewed?: string;
  nextReview?: string;
  reviewCount: number;
}

/** Legacy cards only had a string label — seed a sensible ease from it. */
function easeFromLabel(label: 'easy' | 'medium' | 'hard'): number {
  if (label === 'easy') return 2.5;
  if (label === 'medium') return 2.0;
  return 1.5;
}

interface Deck {
  id: string;
  name: string;
  subject: string;
  cards: Flashcard[];
  color: string;
  lastStudied?: string;
}

const initialDecks: Deck[] = [
  {
    id: '1',
    name: 'Algorithms Fundamentals',
    subject: 'Algorithms',
    color: '#8170ED',
    lastStudied: '2026-10-30',
    cards: [
      { id: '1', question: 'What is the time complexity of binary search?', answer: 'O(log n)', difficulty: 'easy', reviewCount: 5, nextReview: '2026-11-02' },
      { id: '2', question: 'Explain the difference between BFS and DFS', answer: 'BFS explores level by level using a queue. DFS explores as deep as possible using a stack/recursion.', difficulty: 'medium', reviewCount: 3, nextReview: '2026-11-01' },
      { id: '3', question: 'What is dynamic programming?', answer: 'A method for solving complex problems by breaking them into simpler subproblems and storing their solutions.', difficulty: 'medium', reviewCount: 2, nextReview: '2026-10-31' },
      { id: '4', question: 'What is the Master Theorem used for?', answer: 'Solving recurrence relations of divide-and-conquer algorithms to determine time complexity.', difficulty: 'hard', reviewCount: 1 },
    ],
  },
  {
    id: '2',
    name: 'Machine Learning Basics',
    subject: 'Machine Learning',
    color: '#43B889',
    lastStudied: '2026-10-28',
    cards: [
      { id: '5', question: 'What is overfitting?', answer: 'When a model learns the training data too well, including noise, and performs poorly on new data.', difficulty: 'easy', reviewCount: 4, nextReview: '2026-11-03' },
      { id: '6', question: 'Explain bias-variance tradeoff', answer: 'High bias = underfitting (too simple). High variance = overfitting (too complex). Goal: find the sweet spot.', difficulty: 'medium', reviewCount: 2, nextReview: '2026-11-01' },
      { id: '7', question: 'What is gradient descent?', answer: 'An optimization algorithm that iteratively adjusts parameters to minimize a loss function by moving in the direction of steepest descent.', difficulty: 'medium', reviewCount: 3 },
    ],
  },
  {
    id: '3',
    name: 'System Design',
    subject: 'System Design',
    color: '#E5AA55',
    cards: [
      { id: '8', question: 'What is load balancing?', answer: 'Distributing incoming network traffic across multiple servers to ensure reliability and performance.', difficulty: 'easy', reviewCount: 2, nextReview: '2026-11-02' },
      { id: '9', question: 'Explain horizontal vs vertical scaling', answer: 'Horizontal: add more machines. Vertical: add more power (CPU/RAM) to existing machine.', difficulty: 'medium', reviewCount: 1 },
    ],
  },
];

export default function Flashcards() {
  const [decks, setDecks] = usePersistentState<Deck[]>('decks', initialDecks);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [studyMode, setStudyMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studiedCards, setStudiedCards] = useState<string[]>([]);
  const [showNewDeck, setShowNewDeck] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckSubject, setNewDeckSubject] = useState('');

  const today = todayISO();
  const totalCards = decks.reduce((acc, d) => acc + d.cards.length, 0);
  const dueCards = decks.reduce((acc, d) => acc + d.cards.filter(c => isDue(c)).length, 0);

  // Keep the open deck in sync with persisted edits (e.g. after rating a card).
  const liveSelectedDeck = selectedDeck
    ? decks.find(d => d.id === selectedDeck.id) ?? selectedDeck
    : null;

  const handleStartStudy = (deck: Deck) => {
    setSelectedDeck(deck);
    setStudyMode(true);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setStudiedCards([]);
  };

  const handleNextCard = () => {
    if (!liveSelectedDeck) return;
    if (currentCardIndex < liveSelectedDeck.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    } else {
      // Reached the end — save the deck's last-studied date and exit.
      finishSession();
    }
  };

  const finishSession = () => {
    if (liveSelectedDeck) {
      setDecks(decks.map(d =>
        d.id === liveSelectedDeck.id ? { ...d, lastStudied: today } : d
      ));
    }
    setStudyMode(false);
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
    }
  };

  /** Apply the SM-2 schedule for the rating, persist it, then advance. */
  const handleRateCard = (rating: 'hard' | 'medium' | 'easy') => {
    if (!liveSelectedDeck) return;
    const card = liveSelectedDeck.cards[currentCardIndex];
    const updated = scheduleCard(
      {
        difficulty: card.ease ?? easeFromLabel(card.difficulty),
        interval: card.interval ?? 0,
        reviewCount: card.reviewCount,
        lastReviewed: card.lastReviewed,
        nextReview: card.nextReview,
      },
      rating
    );
    const newDecks = decks.map(d => {
      if (d.id !== liveSelectedDeck.id) return d;
      return {
        ...d,
        cards: d.cards.map(c =>
          c.id === card.id
            ? {
                ...c,
                ease: updated.difficulty,
                interval: updated.interval,
                difficulty: (updated.difficulty >= 2.2 ? 'easy' : updated.difficulty >= 1.8 ? 'medium' : 'hard') as Flashcard['difficulty'],
                reviewCount: updated.reviewCount,
                lastReviewed: updated.lastReviewed,
                nextReview: updated.nextReview,
              }
            : c
        ),
      };
    });
    setDecks(newDecks);
    if (!studiedCards.includes(card.id)) {
      setStudiedCards([...studiedCards, card.id]);
    }
    handleNextCard();
  };

  const handleCreateDeck = () => {
    if (!newDeckName.trim()) return;
    const colors = ['#8170ED', '#43B889', '#E5AA55', '#E16F79', '#A99BFF'];
    const deck: Deck = {
      id: Date.now().toString(),
      name: newDeckName.trim(),
      subject: newDeckSubject.trim() || 'General',
      color: colors[decks.length % colors.length],
      cards: [],
    };
    setDecks([...decks, deck]);
    setNewDeckName('');
    setNewDeckSubject('');
    setShowNewDeck(false);
  };

  if (studyMode && liveSelectedDeck) {
    const card = liveSelectedDeck.cards[currentCardIndex];
    const progress = ((currentCardIndex + 1) / liveSelectedDeck.cards.length) * 100;

    return (
      <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-text">{liveSelectedDeck.name}</h2>
              <p className="text-xs text-muted">Card {currentCardIndex + 1} of {liveSelectedDeck.cards.length}</p>
            </div>
            <button 
              onClick={finishSession}
              className="p-2 rounded-lg hover:bg-elevated text-muted"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress */}
          <div className="h-1 bg-elevated rounded-full overflow-hidden mb-8">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>

          {/* Card */}
          <div 
            onClick={() => setShowAnswer(!showAnswer)}
            className="glass-card rounded-2xl p-8 md:p-12 min-h-[300px] flex flex-col items-center justify-center cursor-pointer hover:border-primary/30 transition-all glow-primary"
          >
            {!showAnswer ? (
              <>
                <p className="text-xs text-muted uppercase tracking-wider mb-4">Question</p>
                <p className="text-xl md:text-2xl font-medium text-text text-center">{card.question}</p>
                <p className="text-xs text-muted mt-6">Tap to reveal answer</p>
              </>
            ) : (
              <>
                <p className="text-xs text-muted uppercase tracking-wider mb-4">Answer</p>
                <p className="text-lg md:text-xl text-text text-center">{card.answer}</p>
              </>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mt-6">
            <button 
              onClick={handlePrevCard}
              disabled={currentCardIndex === 0}
              className="p-3 rounded-lg bg-elevated text-muted hover:text-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {showAnswer ? (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleRateCard('hard')}
                  className="px-4 py-2 rounded-lg bg-danger/15 text-danger text-sm font-medium hover:bg-danger/25 transition-colors"
                >
                  Hard
                </button>
                <button 
                  onClick={() => handleRateCard('medium')}
                  className="px-4 py-2 rounded-lg bg-warning/15 text-warning text-sm font-medium hover:bg-warning/25 transition-colors"
                >
                  Good
                </button>
                <button 
                  onClick={() => handleRateCard('easy')}
                  className="px-4 py-2 rounded-lg bg-success/15 text-success text-sm font-medium hover:bg-success/25 transition-colors"
                >
                  Easy
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowAnswer(true)}
                className="px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Show Answer
              </button>
            )}

            <button 
              onClick={handleNextCard}
              disabled={currentCardIndex === liveSelectedDeck.cards.length - 1}
              className="p-3 rounded-lg bg-elevated text-muted hover:text-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Session Stats */}
          <div className="mt-8 glass-card rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>Studied: {studiedCards.length}</span>
              <span>Remaining: {liveSelectedDeck.cards.length - studiedCards.length}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (liveSelectedDeck && !studyMode) {
    return (
      <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
        <button 
          onClick={() => setSelectedDeck(null)}
          className="flex items-center gap-1 text-sm text-muted hover:text-text mb-4 transition-colors"
        >
          ← Back to decks
        </button>

        <div className="glass-card rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-text">{liveSelectedDeck.name}</h2>
              <p className="text-sm text-muted mt-1">{liveSelectedDeck.cards.length} cards • {liveSelectedDeck.subject}</p>
            </div>
            <button 
              onClick={() => handleStartStudy(liveSelectedDeck)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Shuffle className="w-4 h-4" />
              Study Now
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg bg-elevated/30">
              <p className="text-lg font-bold text-text">{liveSelectedDeck.cards.length}</p>
              <p className="text-[10px] text-muted">Total Cards</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-elevated/30">
              <p className="text-lg font-bold text-warning">{liveSelectedDeck.cards.filter(c => isDue(c)).length}</p>
              <p className="text-[10px] text-muted">Due Today</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-elevated/30">
              <p className="text-lg font-bold text-success">{liveSelectedDeck.cards.filter(c => c.reviewCount >= 3).length}</p>
              <p className="text-[10px] text-muted">Mastered</p>
            </div>
          </div>
        </div>

        <h3 className="text-sm font-semibold text-text mb-3">Cards in this deck</h3>
        <div className="space-y-2">
          {liveSelectedDeck.cards.map((card) => (
            <div key={card.id} className="glass-card rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm text-text font-medium">{card.question}</p>
                  <p className="text-xs text-muted mt-1 line-clamp-1">{card.answer}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    card.difficulty === 'easy' ? 'bg-success/15 text-success' :
                    card.difficulty === 'medium' ? 'bg-warning/15 text-warning' : 'bg-danger/15 text-danger'
                  }`}>
                    {card.difficulty}
                  </span>
                  <span className="text-[10px] text-muted">{card.reviewCount}×</span>
                  {card.nextReview && (
                    <span className="text-[10px] text-muted">next: {card.nextReview}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {liveSelectedDeck.cards.length === 0 && (
            <p className="text-sm text-muted text-center py-8">No cards in this deck yet.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-primary" />
            Flashcards
          </h1>
          <p className="text-sm text-muted mt-1">Active recall for better retention</p>
        </div>
        <button 
          onClick={() => setShowNewDeck(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Deck</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="glass-card rounded-xl p-4">
          <p className="text-2xl font-bold text-text">{decks.length}</p>
          <p className="text-xs text-muted">Decks</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-2xl font-bold text-primary">{totalCards}</p>
          <p className="text-xs text-muted">Total Cards</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-2xl font-bold text-warning">{dueCards}</p>
          <p className="text-xs text-muted">Due Today</p>
        </div>
      </div>

      {/* Decks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {decks.map((deck) => {
          const dueCount = deck.cards.filter(c => isDue(c)).length;
          return (
            <div
              key={deck.id}
              onClick={() => setSelectedDeck(deck)}
              className="glass-card rounded-xl p-5 cursor-pointer hover:border-primary/30 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${deck.color}20` }}>
                  <BookOpen className="w-5 h-5" style={{ color: deck.color }} />
                </div>
                {dueCount > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-warning/15 text-warning font-medium">
                    {dueCount} due
                  </span>
                )}
              </div>
              <h3 className="text-sm font-semibold text-text mb-1">{deck.name}</h3>
              <p className="text-xs text-muted mb-3">{deck.subject}</p>
              <div className="flex items-center justify-between text-xs text-muted">
                <span>{deck.cards.length} cards</span>
                {deck.lastStudied && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {deck.lastStudied}
                  </span>
                )}
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handleStartStudy(deck); }}
                className="w-full mt-4 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
              >
                <Shuffle className="w-3 h-3" />
                Study
              </button>
            </div>
          );
        })}

        {/* Add Deck Card */}
        <div 
          onClick={() => setShowNewDeck(true)}
          className="rounded-xl border-2 border-dashed border-border hover:border-primary/40 p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors min-h-[200px]"
        >
          <Plus className="w-6 h-6 text-muted" />
          <span className="text-xs text-muted">New Deck</span>
        </div>
      </div>

      {/* New Deck Modal */}
      {showNewDeck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowNewDeck(false)} />
          <div className="relative glass-card rounded-2xl p-6 w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-text">New Deck</h2>
              <button onClick={() => setShowNewDeck(false)} className="p-1.5 rounded-lg hover:bg-elevated text-muted">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Deck Name</label>
                <input
                  type="text"
                  placeholder="e.g. Physics Fundamentals"
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateDeck()}
                  className="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Physics"
                  value={newDeckSubject}
                  onChange={(e) => setNewDeckSubject(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateDeck()}
                  className="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowNewDeck(false)} className="flex-1 px-4 py-2.5 rounded-lg bg-elevated text-text text-sm font-medium hover:bg-elevated/80 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleCreateDeck}
                disabled={!newDeckName.trim()}
                className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Create Deck
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
