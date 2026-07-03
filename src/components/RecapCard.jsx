import { getPlant, getPlantEmoji } from "../lib/plants";

// Designed at a fixed 1080x1920 render size (standard Instagram Story
// dimensions) so the exported PNG looks crisp regardless of the device's
// actual screen size. On-screen it's displayed scaled down via CSS transform
// so it still fits naturally in the layout; the export captures the full
// resolution version.

export default function RecapCard({
  userName,
  weekRangeLabel,
  weeklyRate,
  totalCultivated,
  longestStreak,
  healthLabel,
  plantsLeveledUp,
  topHabits,
}) {
  return (
    <div
      id="recap-card"
      className="relative overflow-hidden"
      style={{
        width: 1080,
        height: 1920,
        background:
          "radial-gradient(ellipse at 50% 0%, #EAF2E4 0%, #F5F1E4 45%, #FAF8F1 100%)",
        fontFamily: "'Poppins', system-ui, sans-serif",
      }}
    >
      {/* Decorative ground texture, echoes the garden scene */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle, #C8DCB8 3px, transparent 3px), radial-gradient(circle, #C8DCB8 3px, transparent 3px)",
          backgroundSize: "72px 72px",
          backgroundPosition: "0 0, 36px 36px",
        }}
      />

      <div className="relative flex flex-col h-full px-16 pt-20 pb-16">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#DCEBD3" }}
          >
            <span style={{ fontSize: 32 }}>🌱</span>
          </div>
          <span style={{ fontSize: 34, fontWeight: 600, color: "#2C4A2B" }}>Habit Garden</span>
        </div>

        <h1
          style={{
            fontSize: 68,
            fontWeight: 800,
            color: "#2C4A2B",
            lineHeight: 1.08,
            marginTop: 24,
            marginBottom: 8,
          }}
        >
          {userName}'s Week
          <br />
          in the Garden
        </h1>
        <p style={{ fontSize: 30, color: "#6B7566", marginBottom: 56 }}>{weekRangeLabel}</p>

        {/* Hero stat */}
        <div
          className="rounded-[40px] flex flex-col items-center justify-center py-16 mb-12"
          style={{ backgroundColor: "#FFFFFF", boxShadow: "0 20px 60px rgba(44,74,43,0.10)" }}
        >
          <span style={{ fontSize: 130, fontWeight: 800, color: "#2C4A2B", lineHeight: 1 }}>
            {weeklyRate}%
          </span>
          <span
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: "#6B7566",
              textTransform: "uppercase",
              letterSpacing: 2,
              marginTop: 12,
            }}
          >
            Weekly Completion
          </span>
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-2 gap-8 mb-12">
          <RecapStat icon="🍃" value={totalCultivated} label="Habits Cultivated" />
          <RecapStat icon="🔥" value={`${longestStreak}d`} label="Longest Streak" />
          <RecapStat icon="🌻" value={plantsLeveledUp} label="Plants Leveled Up" />
          <RecapStat icon="💚" value={healthLabel} label="Garden Health" small />
        </div>

        {/* Garden preview strip */}
        {topHabits.length > 0 && (
          <div className="mb-auto">
            <p
              style={{
                fontSize: 26,
                fontWeight: 600,
                color: "#6B7566",
                textTransform: "uppercase",
                letterSpacing: 2,
                marginBottom: 20,
              }}
            >
              This Week's Garden
            </p>
            <div className="flex gap-6">
              {topHabits.slice(0, 4).map((h) => {
                const plant = getPlant(h.plantType);
                return (
                  <div
                    key={h.id}
                    className="flex-1 rounded-[28px] flex flex-col items-center justify-center py-10"
                    style={{ backgroundColor: plant.soft }}
                  >
                    <span style={{ fontSize: 64 }}>{getPlantEmoji(h.plantType, h.totalCompletions)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 mt-16">
          <span style={{ fontSize: 24, color: "#9AA595" }}>🌿 Grown with Habit Garden</span>
        </div>
      </div>
    </div>
  );
}

function RecapStat({ icon, value, label, small }) {
  return (
    <div
      className="rounded-[32px] flex flex-col items-start justify-center px-8 py-10"
      style={{ backgroundColor: "#FFFFFF", boxShadow: "0 12px 40px rgba(44,74,43,0.08)" }}
    >
      <span style={{ fontSize: 44, marginBottom: 12 }}>{icon}</span>
      <span
        style={{
          fontSize: small ? 40 : 56,
          fontWeight: 800,
          color: "#2C4A2B",
          lineHeight: 1,
          marginBottom: 8,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontSize: 22,
          fontWeight: 600,
          color: "#6B7566",
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        {label}
      </span>
    </div>
  );
}
