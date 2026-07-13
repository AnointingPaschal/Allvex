import { NavLink } from "react-router-dom";
import { Home, Car, Wrench, Bot, User } from "lucide-react";

const items = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/marketplace", icon: Car, label: "Marketplace" },
  { to: "/garage", icon: Wrench, label: "Garage" },
  { to: "/assistant", icon: Bot, label: "Assistant" },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-slate-100">
      <div className="page flex justify-between sm:justify-center sm:gap-1 px-2 sm:px-4 pt-1.5 pb-[max(0.4rem,env(safe-area-inset-bottom))]">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `tap flex-1 sm:flex-none sm:w-24 flex flex-col items-center gap-0.5 py-1.5 rounded-xl mx-0.5 transition-colors ${
                isActive ? "text-electric" : "text-slate-400"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={19} strokeWidth={isActive ? 2.4 : 2} />
                <span className={`text-[10px] ${isActive ? "font-semibold" : "font-medium"}`}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
