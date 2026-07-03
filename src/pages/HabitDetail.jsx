import { useParams, useNavigate } from "react-router-dom";
import { Flame, Sparkles, ChevronRight, Check, Trash2, Droplet } from "lucide-react";
import { useState } from "react";
import { useGarden } from "../context/GardenContext";
import { getPlant, getGrowthStage, getStageProgress, getPlantEmoji, GROWTH_STAGES, getStageIndex } from "../lib/plants";
import { isCompletedToday, isCompletedOn } from "../lib/habitStore";
import { getDecayState, getDaysNeglected, DECAY_STATES } from "../lib/decay";
import { getWeekDates, WEEKDAY_LETTERS, toKey, todayKey, formatReminderTime } from "../lib/date";
import ScreenHeader from "../components/ScreenHeader";

const MOTIVATIONAL = {
  seed: "Every great garden starts with a single seed. Plant today's habit!",
  sprout: "Your habit is sprouting! Keep the momentum going.",
  small: "Look at it grow! Consistency is paying off.",
  blooming: "Your {plant} is glowing! Keep it up with your routine.",
  grown: "Fully grown and flourishing — this habit is truly part of you now.",
};

const DECAY_MESSAGES = {
  wilting: "Your {plant} is starting to wilt. A little care today will bring it right back.",
  wilted: "Your {plant} has wilted from neglect — but nothing's lost. One tap and it's thriving again.",
};

