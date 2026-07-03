import { useNavigate } from "react-router-dom";
import { Share2 } from "lucide-react";
import { useGarden } from "../context/GardenContext";
import {
  getWeeklyCompletionRate,
  getTotalCompletionsInRange,
  getLongestStreak,
  getGardenHealth,
  getFocusDistribution,
  getCompletionTrend,
  CATEGORY_COLORS,
} from "../lib/habitStore";
import { getWeekDates, formatWeekRange, WEEKDAY_LETTERS } from "../lib/date";
import BottomNav from "../components/BottomNav";

export default function Insights() {
  const navigate = useNavigate();
  const { habits, loading } = useGarden();
  const weekDates = getWeekDates();

  if (loading) {
    return (
      <div className="min-h-screen bg-garden-gradient flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-garden-sage border-t-garden-forest animate-spin" />
      </div>
    );
  }

  const weeklyRate = getWeeklyCompletionRate(habits, weekDates);
  const totalCultivated = getTotalCompletionsInRange(habits, weekDates);
  const longestStreak = getLongestStreak(habits);
  const health = getGardenHealth(habits);
  const trend = getCompletionTrend(habits, weekDates);
  const focus = getFocusDistribution(habits);

  const healthLabel = health >= 80 ? "Thriving" : health >= 50 ? "Growing" : health >= 20 ? "Sprouting" : "Needs Care";

  return (
    <div className="min-h-screen bg-garden-gradient pb-32">
      <div className="px-5 pt-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-display font-semibold text-garden-forest text-base">Habit Garden</span>
        </div>
      </div>

      <div className="px-5">
        <div className="flex items-center justify-between mt-2 mb-1">
          <h1 className="font-display text-2xl font-bold text-garden-forest">
            Your Weekly Growth
          </h1>
          <button
            onClick={() => navigate("/share")}
            aria-label="Share this week's recap"
            className="w-10 h-10 rounded-full bg-garden-forest text-white flex items-center justify-center shadow-button active:scale-95 transition-transform shrink-0"
          >
            <Share2 size={17} />
          </button>
        </div>
        <p className="text-garden-muted text-sm mb-5">
          Reviewing your progress for {formatWeekRange()}.
        </p>

        {/* Stat grid */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <StatCard icon="🌿" iconBg="#DCEBD3" value={`${weeklyRate}%`} label="Weekly Completion" />
          <StatCard icon="🍃" iconBg="#DCEBD3" value={totalCultivated} label="Habits Cultivated" />
        </div>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <StatCard icon="🪴" iconBg="#F6D9A0" value={`${longestStreak} Days`} label="Longest Streak" />
          <div className="bg-garden-forest rounded-2xl p-4 flex flex-col shadow-card relative overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center mb-2">
              <span className="text-base">🌻</span>
            </div>
            <p className="text-white font-bold text-base leading-tight">{healthLabel}</p>
            <p className="text-white/70 text-[11px] font-medium uppercase tracking-wide">Garden Health</p>
          </div>
        </div>

        {/* Completion trend */}
        <div className="bg-white rounded-2xl shadow-soft p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-garden-ink text-[15px]">Completion Trend</h3>
            <span className="text-xs font-medium text-garden-muted bg-garden-mint px-2.5 py-1 rounded-full">
              This Week
            </span>
          </div>
          <TrendChart trend={trend} />
          <div className="flex justify-between mt-2">
            {WEEKDAY_LETTERS.map((d, i) => (
              <span key={i} className="text-[10px] text-garden-faint w-6 text-center">
                {d}
              </span>
            ))}
          </div>
        </div>

        {/* Focus distribution */}
        <div className="bg-white rounded-2xl shadow-soft p-5 mb-5">
          <h3 className="font-semibold text-garden-ink text-[15px] mb-4">Focus Distribution</h3>
          {habits.length === 0 ? (
            <p className="text-sm text-garden-muted text-center py-6">
              Plant a few habits to see your focus areas.
            </p>
          ) : (
            <div className="flex items-center gap-6">
              <DonutChart focus={focus} total={habits.length} />
              <div className="flex-1 flex flex-col gap-2.5">
                {focus.map((f) => (
                  <div key={f.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[f.category] || "#9AA595" }}
                      />
                      <span className="text-xs text-garden-ink truncate">{f.category}</span>
                    </div>
                    <span className="text-xs font-semibold text-garden-muted shrink-0 ml-2">{f.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function StatCard({ icon, iconBg, value, label }) {
  return (
    <div className="bg-white rounded-2xl shadow-soft p-4">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center mb-2"
        style={{ backgroundColor: iconBg || "#DCEBD3" }}
      >
        <span className="text-base">{icon}</span>
      </div>
      <p className="text-xl font-bold text-garden-ink leading-tight">{value}</p>
      <p className="text-[11px] font-medium text-garden-muted uppercase tracking-wide">{label}</p>
    </div>
  );
}

function TrendChart({ trend }) {
  const width = 320;
  const height = 100;
  const padding = 10;
  const max = 100;
  const step = (width - padding * 2) / (trend.length - 1);

  const points = trend.map((t, i) => {
    const x = padding + i * step;
    const y = height - padding - (t.percent / max) * (height - padding * 2);
    return { x, y, ...t };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height: 100 }}>
      <defs>
        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4B7A43" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#4B7A43" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#trendFill)" />
      <path d={linePath} fill="none" stroke="#2C4A2B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={p.isFuture ? 0 : 3.5}
          fill={p.isFuture ? "transparent" : "#2C4A2B"}
          stroke="white"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}

function DonutChart({ focus, total }) {
  const size = 100;
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  let offsetAcc = 0;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#EAF2E4" strokeWidth={stroke} />
        {focus.map((f) => {
          const dash = (f.percent / 100) * circumference;
          const el = (
            <circle
              key={f.category}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={CATEGORY_COLORS[f.category] || "#9AA595"}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offsetAcc}
              strokeLinecap="butt"
            />
          );
          offsetAcc += dash;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-bold text-lg text-garden-forest">{total}</span>
        <span className="text-[9px] text-garden-muted uppercase tracking-wide">habits</span>
      </div>
    </div>
  );
}
