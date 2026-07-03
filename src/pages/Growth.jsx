import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Check, LayoutGrid, Sprout as SproutIcon } from "lucide-react";
import { useGarden } from "../context/GardenContext";
import { getPlant, getPlantEmoji, getGrowthStage } from "../lib/plants";
import { isCompletedToday } from "../lib/habitStore";
import { getDecayState, DECAY_STATES } from "../lib/decay";
import { getGardenStartDate } from "../lib/gardenSnapshot";
import GardenScene from "../components/GardenScene";
import TimeSlider from "../components/TimeSlider";
import BottomNav from "../components/BottomNav";

export default function Growth() {
  const navigate = useNavigate();
  const { habits, markDone, loading } = useGarden();
  const [view, setView] = useState("scene"); // "scene" | "list"
  const [timePercent, setTimePercent] = useState(100); // 100 = today

  const startDate = useMemo(() => getGardenStartDate(habits), [habits]);
  const today = useMemo(() => new Date(), []);

  // Map the 0-100 slider percent onto an actual date between the garden's
  // start and today. Recomputed whenever the percent or habit list changes
  // (habits changing could shift the start date if a new oldest habit appears).
  const referenceDate = useMemo(() => {
    if (timePercent >= 100) return today;
    const totalMs = today - startDate;
    if (totalMs <= 0) return today; // garden started today, nothing to scrub through
    const offsetMs = (timePercent / 100) * totalMs;
    return new Date(startDate.getTime() + offsetMs);
  }, [timePercent, startDate, today]);

  if (loading) {
    return (
      <div className="min-h-screen bg-garden-gradient flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-garden-sage border-t-garden-forest animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-garden-gradient pb-32">
      <div className="px-5 pt-6 pb-2 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-garden-forest">Your Garden</h1>
        <button
          onClick={() => navigate("/add")}
          aria-label="Add habit"
          className="w-10 h-10 rounded-full bg-garden-forest text-white flex items-center justify-center shadow-button active:scale-95 transition-transform"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="px-5 flex items-center justify-between mb-5">
        <p className="text-garden-muted text-sm">
          {habits.length} {habits.length === 1 ? "plant" : "plants"} growing in your oasis
        </p>

        {/* View toggle */}
        <div className="flex items-center bg-white rounded-full p-1 shadow-soft">
          <button
            onClick={() => setView("scene")}
            aria-label="Garden view"
            aria-pressed={view === "scene"}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              view === "scene" ? "bg-garden-sage text-garden-forest" : "text-garden-faint"
            }`}
          >
            <SproutIcon size={15} />
          </button>
          <button
            onClick={() => setView("list")}
            aria-label="List view"
            aria-pressed={view === "list"}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              view === "list" ? "bg-garden-sage text-garden-forest" : "text-garden-faint"
            }`}
          >
            <LayoutGrid size={15} />
          </button>
        </div>
      </div>

      <div className="px-5">
        {habits.length === 0 && view === "list" && (
          <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-garden-border mb-3">
            <p className="text-3xl mb-2">🌱</p>
            <p className="text-garden-muted text-sm mb-4">Your garden is empty.</p>
            <button
              onClick={() => navigate("/add")}
              className="bg-garden-forest text-white text-sm font-semibold px-5 py-2.5 rounded-full"
            >
              Plant your first habit
            </button>
          </div>
        )}

        {view === "scene" ? (
          <>
            {habits.length > 0 && startDate < today && (
              <TimeSlider
                percent={timePercent}
                onChange={setTimePercent}
                startDate={startDate}
                currentDate={referenceDate}
              />
            )}
            <GardenScene
              habits={habits}
              onSelect={(id) => navigate(`/habit/${id}`)}
              referenceDate={referenceDate}
            />
            {habits.length === 0 && (
              <button
                onClick={() => navigate("/add")}
                className="w-full mt-4 bg-garden-forest text-white text-sm font-semibold px-5 py-3 rounded-full"
              >
                Plant your first habit
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-3">
            {habits.map((h) => {
              const plant = getPlant(h.plantType);
              const stage = getGrowthStage(h.totalCompletions);
              const done = isCompletedToday(h);
              const decay = getDecayState(h);
              const isWilted = decay === DECAY_STATES.WILTED;
              const isWilting = decay === DECAY_STATES.WILTING;
              return (
                <button
                  key={h.id}
                  onClick={() => navigate(`/habit/${h.id}`)}
                  className={`w-full bg-white rounded-2xl shadow-soft p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-transform ${
                    isWilted ? "ring-1 ring-garden-terracotta/30" : ""
                  }`}
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 transition-all duration-300"
                    style={{
                      backgroundColor: plant.soft,
                      filter: isWilted
                        ? "grayscale(1) brightness(0.85)"
                        : isWilting
                        ? "saturate(0.4) brightness(0.95)"
                        : undefined,
                    }}
                  >
                    {getPlantEmoji(h.plantType, h.totalCompletions)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[15px] text-garden-ink truncate">{h.name}</h3>
                    <p className="text-xs text-garden-muted mb-1.5">{stage.label} • Lvl {stage.level}</p>
                    <div className="flex items-center gap-3">
                      {isWilted ? (
                        <span className="text-xs text-garden-terracotta font-medium">🥀 Needs your care</span>
                      ) : isWilting ? (
                        <span className="text-xs text-garden-amber font-medium">⚠️ Starting to wilt</span>
                      ) : (
                        <>
                          <span className="text-xs text-garden-terracotta font-medium">🔥 {h.streak} day streak</span>
                          <span className="text-xs text-garden-muted">{h.totalCompletions} total</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markDone(h.id);
                    }}
                    aria-label={done ? "Completed" : "Mark as done"}
                    className={`w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                      done
                        ? "bg-garden-forest border-garden-forest text-white"
                        : "border-garden-border text-transparent hover:border-garden-leaf"
                    }`}
                  >
                    <Check size={16} strokeWidth={3} />
                  </button>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
