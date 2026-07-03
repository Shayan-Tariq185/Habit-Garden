import { toKey } from "./date";
import { getCompletionsAsOf } from "./plants";
import { getDecayState } from "./decay";

// The earliest point the slider can go back to — the day the garden's
// oldest habit was planted. Falls back to today if there are no habits yet.
export function getGardenStartDate(habits) {
  if (!habits.length) return new Date();
  const earliest = habits.reduce((min, h) => {
    const created = new Date(h.createdAt);
    return created < min ? created : min;
  }, new Date(habits[0].createdAt));
  return earliest;
}

// Reconstructs what a single habit looked like as of a snapshot date:
// - totalCompletions is recomputed from completedDates up to that date
//   (NOT read from the live totalCompletions field, which reflects today)
// - decay is evaluated relative to the snapshot date, not the real "now"
// - habits that didn't exist yet are flagged via `notPlantedYet`, so the
//   scene can render them as a bare, dimmed seed rather than hiding them
//   (keeps the layout stable while scrubbing through time)
export function getHabitAsOf(habit, snapshotDate) {
  const snapshotKey = toKey(snapshotDate);
  const notPlantedYet = habit.createdAt > snapshotKey;

  if (notPlantedYet) {
    return {
      ...habit,
      totalCompletions: 0,
      decayState: null,
      notPlantedYet: true,
    };
  }

  const completionsAsOf = getCompletionsAsOf(habit, snapshotKey);

  // Decay must be computed against only the completions that had happened
  // by the snapshot date — passing the full (current) completedDates would
  // leak future completions into a historical view, making a past snapshot
  // incorrectly look "thriving" because of something that hasn't happened yet.
  const completionsUpToSnapshot = habit.completedDates.filter((d) => d <= snapshotKey);
  const habitAsOfSnapshot = { ...habit, completedDates: completionsUpToSnapshot };

  return {
    ...habit,
    totalCompletions: completionsAsOf,
    decayState: getDecayState(habitAsOfSnapshot, snapshotDate),
    notPlantedYet: false,
  };
}

export function getGardenAsOf(habits, snapshotDate) {
  return habits.map((h) => getHabitAsOf(h, snapshotDate));
}
