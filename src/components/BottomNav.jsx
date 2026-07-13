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
    <nav className="sticky bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex justify-between z-40">
      {items.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            `tap flex-1 flex flex-col items-center gap-1 py-1.5 rounded-2xl mx-0.5 transition-colors ${
              isActive ? "text-electric" : "text-slate-400"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
              <span className={`text-[10.5px] ${isActive ? "font-semibold" : "font-medium"}`}>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
