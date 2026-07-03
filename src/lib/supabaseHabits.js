import { supabase } from "./supabaseClient";
import { todayKey, toKey } from "./date";

// The DB uses snake_case columns; the rest of the app (and all the pure
// logic in habitStore.js) expects camelCase. These two mappers keep that
// translation in exactly one place.

function fromRow(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    frequency: row.frequency,
    reminderTime: row.reminder_time,
    plantType: row.plant_type,
    streak: row.streak,
    totalCompletions: row.total_completions,
    completedDates: row.completed_dates || [],
    // Postgres stores created_at as a full timestamptz (e.g.
    // "2026-07-03T18:42:11.203+00:00"), but every date comparison
    // elsewhere in the app — completedDates, todayKey(), the time-travel
    // snapshot logic — assumes a plain "YYYY-MM-DD" string. Converting
    // here, once, at the boundary where data enters the app, keeps that
    // assumption true everywhere else instead of leaking timestamp format
    // into date-string comparisons that were never designed to handle it.
    createdAt: row.created_at ? toKey(row.created_at) : todayKey(),
    note: row.note || "",
  };
}

function toRow(habit, userId) {
  return {
    user_id: userId,
    name: habit.name,
    category: habit.category,
    frequency: habit.frequency,
    reminder_time: habit.reminderTime,
    plant_type: habit.plantType,
    streak: habit.streak,
    total_completions: habit.totalCompletions,
    completed_dates: habit.completedDates,
    note: habit.note || "",
  };
}

// ---------- Reads ----------
export async function fetchHabits() {
  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch habits:", error);
    throw error;
  }
  return (data || []).map(fromRow);
}

// ---------- Create ----------
export async function insertHabit({ name, category, frequency, reminderTime, plantType, note }, userId) {
  const newHabit = {
    name: name?.trim() || "New Habit",
    category: category || "General",
    frequency: frequency || "Daily",
    reminderTime: reminderTime || "08:00",
    plantType: plantType || "sunflower",
    streak: 0,
    totalCompletions: 0,
    completedDates: [],
    note: note || "",
  };

  const { data, error } = await supabase
    .from("habits")
    .insert(toRow(newHabit, userId))
    .select()
    .single();

  if (error) {
    console.error("Failed to insert habit:", error);
    throw error;
  }
  return fromRow(data);
}

// ---------- Update (used after toggling completion, or any full-habit edit) ----------
export async function updateHabitRow(habit, userId) {
  const { data, error } = await supabase
    .from("habits")
    .update(toRow(habit, userId))
    .eq("id", habit.id)
    .select()
    .single();

  if (error) {
    console.error("Failed to update habit:", error);
    throw error;
  }
  return fromRow(data);
}

// ---------- Delete ----------
export async function deleteHabitRow(habitId) {
  const { error } = await supabase.from("habits").delete().eq("id", habitId);
  if (error) {
    console.error("Failed to delete habit:", error);
    throw error;
  }
}

// ---------- Bulk delete (Reset Garden Data) ----------
export async function deleteAllHabits(userId) {
  const { error } = await supabase.from("habits").delete().eq("user_id", userId);
  if (error) {
    console.error("Failed to reset habits:", error);
    throw error;
  }
}

export { todayKey };
