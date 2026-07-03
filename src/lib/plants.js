// Plant catalogue used across Add Habit, Home, and Detail screens.
// Each plant defines a friendly label, a short trait tag (mirrors the
// "Choose Your Seed" cards in the Stitch design), and per-stage emoji art
// so the garden can visually progress without needing image assets.

export const PLANT_TYPES = [
  {
    id: "sunflower",
    name: "Sunflower",
    trait: "Bright",
    color: "#E8A33D",
    soft: "#F6E2B0",
    stages: ["🌰", "🌱", "🌿", "🌻", "🌻"],
  },
  {
    id: "cactus",
    name: "Cactus",
    trait: "Resilient",
    color: "#4B7A43",
    soft: "#D9E9CE",
    stages: ["🌰", "🌱", "🌵", "🌵", "🌵"],
  },
  {
    id: "fern",
    name: "Fern",
    trait: "Growth",
    color: "#3E6B3A",
    soft: "#D3E6CB",
    stages: ["🌰", "🌱", "🌿", "🌿", "🎋"],
  },
  {
    id: "rose",
    name: "Rose",
    trait: "Devoted",
    color: "#C1546B",
    soft: "#F2D3DA",
    stages: ["🌰", "🌱", "🌿", "🌹", "🌹"],
  },
  {
    id: "bonsai",
    name: "Bonsai",
    trait: "Patient",
    color: "#6B8E4E",
    soft: "#DCE7CB",
    stages: ["🌰", "🌱", "🪴", "🌳", "🌳"],
  },
  {
    id: "succulent",
    name: "Succulent",
    trait: "Steady",
    color: "#5B8A72",
    soft: "#D7E8DE",
    stages: ["🌰", "🌱", "🪴", "🪴", "🪴"],
  },
  {
    id: "monstera",
    name: "Monstera",
    trait: "Bold",
    color: "#2F6B3C",
    soft: "#CFE4D2",
    stages: ["🌰", "🌱", "🌿", "🪴", "🌴"],
  },
  {
    id: "orchid",
    name: "Orchid",
    trait: "Elegant",
    color: "#9B6FB0",
    soft: "#E7D9EE",
    stages: ["🌰", "🌱", "🌿", "🌸", "🌸"],
  },
];

export function getPlant(plantTypeId) {
  return PLANT_TYPES.find((p) => p.id === plantTypeId) || PLANT_TYPES[0];
}

// Growth stage logic per spec:
// 0 completions = seed, 1-2 = sprout, 3-5 = small plant,
// 6-10 = blooming plant, 11+ = fully grown plant
export const GROWTH_STAGES = [
  { key: "seed", label: "Seed", min: 0, max: 0, level: 1 },
  { key: "sprout", label: "Sprout", min: 1, max: 2, level: 2 },
  { key: "small", label: "Small Plant", min: 3, max: 5, level: 3 },
  { key: "blooming", label: "Flourishing", min: 6, max: 10, level: 4 },
  { key: "grown", label: "Fully Grown", min: 11, max: Infinity, level: 5 },
];

export function getGrowthStage(totalCompletions) {
  return (
    GROWTH_STAGES.find(
      (s) => totalCompletions >= s.min && totalCompletions <= s.max
    ) || GROWTH_STAGES[0]
  );
}

export function getStageIndex(totalCompletions) {
  const stage = getGrowthStage(totalCompletions);
  return GROWTH_STAGES.findIndex((s) => s.key === stage.key);
}

export function getPlantEmoji(plantTypeId, totalCompletions) {
  const plant = getPlant(plantTypeId);
  const idx = getStageIndex(totalCompletions);
  return plant.stages[Math.min(idx, plant.stages.length - 1)];
}

// Progress (0-1) toward the *next* stage, for progress bars.
export function getStageProgress(totalCompletions) {
  const stage = getGrowthStage(totalCompletions);
  if (stage.max === Infinity) return 1;
  const span = stage.max - stage.min + 1;
  const into = totalCompletions - stage.min + 1;
  return Math.min(1, into / span);
}

// Did this habit cross into a new growth stage within the given date range
// (e.g. "this week")? Derived entirely from completedDates — no separate
// history log needed. Counts completions before the range started vs. the
// current total, and compares which stage each total maps to.
export function didLevelUpInRange(habit, rangeStartKey) {
  const completionsBeforeRange = habit.completedDates.filter(
    (d) => d < rangeStartKey
  ).length;
  const stageBefore = getStageIndex(completionsBeforeRange);
  const stageNow = getStageIndex(habit.totalCompletions);
  return stageNow > stageBefore;
}

// How many times had this habit been completed as of a given date (inclusive)?
// Powers the garden time-travel snapshot — lets us show what a plant's
// growth stage looked like at any point in its history, using only the
// completedDates already stored, no separate history log needed.
export function getCompletionsAsOf(habit, dateKey) {
  return habit.completedDates.filter((d) => d <= dateKey).length;
}
