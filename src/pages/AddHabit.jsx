import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sprout, ChevronDown, Clock, Check } from "lucide-react";
import { useGarden } from "../context/GardenContext";
import { PLANT_TYPES } from "../lib/plants";
import ScreenHeader from "../components/ScreenHeader";

const CATEGORIES = ["Mindfulness", "Health", "Fitness", "Learning", "Productivity", "Creativity", "General"];
const FREQUENCIES = ["Daily", "Weekly", "Custom"];

export default function AddHabit() {
  const navigate = useNavigate();
  const { addHabit } = useGarden();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [frequency, setFrequency] = useState("Daily");
  const [reminderTime, setReminderTime] = useState("08:00");
  const [plantType, setPlantType] = useState("cactus");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const carouselRef = useRef(null);

  async function handleSave() {
    if (!name.trim()) {
      setError("Give your habit a name first.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await addHabit({
        name,
        category: category || "General",
        frequency,
        reminderTime,
        plantType,
      });
      navigate("/garden", { replace: true });
    } catch {
      setError("Couldn't save this habit. Check your connection and try again.");
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-garden-gradient pb-10">
      <ScreenHeader title="New Habit" showBack />

      <div className="px-5 mt-2 flex flex-col gap-5">
        {/* Habit name */}
        <div>
          <label className="block text-sm font-medium text-garden-muted mb-2">
            Which habit do you want to grow?
          </label>
          <div className="relative">
            <Sprout size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-garden-leaf" />
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g. Morning Yoga"
              className="w-full bg-white rounded-full pl-11 pr-4 py-3.5 text-[15px] text-garden-ink placeholder:text-garden-faint shadow-soft outline-none focus:ring-2 focus:ring-garden-leaf/40 transition-shadow"
            />
          </div>
          {error && <p className="text-xs text-garden-terracotta mt-1.5 ml-1">{error}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-garden-muted mb-2">Category</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setCategoryOpen((o) => !o)}
              className="w-full bg-white rounded-full px-4 py-3.5 text-[15px] shadow-soft flex items-center justify-between text-left"
            >
              <span className={category ? "text-garden-ink" : "text-garden-faint"}>
                {category || "Select a path..."}
              </span>
              <ChevronDown
                size={18}
                className={`text-garden-muted transition-transform duration-200 ${categoryOpen ? "rotate-180" : ""}`}
              />
            </button>
            {categoryOpen && (
              <div className="absolute z-10 top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lift border border-garden-border py-2 max-h-56 overflow-y-auto">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setCategory(c);
                      setCategoryOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-[15px] text-garden-ink hover:bg-garden-mint transition-colors flex items-center justify-between"
                  >
                    {c}
                    {category === c && <Check size={16} className="text-garden-forest" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-sm font-medium text-garden-muted mb-2">How often?</label>
          <div className="flex gap-2">
            {FREQUENCIES.map((f) => (
              <button
                key={f}
                onClick={() => setFrequency(f)}
                className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-colors duration-200 ${
                  frequency === f
                    ? "bg-garden-forest text-white shadow-button"
                    : "bg-white text-garden-muted shadow-soft"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Reminder */}
        <div>
          <label className="block text-sm font-medium text-garden-muted mb-2">Reminder</label>
          <div className="relative">
            <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-garden-leaf pointer-events-none" />
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full bg-white rounded-full pl-11 pr-4 py-3.5 text-[15px] text-garden-ink shadow-soft outline-none focus:ring-2 focus:ring-garden-leaf/40 transition-shadow"
            />
          </div>
        </div>

        {/* Plant type */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-garden-forest text-lg">Choose Your Seed</h2>
            <span className="text-[11px] font-medium text-garden-faint uppercase tracking-wide">
              Swipe to view
            </span>
          </div>
          <div ref={carouselRef} className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
            {PLANT_TYPES.map((p) => {
              const selected = plantType === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setPlantType(p.id)}
                  className={`flex-shrink-0 w-24 rounded-2xl p-3 flex flex-col items-center gap-2 border-2 transition-all duration-200 relative ${
                    selected
                      ? "border-garden-forest bg-white shadow-card"
                      : "border-transparent bg-white/70 shadow-soft"
                  }`}
                >
                  {selected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-garden-forest flex items-center justify-center">
                      <Check size={12} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: p.soft }}
                  >
                    {p.stages[0]}
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-garden-ink">{p.name}</p>
                    <p className="text-[10px] text-garden-muted">{p.trait}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-5 mt-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-garden-forest text-white font-semibold text-base py-4 rounded-full shadow-button flex items-center justify-center gap-2 active:scale-[0.98] transition-transform duration-150 hover:bg-garden-forestDark disabled:opacity-60 disabled:active:scale-100"
        >
          <Sprout size={18} />
          {saving ? "Planting..." : "Plant This Habit"}
        </button>
      </div>
    </div>
  );
}
