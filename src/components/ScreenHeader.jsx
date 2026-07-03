import { ChevronLeft, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ScreenHeader({ title, showBack = false, right = null }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-between px-5 pt-6 pb-3">
      <div className="flex items-center gap-2 min-w-[36px]">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="w-9 h-9 rounded-full flex items-center justify-center text-garden-forest hover:bg-garden-sage/60 transition-colors -ml-2"
          >
            <ChevronLeft size={22} />
          </button>
        )}
      </div>
      {title && (
        <h1 className="font-display font-semibold text-lg text-garden-forest tracking-tight">
          {title}
        </h1>
      )}
      <div className="min-w-[36px] flex justify-end">
        {right !== null ? right : <div className="w-9 h-9" />}
      </div>
    </div>
  );
}

export function BellButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Notifications"
      className="w-9 h-9 rounded-full flex items-center justify-center text-garden-forest hover:bg-garden-sage/60 transition-colors"
    >
      <Bell size={20} />
    </button>
  );
}
