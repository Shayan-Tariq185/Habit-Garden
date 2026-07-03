import { useNavigate } from "react-router-dom";
import { Check, Bell, Flower2, Clock } from "lucide-react";
import { useGarden } from "../context/GardenContext";
import { getGardenHealth, isCompletedToday, CATEGORY_COLORS } from "../lib/habitStore";
import { getPlant, getPlantEmoji } from "../lib/plants";
import { getDecayState, DECAY_STATES } from "../lib/decay";
import { greeting, isReminderDue } from "../lib/date";
import BottomNav from "../components/BottomNav";

export default function Home() {
  const navigate = useNavigate();
  const { habits, markDone, userName, loading } = useGarden();
  const health = getGardenHealth(habits);
  const remaining = habits.filter((h) => !isCompletedToday(h)).length;
  const wiltedCount = habits.filter((h) => getDecayState(h) !== DECAY_STATES.THRIVING).length;
  const dueNowCount = habits.filter(
    (h) => !isCompletedToday(h) && isReminderDue(h.reminderTime)
  ).length;

  // Today's Seeds ordering: due-and-not-done habits float to the top (most
  // actionable first), then remaining not-done habits, then completed ones
  // sink to the bottom. Ties preserve original order (stable sort) so the
  // list doesn't feel like it's shuffling for no reason.
  const sortedHabits = [...habits].sort((a, b) => {
    const priority = (h) => {
      const done = isCompletedToday(h);
      if (done) return 2;
      return isReminderDue(h.reminderTime) ? 0 : 1;
    };
    return priority(a) - priority(b);
  });

  // Top few plants shown in "Your Oasis" preview strip.
  const oasis = habits.slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-garden-gradient flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-garden-sage border-t-garden-forest animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-garden-gradient pb-32">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-garden-sage flex items-center justify-center">
            <Flower2 size={16} className="text-garden-forest" />
          </div>
          <span className="font-display font-semibold text-garden-forest text-base">
            Habit Garden
          </span>
        </div>
        <button
          aria-label="Notifications"
          className="w-9 h-9 rounded-full flex items-center justify-center text-garden-forest hover:bg-white/50 transition-colors relative"
        >
          <Bell size={20} />
        </button>
      </div>

      <div className="px-5">
        {/* Greeting */}
        <h1 className="font-display text-3xl font-bold text-garden-forest mt-2 mb-1">
          {greeting()}, {userName}!
        </h1>
        <p className="text-garden-muted text-[15px] mb-5">
          {wiltedCount > 0
            ? `${wiltedCount} ${wiltedCount === 1 ? "plant needs" : "plants need"} your attention today.`
            : dueNowCount > 0
            ? `${dueNowCount} ${dueNowCount === 1 ? "habit is" : "habits are"} due right now.`
            : health >= 80
            ? "Your garden is thriving today."
            : health >= 40
            ? "Your garden is growing steadily."
            : remaining === habits.length && habits.length > 0
            ? "Your garden is waiting for you today."
            : "Keep tending — every step counts."}
        </p>

        {/* Garden Health card */}
        <div className="bg-white rounded-3xl shadow-card p-6 mb-5 flex flex-col items-center">
          <span className="text-xs font-semibold text-garden-muted tracking-wide uppercase mb-3">
            Garden Health
          </span>
          <HealthRing percent={health} />
        </div>

        {/* Your Oasis */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-garden-forest text-lg">Your Oasis</h2>
          <button
            onClick={() => navigate("/growth")}
            className="text-sm font-medium text-garden-leaf flex items-center gap-0.5 hover:text-garden-forest transition-colors"
          >
            View All →
          </button>
        </div>

        {oasis.length > 0 ? (
          <div className="flex gap-3 mb-6 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
            {oasis.map((h) => {
              const plant = getPlant(h.plantType);
              const decay = getDecayState(h);
              const isWilted = decay === DECAY_STATES.WILTED;
              const isWilting = decay === DECAY_STATES.WILTING;
              return (
                <button
                  key={h.id}
                  onClick={() => navigate(`/habit/${h.id}`)}
                  className="flex-shrink-0 w-24 rounded-2xl shadow-soft p-3 flex flex-col items-center gap-2 active:scale-95 transition-transform relative"
                  style={{ backgroundColor: plant.soft }}
                >
                  {(isWilted || isWilting) && (
                    <span
                      className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                      style={{ backgroundColor: isWilted ? "#B85C38" : "#D9A441" }}
                      aria-label={isWilted ? "Wilted" : "Wilting"}
                    />
                  )}
                  <div
                    className="text-3xl leading-none transition-all duration-300"
                    style={
                      isWilted
                        ? { filter: "grayscale(1) brightness(0.85)", transform: "rotate(-8deg)" }
                        : isWilting
                        ? { filter: "saturate(0.4) brightness(0.95)", transform: "rotate(-3deg)" }
                        : undefined
                    }
                  >
                    {getPlantEmoji(h.plantType, h.totalCompletions)}
                  </div>
                  <span className="text-xs font-medium text-garden-ink text-center leading-tight truncate w-full">
                    {plant.name}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="bg-white/60 rounded-2xl p-6 text-center mb-6 border border-dashed border-garden-border">
            <p className="text-sm text-garden-muted">Your oasis is empty. Plant your first habit!</p>
          </div>
        )}

        {/* Today's Seeds */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-garden-forest text-lg">Today's Seeds</h2>
          {habits.length > 0 && (
            <span className="text-xs font-semibold bg-garden-sage text-garden-forest px-3 py-1 rounded-full">
              {remaining} remaining
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {habits.length === 0 && (
            <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-garden-border">
              <p className="text-3xl mb-2">🌱</p>
              <p className="text-garden-muted text-sm mb-4">No habits planted yet.</p>
              <button
                onClick={() => navigate("/add")}
                className="bg-garden-forest text-white text-sm font-semibold px-5 py-2.5 rounded-full"
              >
                Plant your first habit
              </button>
            </div>
          )}

          {sortedHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onOpen={() => navigate(`/habit/${habit.id}`)}
              onToggle={(e) => {
                e.stopPropagation();
                markDone(habit.id);
              }}
            />
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function HealthRing({ percent }) {
  const size = 168;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E7E5DA" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#2C4A2B"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-4xl font-bold text-garden-forest">{percent}%</span>
      </div>
    </div>
  );
}

function HabitCard({ habit, onOpen, onToggle }) {
  const done = isCompletedToday(habit);
  const plant = getPlant(habit.plantType);
  const accent = CATEGORY_COLORS[habit.category] || "#2C4A2B";
  const decay = getDecayState(habit);
  const isWilted = decay === DECAY_STATES.WILTED;
  const isWilting = decay === DECAY_STATES.WILTING;
  const isDueNow = !done && !isWilted && !isWilting && isReminderDue(habit.reminderTime);

  return (
    <button
      onClick={onOpen}
      className={`w-full bg-white rounded-2xl shadow-soft p-4 flex items-center gap-3 text-left transition-all duration-200 active:scale-[0.98] ${
        done ? "opacity-70" : ""
      } ${isWilted ? "ring-1 ring-garden-terracotta/30" : ""} ${
        isDueNow ? "ring-1 ring-garden-leaf/40" : ""
      }`}
    >
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center text-xl shrink-0 transition-all duration-300"
        style={{
          backgroundColor: plant.soft,
          filter: isWilted
            ? "grayscale(1) brightness(0.85)"
            : isWilting
            ? "saturate(0.4) brightness(0.95)"
            : undefined,
        }}
      >
        {getPlantEmoji(habit.plantType, habit.totalCompletions)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h3
            className={`font-semibold text-[15px] truncate ${done ? "line-through decoration-current/60" : ""}`}
            style={{ color: accent }}
          >
            {habit.name}
          </h3>
          {isDueNow && (
            <span className="shrink-0 flex items-center gap-0.5 text-[10px] font-semibold text-garden-leaf bg-garden-mint px-1.5 py-0.5 rounded-full">
              <Clock size={9} strokeWidth={3} />
              Due
            </span>
          )}
        </div>
        <p className="text-xs text-garden-muted truncate">
          {isWilted ? (
            <span className="text-garden-terracotta font-medium">🥀 Needs your care</span>
          ) : isWilting ? (
            <span className="text-garden-amber font-medium">⚠️ Starting to wilt</span>
          ) : (
            <>
              {habit.note ? `${habit.note} • ` : ""}
              {habit.category}
              {habit.streak > 0 && (
                <span className="text-garden-terracotta font-medium"> • 🔥 {habit.streak}</span>
              )}
            </>
          )}
        </p>
      </div>

      <button
        onClick={onToggle}
        aria-label={done ? "Mark as not done" : "Mark as done"}
        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
          done
            ? "bg-garden-forest border-garden-forest text-white"
            : "border-garden-border text-transparent hover:border-garden-leaf"
        }`}
      >
        <Check size={16} strokeWidth={3} />
      </button>
    </button>
  );
}
