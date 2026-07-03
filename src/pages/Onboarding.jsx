import { useNavigate } from "react-router-dom";
import { ArrowRight, Leaf } from "lucide-react";

export default function Onboarding() {
  const navigate = useNavigate();

  function handleGetStarted() {
    navigate("/auth");
  }

  return (
    <div className="min-h-screen bg-garden-gradient flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-8 pt-16 pb-6">
        {/* Visual area */}
        <div className="w-full max-w-[280px] aspect-square rounded-full bg-white/70 flex items-center justify-center shadow-soft mb-10 animate-popIn">
          <div className="w-[72%] aspect-[4/3] rounded-2xl bg-white shadow-card flex flex-col items-center justify-center gap-3 px-4 py-5 rotate-[-1deg]">
            <div className="w-16 h-16 rounded-full bg-garden-sage flex items-center justify-center animate-sway">
              <span className="text-3xl" role="img" aria-label="growing plant">🌱</span>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-garden-forest">Welcome to Growth</p>
              <p className="text-[10px] text-garden-muted mt-0.5">Your garden awaits</p>
            </div>
          </div>
        </div>

        <div className="text-center max-w-xs">
          <div className="flex items-center justify-center gap-1.5 mb-3 text-garden-leaf">
            <Leaf size={16} />
            <span className="text-xs font-semibold tracking-wide uppercase">Habit Garden</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-garden-forest leading-tight mb-4">
            Grow Your Best Self
          </h1>
          <p className="text-garden-muted text-base leading-relaxed">
            Turn your daily routines into a flourishing garden. One habit at a time.
          </p>
        </div>
      </div>

      <div className="px-6 pb-10 pt-4">
        <button
          onClick={handleGetStarted}
          className="w-full bg-garden-forest text-white font-semibold text-base py-4 rounded-full shadow-button flex items-center justify-center gap-2 active:scale-[0.98] transition-transform duration-150 hover:bg-garden-forestDark"
        >
          Get Started
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
