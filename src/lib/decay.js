import { toKey } from "./date";

// Decay is purely a VISUAL state layered on top of a habit's real progress.
// It never reduces totalCompletions, streak history, or growth stage —
// those are earned and permanent. Decay only reflects "how long since you
// last showed up," and one completion instantly clears it.

export const DECAY_STATES = {
  THRIVING: "thriving",
  WILTING: "wilting",
  WILTED: "wilted",
};

// Grace windows before a habit starts showing neglect, per frequency.
// Daily habits get 2 full missed days before wilting starts (so one busy
// day never triggers it) and are fully wilted after 4+ days.
// Weekly habits get a full week of grace, wilted after 2+ weeks.
const THRESHOLDS = {
  Daily: { wilting: 2, wilted: 4 },
  Weekly: { wilting: 7, wilted: 14 },
  Custom: { wilting: 2, wilted: 4 }, // treat like Daily — safest default
};

function mostRecentCompletion(completedDates) {
  if (!completedDates.length) return null;
  return [...completedDates].sort().at(-1);
}

// Days between the most recent completion and today. If a habit has never
// been completed, we measure from its creation date instead — a brand new
// seed shouldn't show as "wilted" on day one just because nothing's logged yet.
function daysSinceLastActivity(habit, today = new Date()) {
  const lastDone = mostRecentCompletion(habit.completedDates);
  const referenceDate = lastDone || habit.createdAt;
  if (!referenceDate) return 0;

  const last = new Date(referenceDate);
  const diffMs = new Date(toKey(today)) - new Date(toKey(last));
  return Math.max(0, Math.round(diffMs / 86400000));
}

export function getDecayState(habit, today = new Date()) {
  const days = daysSinceLastActivity(habit, today);
  const threshold = THRESHOLDS[habit.frequency] || THRESHOLDS.Daily;

  if (days >= threshold.wilted) return DECAY_STATES.WILTED;
  if (days >= threshold.wilting) return DECAY_STATES.WILTING;
  return DECAY_STATES.THRIVING;
}

export function getDaysNeglected(habit, today = new Date()) {
  return daysSinceLastActivity(habit, today);
}

// Optional signal for screens that want a decay-adjusted health number
// alongside the plain "today's completion %" from habitStore.getGardenHealth.
// Kept separate rather than blended, so each metric stays legible on its own.
export function getDecayPenalty(habit, today = new Date()) {
  const state = getDecayState(habit, today);
  if (state === DECAY_STATES.WILTED) return 1;
  if (state === DECAY_STATES.WILTING) return 0.5;
  return 0;
}