export default function HabitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { habits, markDone, deleteHabit, loading } = useGarden();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const habit = habits.find((h) => h.id === id);

  if (loading) {
    return (
      <div className="min-h-screen bg-garden-gradient flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-garden-sage border-t-garden-forest animate-spin" />
      </div>
    );
  }

  if (!habit) {
    return (
      <div className="min-h-screen bg-garden-gradient flex flex-col items-center justify-center px-8 text-center">
        <p className="text-4xl mb-3">🍂</p>
        <p className="text-garden-muted mb-4">This habit couldn't be found.</p>
        <button
          onClick={() => navigate("/garden")}
          className="bg-garden-forest text-white px-5 py-2.5 rounded-full text-sm font-semibold"
        >
          Back to Garden
        </button>
      </div>
    );
  }

  const plant = getPlant(habit.plantType);
  const stage = getGrowthStage(habit.totalCompletions);
  const stageProgress = getStageProgress(habit.totalCompletions);
  const stageIdx = getStageIndex(habit.totalCompletions);
  const nextStage = GROWTH_STAGES[stageIdx + 1];
  const done = isCompletedToday(habit);
  const emoji = getPlantEmoji(habit.plantType, habit.totalCompletions);
  const weekDates = getWeekDates();
  const decay = getDecayState(habit);
  const daysNeglected = getDaysNeglected(habit);
  const isWilted = decay === DECAY_STATES.WILTED;
  const isWilting = decay === DECAY_STATES.WILTING;

  // Decay messaging takes priority — knowing your plant needs care matters
  // more right now than a generic growth-stage compliment.
  const message =
    isWilted || isWilting
      ? DECAY_MESSAGES[decay].replace("{plant}", plant.name.toLowerCase())
      : MOTIVATIONAL[stage.key].replace("{plant}", plant.name.toLowerCase());

  return (
    <div className="min-h-screen bg-garden-gradient pb-10">
      <ScreenHeader
        showBack
        right={
          <button
            onClick={() => setConfirmDelete(true)}
            aria-label="Delete habit"
            className="w-9 h-9 rounded-full flex items-center justify-center text-garden-muted hover:bg-white/60 hover:text-garden-terracotta transition-colors"
          >
            <Trash2 size={18} />
          </button>
        }
      />

      <div className="px-5">
        {/* Hero plant visual */}
        <div
          className="w-full aspect-[16/10] rounded-3xl shadow-card flex items-center justify-center mb-5 relative overflow-hidden"
          style={{
            background: isWilted
              ? "linear-gradient(160deg, #E8E4D8, #FFFFFF)"
              : `linear-gradient(160deg, ${plant.soft}, #FFFFFF)`,
          }}
        >
          {(isWilted || isWilting) && (
            <div
              className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: isWilted ? "rgba(184, 92, 56, 0.12)" : "rgba(217, 164, 65, 0.15)",
                color: isWilted ? "#B85C38" : "#B8862F",
              }}
            >
              {isWilted ? "🥀" : "⚠️"} {isWilted ? "Wilted" : "Wilting"} · {daysNeglected}d neglected
            </div>
          )}
          <span
            className={`text-8xl drop-shadow-sm ${isWilted || isWilting ? "" : "animate-sway"}`}
            role="img"
            aria-label={plant.name}
            style={
              isWilted
                ? { filter: "grayscale(0.9) brightness(0.8)", transform: "rotate(-10deg)" }
                : isWilting
                ? { filter: "saturate(0.35) brightness(0.9)", transform: "rotate(-5deg)" }
                : undefined
            }
          >
            {emoji}
          </span>
        </div>

        <div className="mb-5">
          <h1 className="font-display text-2xl font-bold text-garden-forest mb-1">{habit.name}</h1>
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-1.5 bg-garden-sage text-garden-forest text-xs font-medium px-3 py-1 rounded-full">
              🌿 {habit.frequency} {habit.category}
            </div>
            {habit.reminderTime && (
              <div className="inline-flex items-center gap-1.5 bg-garden-mint text-garden-leaf text-xs font-medium px-3 py-1 rounded-full">
                🔔 {formatReminderTime(habit.reminderTime)}
              </div>
            )}
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white rounded-2xl shadow-soft p-4">
            <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center mb-2">
              <Flame size={18} className="text-garden-terracotta" fill="#D97B4F" />
            </div>
            <p className="text-2xl font-bold text-garden-ink leading-none">{habit.streak}</p>
            <p className="text-[11px] font-medium text-garden-muted uppercase tracking-wide mt-1">
              Day Streak
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-soft p-4">
            <div className="w-9 h-9 rounded-full bg-garden-sage flex items-center justify-center mb-2">
              <Sparkles size={18} className="text-garden-forest" />
            </div>
            <p className="text-2xl font-bold text-garden-ink leading-none">Lvl {stage.level}</p>
            <p className="text-[11px] font-medium text-garden-muted uppercase tracking-wide mt-1">
              {stage.label}
            </p>
          </div>
        </div>

        {/* Growth progress */}
        <div className="bg-white rounded-2xl shadow-soft p-5 mb-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-garden-ink text-[15px]">Growth Progress</h3>
            <span className="text-xs font-semibold text-garden-leaf">{Math.round(stageProgress * 100)}%</span>
          </div>
          <p className="text-xs text-garden-muted mb-3">
            {nextStage
              ? `${Math.max(0, nextStage.min - habit.totalCompletions)} more ${
                  nextStage.min - habit.totalCompletions === 1 ? "completion" : "completions"
                } to ${nextStage.label.toLowerCase()}`
              : "Your plant has fully matured!"}
          </p>
          <div className="w-full h-2.5 bg-garden-mint rounded-full overflow-hidden">
            <div
              className="h-full bg-garden-forest rounded-full transition-all duration-500"
              style={{ width: `${stageProgress * 100}%` }}
            />
          </div>
        </div>

        {/* Weekly tracker */}
        <div className="bg-white rounded-2xl shadow-soft p-5 mb-5">
          <button className="w-full flex items-center justify-between mb-4">
            <h3 className="font-semibold text-garden-ink text-[15px]">This Week's Activity</h3>
            <ChevronRight size={16} className="text-garden-faint" />
          </button>
          <div className="flex justify-between">
            {weekDates.map((date, i) => {
              const key = toKey(date);
              const isToday = key === todayKey();
              const isFuture = date > new Date(new Date().toDateString());
              const completed = isCompletedOn(habit, key);
              return (
                <div key={key} className="flex flex-col items-center gap-2">
                  <span className="text-[10px] font-medium text-garden-faint">{WEEKDAY_LETTERS[i]}</span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors relative ${
                      completed
                        ? "bg-garden-forest text-white"
                        : isFuture
                        ? "bg-garden-mint/60 text-garden-faint"
                        : "bg-garden-mint text-garden-muted"
                    } ${isToday ? "ring-2 ring-garden-terracotta ring-offset-2" : ""}`}
                  >
                    {completed ? <Check size={14} strokeWidth={3} /> : date.getDate()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Total completions */}
        <div className="bg-garden-cream rounded-2xl p-4 mb-5 flex items-center justify-between">
          <span className="text-sm text-garden-muted">Total completions</span>
          <span className="text-sm font-bold text-garden-forest">{habit.totalCompletions}</span>
        </div>

        {/* Motivational message */}
        <div
          className={`rounded-2xl p-4 mb-6 flex gap-3 items-start ${
            isWilted || isWilting ? "bg-orange-50" : "bg-garden-sage/60"
          }`}
        >
          <span className="text-lg leading-none">{isWilted || isWilting ? "💧" : "🍃"}</span>
          <p
            className={`text-sm leading-relaxed italic ${
              isWilted || isWilting ? "text-garden-terracotta" : "text-garden-forest"
            }`}
          >
            "{message}"
          </p>
        </div>

        <button
          onClick={() => markDone(habit.id)}
          className={`w-full font-semibold text-base py-4 rounded-full shadow-button flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-150 ${
            done
              ? "bg-garden-mint text-garden-forest"
              : isWilted || isWilting
              ? "bg-garden-terracotta text-white hover:brightness-95"
              : "bg-garden-forest text-white hover:bg-garden-forestDark"
          }`}
        >
          {done ? (
            <Check size={18} strokeWidth={2.5} />
          ) : isWilted || isWilting ? (
            <Droplet size={18} strokeWidth={2.5} />
          ) : (
            <Check size={18} strokeWidth={2.5} />
          )}
          {done
            ? "Completed for Today"
            : isWilted || isWilting
            ? "Revive with Today's Habit"
            : "Mark as Done for Today"}
        </button>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-[430px] mx-auto px-6">
            <div className="bg-white rounded-3xl p-6 shadow-lift mb-6 sm:mb-0">
              <h3 className="font-display font-semibold text-lg text-garden-ink mb-2">
                Remove this plant?
              </h3>
              <p className="text-sm text-garden-muted mb-5">
                "{habit.name}" and its growth history will be removed from your garden. This can't be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-3 rounded-full bg-garden-mint text-garden-forest font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await deleteHabit(habit.id);
                    navigate("/garden", { replace: true });
                  }}
                  className="flex-1 py-3 rounded-full bg-garden-terracotta text-white font-semibold text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
