import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, Menu, X } from "lucide-react";

export default function DashboardLayout({ roleLabel, roleColor = "bg-electric", sections, active, onSelect, title, subtitle, children }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function select(key) {
    onSelect(key);
    setOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#EDF0F4] lg:flex">
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between bg-midnight text-white px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-electric flex items-center justify-center font-extrabold text-[12px] shrink-0">A</div>
          <div>
            <p className="font-bold text-[13px] leading-none">Allvex</p>
            <p className={`text-[9.5px] mt-1 font-semibold px-1.5 py-0.5 rounded-pill inline-block ${roleColor}`}>{roleLabel}</p>
          </div>
        </div>
        <button onClick={() => setOpen(true)} className="tap w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
          <Menu size={17} />
        </button>
      </div>

      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar (off-canvas on mobile, static on desktop) */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 lg:w-56 shrink-0 bg-midnight text-white flex flex-col min-h-screen transform transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="px-6 py-6 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-electric flex items-center justify-center font-extrabold text-[13px]">A</div>
            <div>
              <p className="font-bold text-[14px] leading-none">Allvex</p>
              <p className={`text-[10.5px] mt-1 font-semibold px-2 py-0.5 rounded-pill inline-block ${roleColor}`}>{roleLabel}</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="tap w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center lg:hidden">
            <X size={15} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-5 flex flex-col gap-1 overflow-y-auto">
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => select(s.key)}
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
      <main className="flex-1 min-h-screen min-w-0">
        <div className="px-4 sm:px-6 lg:px-8 py-5 lg:py-6 max-w-6xl">
          <div className="mb-5 lg:mb-6">
            <h1 className="text-[16px] lg:text-[18px] font-bold text-midnight">{title}</h1>
            {subtitle && <p className="text-[11.5px] lg:text-[12px] text-slate-400 mt-1">{subtitle}</p>}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
