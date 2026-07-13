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
  { icon: Wrench, label: "Garage", desc: "Manage your vehicles", to: "/garage" },
  { icon: Truck, label: "Track Import", desc: "See shipment status", to: "/import" },
  { icon: Bot, label: "Ask AI", desc: "Get instant answers", to: "/assistant" },
  { icon: ClipboardCheck, label: "Book Inspection", desc: "Verify a vehicle", to: "/marketplace" },
  { icon: ShoppingBag, label: "Accessories", desc: "Shop essentials", to: "/marketplace" },
];

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="pb-8">
      {/* Header */}
      <div className="px-5 pt-14 pb-5 bg-midnight text-white rounded-b-[28px]">
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-[19px] font-bold leading-tight">Good Morning, Alex</p>
            <p className="text-slate-400 text-[12.5px] mt-0.5">Monday, July 13</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="tap relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <Bell size={18} />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-electric text-[9px] font-bold flex items-center justify-center">3</span>
            </button>
            <button onClick={() => navigate("/profile")} className="tap w-10 h-10 rounded-full bg-electric flex items-center justify-center font-bold text-[13px]">
              AJ
            </button>
          </div>
        </div>

        <button onClick={() => navigate("/marketplace")} className="tap w-full flex items-center gap-3 bg-white/10 rounded-allvex px-4 py-3.5">
          <Search size={17} className="text-slate-300" />
          <span className="text-slate-300 text-[13.5px]">Search cars, AI, orders...</span>
        </button>
      </div>

      {/* Quick actions */}
      <div className="px-5 mt-5">
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {quickActions.map((q) => (
            <button
              key={q.label}
              onClick={() => navigate(q.to)}
              className="tap shrink-0 w-[128px] bg-white rounded-allvex shadow-card p-3.5 text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-electric/10 flex items-center justify-center mb-2.5">
                <q.icon size={17} className="text-electric" />
              </div>
              <p className="text-[12.5px] font-semibold text-midnight leading-tight">{q.label}</p>
              <p className="text-[10.5px] text-slate-400 mt-0.5 leading-tight">{q.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Active import */}
      <div className="px-5 mt-5">
        <SectionTitle title="Active Import" onView={() => navigate("/import")} />
        <button onClick={() => navigate("/import")} className="tap w-full bg-white rounded-allvex shadow-card p-4 flex gap-3.5 text-left">
          <VehicleArt category="Electric" className="w-16 h-16 rounded-2xl shrink-0" iconSize={26} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-midnight text-[14px] truncate">{activeImport.vehicle}</p>
            <p className="text-[12px] text-slate-400 mt-0.5">{activeImport.stage}</p>
            <div className="h-1.5 bg-slate-100 rounded-pill mt-2.5 overflow-hidden">
              <div className="h-full bg-electric rounded-pill" style={{ width: `${activeImport.progress}%` }} />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">{activeImport.progress}% · ETA {activeImport.eta}</p>
          </div>
        </button>
      </div>

      {/* Garage summary */}
      <div className="px-5 mt-6">
        <SectionTitle title="My Garage" subtitle={`${garageVehicles.length} vehicles`} onView={() => navigate("/garage")} />
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {garageVehicles.map((v) => (
            <button key={v.id} onClick={() => navigate(`/garage/${v.id}`)} className="tap shrink-0 w-[210px] bg-white rounded-allvex shadow-card overflow-hidden text-left">
              <VehicleArt category={v.brand === "BYD" ? "Electric" : "SUV"} className="h-24 w-full" iconSize={30} />
              <div className="p-3.5">
                <p className="font-semibold text-midnight text-[13.5px] truncate">{v.nickname}</p>
                <p className="text-[11.5px] text-slate-400 mt-0.5">{v.nextService}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Reminders */}
      <div className="px-5 mt-6">
        <SectionTitle title="Reminders" onView={() => navigate("/garage")} />
        <div className="flex flex-col gap-2.5">
          {reminders.map((r) => (
            <div key={r.id} className="bg-white rounded-allvex shadow-card px-4 py-3.5 flex items-center justify-between">
              <div>
                <p className="text-[13.5px] font-semibold text-midnight">{r.title}</p>
                <p className="text-[11.5px] text-slate-400 mt-0.5">{r.vehicle}</p>
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-pill ${levelStyles[r.level]}`}>{r.due}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Assistant card */}
      <div className="px-5 mt-6">
        <button onClick={() => navigate("/assistant")} className="tap w-full bg-midnight rounded-allvex p-5 text-left relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-electric/20" />
          <Bot size={22} className="text-electric mb-3" />
          <p className="text-white font-semibold text-[15px] mb-1">Need help choosing a vehicle?</p>
          <p className="text-slate-400 text-[12.5px] mb-4">Compare models, track imports, or ask anything.</p>
          <span className="inline-flex items-center gap-1.5 text-electric text-[13px] font-semibold">
            Ask Allvex AI <ArrowRight size={14} />
          </span>
        </button>
      </div>

      {/* Featured vehicles */}
      <div className="px-5 mt-6">
        <SectionTitle title="Featured Vehicles" onView={() => navigate("/marketplace")} />
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {vehicles.map((v) => (
            <button key={v.id} onClick={() => navigate(`/marketplace/${v.id}`)} className="tap shrink-0 w-[168px] bg-white rounded-allvex shadow-card overflow-hidden text-left">
              <VehicleArt category={v.category} className="h-24 w-full" iconSize={28} />
              <div className="p-3">
                <p className="font-semibold text-midnight text-[13px] truncate">{v.brand} {v.model}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{v.year} · {v.fuel}</p>
                <p className="text-[12.5px] font-bold text-midnight mt-1.5">₦{(v.price / 1000000).toFixed(1)}m</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Articles */}
      <div className="px-5 mt-6">
        <SectionTitle title="Automotive News" onView={() => {}} />
        <div className="flex flex-col gap-2.5">
          {articles.map((a) => (
            <div key={a.id} className="bg-white rounded-allvex shadow-card p-3 flex items-center gap-3">
              <VehicleArt category="default" className="w-16 h-16 rounded-xl shrink-0" iconSize={20} />
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-midnight leading-snug line-clamp-2">{a.title}</p>
                <p className="text-[11px] text-slate-400 mt-1">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accessories */}
      <div className="px-5 mt-6">
        <SectionTitle title="Recommended Accessories" onView={() => {}} />
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {accessories.map((a) => (
            <div key={a.id} className="tap shrink-0 w-[130px] bg-white rounded-allvex shadow-card overflow-hidden">
              <VehicleArt category="default" className="h-20 w-full" iconSize={20} />
              <div className="p-3">
                <p className="text-[12px] font-semibold text-midnight leading-tight truncate">{a.name}</p>
                <p className="text-[12px] font-bold text-electric mt-1">₦{a.price.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAB */}
      <button onClick={() => navigate("/assistant")} className="tap fixed bottom-24 right-[max(1.25rem,calc(50%-215px+1.25rem))] w-14 h-14 rounded-full bg-electric shadow-lg flex items-center justify-center z-40">
        <Bot size={24} className="text-white" />
      </button>
    </div>
  );
}

function SectionTitle({ title, subtitle, onView }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-baseline gap-2">
        <h2 className="text-[15px] font-bold text-midnight">{title}</h2>
        {subtitle && <span className="text-[12px] text-slate-400">{subtitle}</span>}
      </div>
      <button onClick={onView} className="tap flex items-center text-[12.5px] text-electric font-semibold">
        See all <ChevronRight size={14} />
      </button>
    </div>
  );
}
