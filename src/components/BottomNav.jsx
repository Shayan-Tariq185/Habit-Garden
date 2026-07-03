import { NavLink } from "react-router-dom";
import { Sprout, TrendingUp, BarChart3, User } from "lucide-react";

const TABS = [
  { to: "/garden", label: "Garden", icon: Sprout },
  { to: "/growth", label: "Growth", icon: TrendingUp },
  { to: "/insights", label: "Insights", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: User },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 mx-auto max-w-[430px] px-0">
      <div className="mx-3 mb-3 rounded-3xl bg-white/95 backdrop-blur border border-garden-border shadow-lift">
        <div className="flex items-stretch justify-between px-2 py-2">
          {TABS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-2xl mx-1 transition-colors duration-200 ${
                  isActive
                    ? "bg-garden-sage text-garden-forest"
                    : "text-garden-faint hover:text-garden-leaf"
                }`
              }
            >
              <Icon size={20} strokeWidth={2.2} />
              <span className="text-[11px] font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
