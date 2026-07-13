import { useNavigate } from "react-router-dom";
import { Bell, Search, Car, Wrench, Bot, ClipboardCheck, ShoppingBag, Truck, ChevronRight, ArrowRight } from "lucide-react";
import VehicleArt from "../components/VehicleArt.jsx";
import { vehicles, reminders, activeImport, garageVehicles, articles, accessories } from "../data/mock.js";

const levelStyles = {
  upcoming: "bg-blue-50 text-electric",
  due: "bg-amber-50 text-warning",
  overdue: "bg-red-50 text-danger",
};

const quickActions = [
  { icon: Car, label: "Import Vehicle", desc: "Find your next car", to: "/marketplace" },
  { icon: Wrench, label: "Garage", desc: "Manage vehicles", to: "/garage" },
  { icon: Truck, label: "Track Import", desc: "Shipment status", to: "/import" },
  { icon: Bot, label: "Ask AI", desc: "Instant answers", to: "/assistant" },
  { icon: ClipboardCheck, label: "Inspection", desc: "Verify a vehicle", to: "/marketplace" },
  { icon: ShoppingBag, label: "Accessories", desc: "Shop essentials", to: "/marketplace" },
];

export default function Home() {
  const navigate = useNavigate();
  return (
    <div>
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-4 bg-midnight text-white rounded-b-[24px]">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[16px] sm:text-[17px] font-bold leading-tight">Good Morning, Alex</p>
            <p className="text-slate-400 text-[11px] mt-0.5">Monday, July 13</p>
          </div>
          <div className="flex items-center gap-2.5">
            <button className="tap relative w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <Bell size={15} />
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-electric text-[8px] font-bold flex items-center justify-center">3</span>
            </button>
            <button onClick={() => navigate("/profile")} className="tap w-8 h-8 rounded-full bg-electric flex items-center justify-center font-bold text-[11px]">
              AJ
            </button>
          </div>
        </div>

        <button onClick={() => navigate("/marketplace")} className="tap w-full max-w-md flex items-center gap-2.5 bg-white/10 rounded-xl px-3.5 py-2.5">
          <Search size={14} className="text-slate-300" />
          <span className="text-slate-300 text-[12px]">Search cars, AI, orders...</span>
        </button>
      </div>

      <div className="px-4 sm:px-6 lg:px-8">
        {/* Quick actions */}
        <div className="mt-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {quickActions.map((q) => (
              <button
                key={q.label}
                onClick={() => navigate(q.to)}
                className="tap bg-white rounded-xl shadow-card p-3 text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-electric/10 flex items-center justify-center mb-2">
                  <q.icon size={13.5} className="text-electric" />
                </div>
                <p className="text-[11px] font-semibold text-midnight leading-tight">{q.label}</p>
                <p className="text-[9.5px] text-slate-400 mt-0.5 leading-tight">{q.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5 mt-5">
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Active import */}
            <div>
              <SectionTitle title="Active Import" onView={() => navigate("/import")} />
              <button onClick={() => navigate("/import")} className="tap w-full bg-white rounded-xl shadow-card p-3.5 flex gap-3 text-left">
                <VehicleArt category="Electric" src={activeImport.image} className="w-14 h-14 rounded-lg shrink-0" iconSize={22} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-midnight text-[12.5px] truncate">{activeImport.vehicle}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{activeImport.stage}</p>
                  <div className="h-1.5 bg-slate-100 rounded-pill mt-2 overflow-hidden">
                    <div className="h-full bg-electric rounded-pill" style={{ width: `${activeImport.progress}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{activeImport.progress}% · ETA {activeImport.eta}</p>
                </div>
              </button>
            </div>

            {/* Garage summary */}
            <div>
              <SectionTitle title="My Garage" subtitle={`${garageVehicles.length} vehicles`} onView={() => navigate("/garage")} />
              <div className="grid sm:grid-cols-2 gap-3">
                {garageVehicles.map((v) => (
                  <button key={v.id} onClick={() => navigate(`/garage/${v.id}`)} className="tap bg-white rounded-xl shadow-card overflow-hidden text-left flex">
                    <VehicleArt category={v.brand === "BYD" ? "Electric" : "SUV"} src={v.image} className="w-20 shrink-0" iconSize={22} />
                    <div className="p-3 min-w-0">
                      <p className="font-semibold text-midnight text-[12px] truncate">{v.nickname}</p>
                      <p className="text-[10.5px] text-slate-400 mt-0.5 truncate">{v.nextService}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Featured vehicles */}
            <div>
              <SectionTitle title="Featured Vehicles" onView={() => navigate("/marketplace")} />
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {vehicles.map((v) => (
                  <button key={v.id} onClick={() => navigate(`/marketplace/${v.id}`)} className="tap bg-white rounded-xl shadow-card overflow-hidden text-left">
                    <VehicleArt category={v.category} src={v.image} className="h-20 w-full" iconSize={22} />
                    <div className="p-2.5">
                      <p className="font-semibold text-midnight text-[11.5px] truncate">{v.brand} {v.model}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{v.year} · {v.fuel}</p>
                      <p className="text-[11.5px] font-bold text-midnight mt-1">₦{(v.price / 1000000).toFixed(1)}m</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {/* Reminders */}
            <div>
              <SectionTitle title="Reminders" onView={() => navigate("/garage")} />
              <div className="flex flex-col gap-2">
                {reminders.map((r) => (
                  <div key={r.id} className="bg-white rounded-xl shadow-card px-3.5 py-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-midnight truncate">{r.title}</p>
                      <p className="text-[10.5px] text-slate-400 mt-0.5 truncate">{r.vehicle}</p>
                    </div>
                    <span className={`text-[9.5px] font-semibold px-2 py-1 rounded-pill shrink-0 ${levelStyles[r.level]}`}>{r.due}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Assistant card */}
            <button onClick={() => navigate("/assistant")} className="tap w-full bg-midnight rounded-xl p-4 text-left relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-electric/20" />
              <Bot size={18} className="text-electric mb-2.5" />
              <p className="text-white font-semibold text-[13px] mb-1">Need help choosing a vehicle?</p>
              <p className="text-slate-400 text-[11px] mb-3">Compare models, track imports, or ask anything.</p>
              <span className="inline-flex items-center gap-1.5 text-electric text-[11.5px] font-semibold">
                Ask Allvex AI <ArrowRight size={12} />
              </span>
            </button>

            {/* Articles */}
            <div>
              <SectionTitle title="Automotive News" onView={() => {}} />
              <div className="flex flex-col gap-2">
                {articles.map((a) => (
                  <div key={a.id} className="bg-white rounded-xl shadow-card p-2.5 flex items-center gap-2.5">
                    <VehicleArt category="default" src={a.image} className="w-12 h-12 rounded-lg shrink-0" iconSize={16} />
                    <div className="min-w-0">
                      <p className="text-[11.5px] font-semibold text-midnight leading-snug line-clamp-2">{a.title}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Accessories */}
            <div>
              <SectionTitle title="Accessories" onView={() => {}} />
              <div className="grid grid-cols-3 sm:grid-cols-2 gap-2.5">
                {accessories.map((a) => (
                  <div key={a.id} className="tap bg-white rounded-xl shadow-card overflow-hidden">
                    <VehicleArt category="default" src={a.image} className="h-14 w-full" iconSize={16} />
                    <div className="p-2">
                      <p className="text-[10.5px] font-semibold text-midnight leading-tight truncate">{a.name}</p>
                      <p className="text-[10.5px] font-bold text-electric mt-0.5">₦{a.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAB */}
      <button onClick={() => navigate("/assistant")} className="tap fixed bottom-24 right-4 sm:right-8 w-12 h-12 rounded-full bg-electric shadow-lg flex items-center justify-center z-40">
        <Bot size={20} className="text-white" />
      </button>
      <div className="h-2" />
    </div>
  );
}

function SectionTitle({ title, subtitle, onView }) {
  return (
    <div className="flex items-center justify-between mb-2.5">
      <div className="flex items-baseline gap-2">
        <h2 className="text-[13px] font-bold text-midnight">{title}</h2>
        {subtitle && <span className="text-[10.5px] text-slate-400">{subtitle}</span>}
      </div>
      <button onClick={onView} className="tap flex items-center text-[11px] text-electric font-semibold">
        See all <ChevronRight size={12} />
      </button>
    </div>
  );
}
