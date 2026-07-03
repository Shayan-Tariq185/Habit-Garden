import { useMemo } from "react";
import { formatMonthDay } from "../lib/date";

// A continuous drag slider from the garden's start date to today. Value is
// a 0-100 percentage; the parent maps that back to an actual Date. Kept as
// a controlled, stateless component — all the "what date does this map to"
// logic lives in the parent so this stays simple and reusable.
export default function TimeSlider({ percent, onChange, startDate, currentDate }) {
  const isToday = percent >= 99.5;

  const label = useMemo(() => {
    if (isToday) return "Today";
    return formatMonthDay(currentDate);
  }, [currentDate, isToday]);

  return (
    <div className="bg-white rounded-2xl shadow-soft px-4 py-3.5 mb-4">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-semibold text-garden-muted uppercase tracking-wide">
          Garden History
        </span>
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            isToday ? "bg-garden-sage text-garden-forest" : "bg-garden-amberLight text-garden-forest"
          }`}
        >
          {label}
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        step={0.5}
        value={percent}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-garden-forest cursor-pointer"
        aria-label="Scrub through garden history"
      />

      <div className="flex items-center justify-between mt-1">
        <span className="text-[10px] text-garden-faint">{formatMonthDay(startDate)}</span>
        <span className="text-[10px] text-garden-faint">Today</span>
      </div>
    </div>
  );
}
