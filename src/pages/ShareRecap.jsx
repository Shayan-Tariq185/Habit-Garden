import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toPng } from "html-to-image";
import { ChevronLeft, Download, Loader2 } from "lucide-react";
import { useGarden } from "../context/GardenContext";
import {
  getWeeklyCompletionRate,
  getTotalCompletionsInRange,
  getLongestStreak,
  getGardenHealth,
  getPlantsLeveledUpCount,
} from "../lib/habitStore";
import { getWeekDates, formatWeekRange, toKey } from "../lib/date";
import RecapCard from "../components/RecapCard";

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1920;

export default function ShareRecap() {
  const navigate = useNavigate();
  const { habits, userName } = useGarden();
  const cardRef = useRef(null);
  const wrapperRef = useRef(null);
  const [scale, setScale] = useState(0.3);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const weekDates = getWeekDates();
  const rangeStartKey = toKey(weekDates[0]);

  const weeklyRate = getWeeklyCompletionRate(habits, weekDates);
  const totalCultivated = getTotalCompletionsInRange(habits, weekDates);
  const longestStreak = getLongestStreak(habits);
  const health = getGardenHealth(habits);
  const plantsLeveledUp = getPlantsLeveledUpCount(habits, rangeStartKey);
  const healthLabel =
    health >= 80 ? "Thriving" : health >= 50 ? "Growing" : health >= 20 ? "Sprouting" : "Needs Care";

  // Scale the fixed 1080x1920 card down to fit the available on-screen width,
  // so it always renders crisp at export time but fits any phone in preview.
  useEffect(() => {
    function updateScale() {
      if (!wrapperRef.current) return;
      const availableWidth = wrapperRef.current.offsetWidth;
      setScale(Math.min(1, availableWidth / CARD_WIDTH));
    }
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  async function handleDownload() {
    if (!cardRef.current) return;
    setExporting(true);
    setExportError("");
    try {
      const dataUrl = await toPng(cardRef.current, {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        pixelRatio: 1, // card is already at full 1080x1920, no further upscale needed
        cacheBust: true,
        // html-to-image tries to inline every stylesheet on the page,
        // including the Google Fonts <link> in index.html. That fetch can
        // fail under strict CORS/network conditions unrelated to the card
        // itself. Skipping it is safe: the font is already loaded and
        // rendered into the DOM by the time we capture, so the glyphs are
        // baked into the canvas regardless of whether the stylesheet inlines.
        skipFonts: true,
      });
      const link = document.createElement("a");
      const dateStamp = toKey(new Date());
      link.download = `habit-garden-recap-${dateStamp}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export recap card:", err);
      setExportError("Couldn't generate the image. Try again.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="min-h-screen bg-garden-gradient pb-10">
      <div className="flex items-center justify-between px-5 pt-6 pb-3">
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="w-9 h-9 rounded-full flex items-center justify-center text-garden-forest hover:bg-white/50 transition-colors -ml-2"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="font-display font-semibold text-lg text-garden-forest">Share Your Week</h1>
        <div className="w-9 h-9" />
      </div>

      <div className="px-5">
        {habits.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-garden-border mt-4">
            <p className="text-3xl mb-2">🌱</p>
            <p className="text-garden-muted text-sm">
              Plant a few habits and complete them this week to unlock your recap card.
            </p>
          </div>
        ) : (
          <>
            {/* Scaled preview */}
            <div ref={wrapperRef} className="w-full mb-5">
              <div
                className="rounded-3xl overflow-hidden shadow-lift mx-auto"
                style={{
                  width: CARD_WIDTH * scale,
                  height: CARD_HEIGHT * scale,
                }}
              >
                <div
                  style={{
                    width: CARD_WIDTH,
                    height: CARD_HEIGHT,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                  }}
                >
                  <div ref={cardRef}>
                    <RecapCard
                      userName={userName}
                      weekRangeLabel={formatWeekRange()}
                      weeklyRate={weeklyRate}
                      totalCultivated={totalCultivated}
                      longestStreak={longestStreak}
                      healthLabel={healthLabel}
                      plantsLeveledUp={plantsLeveledUp}
                      topHabits={habits}
                    />
                  </div>
                </div>
              </div>
            </div>

            {exportError && (
              <p className="text-sm text-garden-terracotta bg-orange-50 rounded-xl px-4 py-2.5 mb-4 text-center">
                {exportError}
              </p>
            )}

            <button
              onClick={handleDownload}
              disabled={exporting}
              className="w-full bg-garden-forest text-white font-semibold text-base py-4 rounded-full shadow-button flex items-center justify-center gap-2 active:scale-[0.98] transition-transform duration-150 hover:bg-garden-forestDark disabled:opacity-60 disabled:active:scale-100"
            >
              {exporting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Preparing image...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Download Image
                </>
              )}
            </button>
            <p className="text-center text-xs text-garden-faint mt-3">
              Saves as a PNG, ready to share on Instagram Stories or LinkedIn.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
