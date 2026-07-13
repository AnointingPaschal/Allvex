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
    <div className="pb-8">
      <div className="px-5 pt-14 pb-4 bg-white sticky top-0 z-30 border-b border-slate-100">
        <h1 className="text-[20px] font-bold text-midnight mb-3.5">Marketplace</h1>
        <div className="flex items-center gap-2.5">
          <div className="flex-1 flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-allvex px-3.5 py-3">
            <Search size={16} className="text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search brand or model..."
              className="bg-transparent outline-none text-[13.5px] w-full placeholder:text-slate-400"
            />
          </div>
          <button className="tap w-11 h-11 rounded-allvex bg-midnight flex items-center justify-center shrink-0">
            <SlidersHorizontal size={17} className="text-white" />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar mt-3.5">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`tap shrink-0 px-4 py-2 rounded-pill text-[12.5px] font-semibold ${
                active === c ? "bg-electric text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-4 grid grid-cols-2 gap-3.5">
        {filtered.map((v) => (
          <button
            key={v.id}
            onClick={() => navigate(`/marketplace/${v.id}`)}
            className="tap bg-white rounded-allvex shadow-card overflow-hidden text-left flex flex-col"
          >
            <div className="relative">
              <VehicleArt category={v.category} className="h-28 w-full" iconSize={30} />
              <button className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center">
                <Heart size={13} className="text-midnight" />
              </button>
              {v.verified && (
                <span className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 rounded-pill px-2 py-0.5 text-[10px] font-semibold text-electric">
                  <BadgeCheck size={11} /> Verified
                </span>
              )}
            </div>
            <div className="p-3 flex-1 flex flex-col">
              <p className="font-semibold text-midnight text-[13px] truncate">{v.brand} {v.model}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{v.year} · {v.fuel} · {v.transmission}</p>
              <p className="text-[13px] font-bold text-midnight mt-1.5">₦{(v.price / 1000000).toFixed(1)}m</p>
              <p className="text-[10.5px] text-slate-400 mt-0.5">Est. landing · {v.delivery}</p>
              <button className="tap mt-2 flex items-center gap-1 text-[11px] font-semibold text-electric">
                <GitCompareArrows size={12} /> Compare
              </button>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="px-5 mt-16 text-center">
          <p className="text-slate-400 text-[13.5px]">No vehicles match your search.</p>
        </div>
      )}
    </div>
  );
}
