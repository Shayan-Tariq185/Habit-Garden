// Lightweight date helpers — no external date library needed for this MVP.

export function todayKey(d = new Date()) {
  return toKey(d);
}

export function toKey(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isSameDay(a, b) {
  return toKey(a) === toKey(b);
}

export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function startOfWeek(date = new Date()) {
  // Week starts Sunday, matching the "S M T W T F S" tracker in the design.
  const d = new Date(date);
  const day = d.getDay();
  return addDays(d, -day);
}

export function getWeekDates(date = new Date()) {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function formatMonthDay(date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
}

export function formatWeekRange(date = new Date()) {
  const dates = getWeekDates(date);
  const start = dates[0];
  const end = dates[6];
  const startStr = start.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const endStr = end.toLocaleDateString("en-US", { day: "numeric" });
  return `${startStr} - ${endStr}`;
}

export function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export const WEEKDAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

// Parses a "HH:MM" reminder time string into minutes-since-midnight, for
// easy comparison against the current time. Returns null for anything
// malformed rather than throwing — a bad/missing reminder should just mean
// "never due," not crash a render.
function parseReminderMinutes(reminderTime) {
  if (!reminderTime || typeof reminderTime !== "string") return null;
  const match = reminderTime.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

// Has this habit's reminder time already passed today? Used to visually
// promote/flag habits that are "due now" without needing any push
// notification infrastructure — purely a function of the current clock
// time vs. the stored reminder time, recomputed fresh on every render.
export function isReminderDue(reminderTime, now = new Date()) {
  const reminderMinutes = parseReminderMinutes(reminderTime);
  if (reminderMinutes === null) return false;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return nowMinutes >= reminderMinutes;
}

export function formatReminderTime(reminderTime) {
  const minutes = parseReminderMinutes(reminderTime);
  if (minutes === null) return reminderTime || "";
  const hours24 = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${String(mins).padStart(2, "0")} ${period}`;
}
