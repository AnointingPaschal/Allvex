import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, Heart, GitCompareArrows, BadgeCheck } from "lucide-react";
import VehicleArt from "../components/VehicleArt.jsx";
import { vehicles } from "../data/mock.js";

const categories = ["All", "SUV", "Sedan", "Electric", "Pickup", "Luxury"];

export default function Marketplace() {
  const navigate = useNavigate();
  const [active, setActive] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesCat = active === "All" || v.category === active;
      const matchesQuery = `${v.brand} ${v.model}`.toLowerCase().includes(query.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [active, query]);

  return (
    <div>
      <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-3.5 bg-white sticky top-0 z-30 border-b border-slate-100">
        <h1 className="text-[17px] font-bold text-midnight mb-3">Marketplace</h1>
        <div className="flex items-center gap-2">
          <div className="flex-1 max-w-md flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
            <Search size={14} className="text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search brand or model..."
              className="bg-transparent outline-none text-[12px] w-full placeholder:text-slate-400"
            />
          </div>
          <button className="tap w-9 h-9 rounded-xl bg-midnight flex items-center justify-center shrink-0">
            <SlidersHorizontal size={14} className="text-white" />
          </button>
        </div>

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar mt-3">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`tap shrink-0 px-3.5 py-1.5 rounded-pill text-[11px] font-semibold ${
                active === c ? "bg-electric text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 mt-3.5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {filtered.map((v) => (
          <button
            key={v.id}
            onClick={() => navigate(`/marketplace/${v.id}`)}
            className="tap bg-white rounded-xl shadow-card overflow-hidden text-left flex flex-col"
          >
            <div className="relative">
              <VehicleArt category={v.category} src={v.image} className="h-24 w-full" iconSize={24} />
              <button className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                <Heart size={11} className="text-midnight" />
              </button>
              {v.verified && (
                <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 bg-white/90 rounded-pill px-1.5 py-0.5 text-[9px] font-semibold text-electric">
                  <BadgeCheck size={9} /> Verified
                </span>
              )}
            </div>
            <div className="p-2.5 flex-1 flex flex-col">
              <p className="font-semibold text-midnight text-[11.5px] truncate">{v.brand} {v.model}</p>
              <p className="text-[9.5px] text-slate-400 mt-0.5">{v.year} · {v.fuel}</p>
              <p className="text-[11.5px] font-bold text-midnight mt-1">₦{(v.price / 1000000).toFixed(1)}m</p>
              <p className="text-[9px] text-slate-400 mt-0.5">Est. landing · {v.delivery}</p>
              <button className="tap mt-1.5 flex items-center gap-1 text-[9.5px] font-semibold text-electric">
                <GitCompareArrows size={10} /> Compare
              </button>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="px-4 sm:px-6 lg:px-8 mt-16 text-center">
          <p className="text-slate-400 text-[12.5px]">No vehicles match your search.</p>
        </div>
      )}
      <div className="h-4" />
    </div>
  );
}
