/**
 * SM-2 spaced repetition.
 *
 * A simplified version of the SuperMemo-2 algorithm. Each card carries a
 * `difficulty` (ease factor proxy), an `interval` in days and a `reviewCount`.
 * Rating a card recomputes all three so the next review date is scheduled at
 * the right time for long-term retention.
 */

export type Rating = 'hard' | 'medium' | 'easy';

export interface SrsState {
  /** Ease multiplier. Lower = harder card = shorter intervals. Range ~1.3–2.5 */
  difficulty: number;
  /** Days until the card is next due. */
  interval: number;
  /** Total number of reviews. */
  reviewCount: number;
  /** ISO date (YYYY-MM-DD) of the last review. */
  lastReviewed?: string;
  /** ISO date (YYYY-MM-DD) the card becomes due. */
  nextReview?: string;
}

const MIN_INTERVAL = 1;
const MAX_INTERVAL = 365;

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toISODate(date: Date): string {
  // Use local time so a card scheduled "tomorrow" isn't shifted by timezone.
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Apply a rating to a card and return its new SRS state.
 * `state.difficulty` is reused as the ease factor (2.5 = easy, 1.3 = brutal).
 */
export function scheduleCard(state: SrsState, rating: Rating): SrsState {
  const ease = state.difficulty || 2.5;
  let nextEase = ease;
  let nextInterval: number;

  if (rating === 'easy') {
    nextEase = Math.min(ease + 0.1, 2.5);
    nextInterval = state.reviewCount === 0 ? 4 : Math.round(state.interval * nextEase);
  } else if (rating === 'medium') {
    nextInterval = state.reviewCount === 0 ? 2 : Math.round(state.interval * Math.max(ease, 1.3));
  } else {
    // Hard: drop the ease, restart the interval conservatively.
    nextEase = Math.max(ease - 0.2, 1.3);
    nextInterval = MIN_INTERVAL;
  }

  nextInterval = Math.min(Math.max(nextInterval, MIN_INTERVAL), MAX_INTERVAL);

  const today = new Date();
  return {
    difficulty: Number(nextEase.toFixed(2)),
    interval: nextInterval,
    reviewCount: state.reviewCount + 1,
    lastReviewed: toISODate(today),
    nextReview: toISODate(addDays(today, nextInterval)),
  };
}

/** True when a card is due on or before `today`. */
export function isDue(card: { nextReview?: string }, today = new Date()): boolean {
  if (!card.nextReview) return false;
  return card.nextReview <= toISODate(today);
}

export function todayISO(): string {
  return toISODate(new Date());
}

/** Human label for the ease value shown in the card list. */
export function easeLabel(difficulty: number): 'easy' | 'medium' | 'hard' {
  if (difficulty >= 2.2) return 'easy';
  if (difficulty >= 1.8) return 'medium';
  return 'hard';
}
