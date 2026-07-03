import { motion } from "framer-motion";
import { getPlant, getPlantEmoji, getGrowthStage } from "../lib/plants";
import { DECAY_STATES } from "../lib/decay";
import { getGardenLayout } from "../lib/gardenLayout";
import { getHabitAsOf } from "../lib/gardenSnapshot";

// Growth stage (1-5) maps to a visual size multiplier so the whole garden
// reads its progress at a glance, not just via numbers on cards.
const STAGE_SCALE = {
  1: 0.55, // seed
  2: 0.7, // sprout
  3: 0.85, // small plant
  4: 1.0, // blooming
  5: 1.15, // fully grown
};

const BASE_EMOJI_SIZE = 34; // px, before stage/jitter scaling

// referenceDate lets the scene render a historical snapshot instead of the
// live garden — every habit's completions, growth stage, and decay are
// recomputed as of that date rather than "now." Defaults to today so every
// existing call site (Growth tab's default view) behaves exactly as before.
export default function GardenScene({ habits, onSelect, referenceDate = new Date() }) {
  // Layout positions are still seeded from the habit's permanent id, so the
  // garden's spatial arrangement never shifts as you scrub through time —
  // only each plant's size/health changes, not where it stands.
  const layout = getGardenLayout(habits);
  const layoutById = Object.fromEntries(layout.map((l) => [l.id, l]));

  const snapshotHabits = habits.map((h) => getHabitAsOf(h, referenceDate));

  if (!habits.length) {
    return (
      <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden bg-garden-mint flex items-center justify-center">
        <div className="text-center px-8">
          <p className="text-4xl mb-2">🌾</p>
          <p className="text-garden-muted text-sm">Your garden bed is empty — plant a habit to begin.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-card"
      style={{
        background:
          "radial-gradient(ellipse at 50% 20%, #F0F5E8 0%, #E3EEDC 45%, #D4E5C8 100%)",
      }}
    >
      {/* Ground texture — soft dappled patches, purely decorative */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #C8DCB8 1px, transparent 1px), radial-gradient(circle, #C8DCB8 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          backgroundPosition: "0 0, 14px 14px",
        }}
      />

      {snapshotHabits.map((habit, index) => {
        const pos = layoutById[habit.id];
        if (!pos) return null;

        const plant = getPlant(habit.plantType);

        // A habit that hadn't been planted yet at this point in time renders
        // as a faint, unlabeled seed marker — present in the layout (so the
        // garden doesn't visually reshuffle while scrubbing) but clearly not
        // yet part of the story.
        if (habit.notPlantedYet) {
          const seedSize = BASE_EMOJI_SIZE * STAGE_SCALE[1] * pos.sizeJitter;
          return (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.25 }}
              transition={{ duration: 0.3 }}
              className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${pos.xPercent}%`, top: `${pos.yPercent}%` }}
              aria-hidden="true"
            >
              <span
                className="leading-none select-none grayscale"
                style={{ fontSize: seedSize, transform: `rotate(${pos.rotationDeg}deg)` }}
              >
                🌰
              </span>
            </motion.div>
          );
        }

        const stage = getGrowthStage(habit.totalCompletions);
        const emoji = getPlantEmoji(habit.plantType, habit.totalCompletions);
        const isWilted = habit.decayState === DECAY_STATES.WILTED;
        const isWilting = habit.decayState === DECAY_STATES.WILTING;

        const scale = STAGE_SCALE[stage.level] * pos.sizeJitter;
        const emojiSize = BASE_EMOJI_SIZE * scale;

        return (
          <motion.button
            key={habit.id}
            onClick={() => onSelect(habit.id)}
            initial={{ opacity: 0, scale: 0.6, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4), ease: "easeOut" }}
            whileTap={{ scale: 0.9 }}
            className="absolute flex flex-col items-center gap-1 -translate-x-1/2 -translate-y-1/2 group"
            style={{
              left: `${pos.xPercent}%`,
              top: `${pos.yPercent}%`,
            }}
            aria-label={`${habit.name} — ${stage.label}${isWilted ? ", wilted" : isWilting ? ", wilting" : ""}`}
          >
            {/* Soft shadow under each plant, grounds it in the scene */}
            <div
              className="absolute rounded-full bg-black/10 blur-[2px]"
              style={{
                width: emojiSize * 0.7,
                height: emojiSize * 0.22,
                bottom: -emojiSize * 0.18,
                left: "50%",
                transform: "translateX(-50%)",
              }}
            />

            {(isWilted || isWilting) && (
              <span
                className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ring-white z-10"
                style={{ backgroundColor: isWilted ? "#B85C38" : "#D9A441" }}
              />
            )}

            <span
              role="img"
              aria-hidden="true"
              className="leading-none select-none drop-shadow-sm transition-all duration-300 group-active:scale-90"
              style={{
                fontSize: emojiSize,
                transform: `rotate(${pos.rotationDeg}deg)`,
                filter: isWilted
                  ? "grayscale(0.9) brightness(0.8)"
                  : isWilting
                  ? "saturate(0.4) brightness(0.95)"
                  : undefined,
              }}
            >
              {emoji}
            </span>

            <span
              className="text-[9.5px] font-medium px-1.5 py-0.5 rounded-full bg-white/85 backdrop-blur-sm text-garden-ink whitespace-nowrap max-w-[64px] truncate shadow-sm"
              style={{ color: isWilted ? "#B85C38" : undefined }}
            >
              {plant.name}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
