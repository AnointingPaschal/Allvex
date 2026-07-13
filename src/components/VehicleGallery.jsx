import { useState } from "react";
import { ChevronLeft, Heart, Share2, BadgeCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const categories = ["All", "Exterior", "Interior", "Engine"];

export default function VehicleGallery({ photos, verified, className = "" }) {
  const navigate = useNavigate();
  const [cat, setCat] = useState("All");
  const [active, setActive] = useState(0);

  const filtered = cat === "All" ? photos : photos.filter((p) => p.category === cat);
  const current = filtered[Math.min(active, filtered.length - 1)] || photos[0];

  function selectCategory(c) {
    setCat(c);
    setActive(0);
  }

  return (
    <div className={className}>
      <div className="relative">
        <img src={current.url} alt={current.label} className="w-full h-64 lg:h-full lg:rounded-xl object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent lg:rounded-xl pointer-events-none" />

        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="tap w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
            <ChevronLeft size={16} className="text-midnight" />
          </button>
          <div className="flex gap-2">
            <button className="tap w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
              <Share2 size={13} className="text-midnight" />
            </button>
            <button className="tap w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
              <Heart size={13} className="text-midnight" />
            </button>
          </div>
        </div>

        {verified && (
          <span className="absolute bottom-14 left-3 flex items-center gap-1 bg-white rounded-pill px-2.5 py-1 text-[10px] font-semibold text-electric shadow-card">
            <BadgeCheck size={11} /> Verified by Allvex
          </span>
        )}

        <span className="absolute bottom-14 right-3 bg-black/50 text-white text-[10px] font-medium px-2 py-0.5 rounded-pill">
          {active + 1}/{filtered.length}
        </span>

        {/* Category tabs */}
        <div className="absolute bottom-3 left-3 right-3 flex gap-1.5">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => selectCategory(c)}
              className={`tap px-2.5 py-1 rounded-pill text-[10.5px] font-semibold ${
                cat === c ? "bg-white text-midnight" : "bg-black/40 text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Thumbnail strip */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 sm:px-6 lg:px-0 py-2.5 bg-white lg:bg-transparent lg:mt-2">
        {filtered.map((p, i) => (
          <button
            key={p.url + i}
            onClick={() => setActive(i)}
            className={`tap shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 ${
              i === active ? "border-electric" : "border-transparent"
            }`}
          >
            <img src={p.url} alt={p.label} className="w-full h-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  );
}
