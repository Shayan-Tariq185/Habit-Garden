import { todayKey, toKey, addDays } from "./date";
import { didLevelUpInRange } from "./plants";

function cryptoId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ---------- Local-only helper (used for optimistic UI before a DB round-trip returns an id) ----------
export function createHabit({ name, category, frequency, reminderTime, plantType, note }) {
  return {
    id: cryptoId(),
    name: name?.trim() || "New Habit",
    category: category || "General",
    frequency: frequency || "Daily",
    reminderTime: reminderTime || "08:00",
    plantType: plantType || "sunflower",
    streak: 0,
    totalCompletions: 0,
    completedDates: [],
    createdAt: todayKey(),
    note: note || "",
  };
}

// ---------- Completion + streak logic ----------
export function isCompletedToday(habit) {
  return habit.completedDates.includes(todayKey());
}

export function isCompletedOn(habit, dateKey) {
  return habit.completedDates.includes(dateKey);
}

// Toggling lets users undo an accidental tap, while keeping streak math correct.
export function toggleCompletion(habit) {
  const key = todayKey();
  const already = habit.completedDates.includes(key);

  if (already) {
    const completedDates = habit.completedDates.filter((d) => d !== key);
    return {
      ...habit,
      completedDates,
      totalCompletions: Math.max(0, habit.totalCompletions - 1),
      streak: computeStreak(completedDates),
    };
  }

  const completedDates = [...habit.completedDates, key].sort();
  return {
    ...habit,
    completedDates,
    totalCompletions: habit.totalCompletions + 1,
    streak: computeStreak(completedDates),
  };
}

// Streak = number of consecutive days ending today (or yesterday, so a
// streak doesn't zero out at midnight before the user has a chance today).
export function computeStreak(completedDates) {
  if (!completedDates.length) return 0;
  const set = new Set(completedDates);
  const today = new Date();
  let cursor = set.has(toKey(today)) ? today : addDays(today, -1);
  if (!set.has(toKey(cursor))) return 0;

  let streak = 0;
  while (set.has(toKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

// ---------- Aggregate stats ----------
export function getTodaysHabits(habits) {
  // In this MVP every habit is shown daily regardless of frequency,
  // matching the "Today's Seeds" list in the design.
  return habits;
}

export function getGardenHealth(habits) {
  const todays = getTodaysHabits(habits);
  if (!todays.length) return 0;
  const done = todays.filter(isCompletedToday).length;
  return Math.round((done / todays.length) * 100);
}

export function getLongestStreak(habits) {
  if (!habits.length) return 0;
  return Math.max(...habits.map((h) => longestEverStreak(h.completedDates)));
}

function longestEverStreak(completedDates) {
  if (!completedDates.length) return 0;
  const sorted = [...completedDates].sort();
  let longest = 1;
  let current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diffDays = Math.round((curr - prev) / 86400000);
    if (diffDays === 1) {
      current += 1;
      longest = Math.max(longest, current);
    } else if (diffDays > 1) {
      current = 1;
    }
  }
  return longest;
}

export function getWeeklyCompletionRate(habits, weekDates) {
  const keys = weekDates.map(toKey);
  const totalSlots = habits.length * keys.length;
  if (!totalSlots) return 0;
  let completed = 0;
  habits.forEach((h) => {
    keys.forEach((k) => {
      if (h.completedDates.includes(k)) completed += 1;
    });
  });
  return Math.round((completed / totalSlots) * 100);
}

export function getTotalCompletionsInRange(habits, weekDates) {
  const keys = new Set(weekDates.map(toKey));
  let total = 0;
  habits.forEach((h) => {
    h.completedDates.forEach((d) => {
      if (keys.has(d)) total += 1;
    });
  });
  return total;
}

export function getFocusDistribution(habits) {
  const byCategory = {};
  habits.forEach((h) => {
    byCategory[h.category] = (byCategory[h.category] || 0) + 1;
  });
  const total = habits.length || 1;
  return Object.entries(byCategory)
    .map(([category, count]) => ({
      category,
      count,
      percent: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

export const CATEGORY_COLORS = {
  Mindfulness: "#3E7A4C",
  Health: "#C1543D",
  Learning: "#3D6FA8",
  Productivity: "#4B7A43",
  Fitness: "#5B8A72",
  Creativity: "#B8862F",
  General: "#6B7566",
};

export function getCompletionTrend(habits, weekDates) {
  // Percent of habits completed for each day of the current week —
  // powers the "Completion Trend" line chart.
  return weekDates.map((date) => {
    const key = toKey(date);
    const isFuture = date > new Date(new Date().toDateString());
    if (!habits.length) return { date, key, percent: 0, isFuture };
    const done = habits.filter((h) => h.completedDates.includes(key)).length;
    return {
      date,
      key,
      percent: Math.round((done / habits.length) * 100),
      isFuture,
    };
  });
}

export function getPlantsLeveledUpCount(habits, rangeStartKey) {
  return habits.filter((h) => didLevelUpInRange(h, rangeStartKey)).length;
}
