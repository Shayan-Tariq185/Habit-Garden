// Deterministic scatter layout for the spatial Garden scene.
//
// Plants need to look organically placed, but their positions must never
// change between renders (or every re-render after marking a habit done
// would visibly shuffle the whole garden). So instead of Math.random(),
// each habit's position is derived from a hash of its own id — same input,
// same output, every time, forever, with no stored coordinates needed.
//
// To avoid overlap with only a few plants, we assign each habit to a cell
// in a loose grid (sized to the habit count) and then jitter its position
// within that cell using the same seeded randomness. This reads as
// "scattered" while guaranteeing a minimum spacing.

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // force 32-bit int
  }
  return Math.abs(hash);
}

// Returns a deterministic float in [0, 1) for a given seed string.
function seededRandom(seed) {
  const hash = hashString(seed);
  // A cheap but sufficiently uniform spread for a handful of plants —
  // this doesn't need cryptographic quality, just stable variety.
  return ((hash * 9301 + 49297) % 233280) / 233280;
}

// Computes a grid size (cols x rows) that comfortably fits `count` items
// without being mostly empty or badly cramped.
function getGridDimensions(count) {
  if (count <= 1) return { cols: 1, rows: 1 };
  if (count <= 4) return { cols: 2, rows: 2 };
  if (count <= 6) return { cols: 3, rows: 2 };
  if (count <= 9) return { cols: 3, rows: 3 };
  if (count <= 12) return { cols: 4, rows: 3 };
  const cols = Math.ceil(Math.sqrt(count * 1.3));
  return { cols, rows: Math.ceil(count / cols) };
}

// Returns an array of { id, xPercent, yPercent, rotationDeg, sizeJitter }
// for each habit, ready to position absolutely within a garden scene container.
export function getGardenLayout(habits) {
  const { cols, rows } = getGridDimensions(habits.length);
  const cellWidth = 100 / cols;
  const cellHeight = 100 / rows;

  return habits.map((habit, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);

    // Jitter within the cell (keep margin so plants don't touch cell
    // edges/each other) — each axis gets its own seed so they don't correlate.
    // Range is intentionally conservative (30%-70% of cell) so that even a
    // plant in the outermost column/row keeps its name label fully on-screen.
    const jitterX = seededRandom(habit.id + "-x") * 0.4 + 0.3; // 30%-70% of cell
    const jitterY = seededRandom(habit.id + "-y") * 0.4 + 0.3;
    const rotation = (seededRandom(habit.id + "-r") - 0.5) * 16; // -8deg to +8deg
    const sizeJitter = seededRandom(habit.id + "-s") * 0.15 + 0.92; // 0.92-1.07 scale

    const xPercent = col * cellWidth + jitterX * cellWidth;
    const yPercent = row * cellHeight + jitterY * cellHeight;

    // Clamp to a safe zone so a plant's label (which extends further than
    // the emoji itself) never gets clipped by the scene's rounded edges.
    // Horizontal is tighter than vertical since labels extend sideways.
    const clampedX = Math.min(85, Math.max(15, xPercent));
    const clampedY = Math.min(90, Math.max(8, yPercent));

    return {
      id: habit.id,
      xPercent: clampedX,
      yPercent: clampedY,
      rotationDeg: rotation,
      sizeJitter,
    };
  });
}
