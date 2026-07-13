import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut } from "lucide-react";

export default function DashboardLayout({ roleLabel, roleColor = "bg-electric", sections, active, onSelect, title, subtitle, children }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex bg-[#EDF0F4]">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-midnight text-white flex flex-col min-h-screen">
        <div className="px-6 py-6 flex items-center gap-2.5 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-electric flex items-center justify-center font-extrabold text-[13px]">A</div>
          <div>
            <p className="font-bold text-[14px] leading-none">Allvex</p>
            <p className={`text-[10.5px] mt-1 font-semibold px-2 py-0.5 rounded-pill inline-block ${roleColor}`}>{roleLabel}</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 flex flex-col gap-1">
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => onSelect(s.key)}
              className={`tap flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-left ${
                active === s.key ? "bg-electric text-white" : "text-slate-300 hover:bg-white/5"
              }`}
            >
              <s.icon size={16} />
              {s.label}
            </button>
          ))}
        </nav>

        <div className="px-3 pb-5 flex flex-col gap-1">
          <button onClick={() => navigate("/portals")} className="tap flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-slate-300 hover:bg-white/5">
            <ArrowLeft size={16} /> Switch Portal
          </button>
          <button onClick={() => navigate("/login")} className="tap flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-red-300 hover:bg-white/5">
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-h-screen">
        <div className="px-6 lg:px-8 py-6 max-w-6xl">
          <div className="mb-6">
            <h1 className="text-[18px] font-bold text-midnight">{title}</h1>
            {subtitle && <p className="text-[12px] text-slate-400 mt-1">{subtitle}</p>}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
