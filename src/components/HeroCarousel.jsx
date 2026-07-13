import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BadgeCheck } from "lucide-react";

export default function HeroCarousel({ vehicles }) {
  const navigate = useNavigate();
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);

  function onScroll() {
    const el = trackRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx !== active) setActive(idx);
  }

  function goTo(i) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div>
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar rounded-xl"
      >
        {vehicles.map((v) => (
          <button
            key={v.id}
            onClick={() => navigate(`/marketplace/${v.id}`)}
            className="tap relative w-full shrink-0 snap-start"
          >
            <img src={v.image} alt={`${v.brand} ${v.model}`} className="w-full h-44 sm:h-56 object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            {v.verified && (
              <span className="absolute top-3 left-3 flex items-center gap-1 bg-white/90 rounded-pill px-2 py-0.5 text-[9.5px] font-semibold text-electric">
                <BadgeCheck size={10} /> Verified
              </span>
            )}
            <div className="absolute bottom-3 left-3.5 right-3.5 flex items-end justify-between text-left">
              <div>
                <p className="text-white font-bold text-[13.5px] leading-tight">{v.brand} {v.model}</p>
                <p className="text-slate-200 text-[10.5px] mt-0.5">{v.year} · {v.fuel} · {v.delivery_estimate}</p>
              </div>
              <p className="text-white font-bold text-[13px] shrink-0">₦{(v.price / 1000000).toFixed(1)}m</p>
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-1.5 mt-2.5">
        {vehicles.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-pill transition-all ${i === active ? "w-5 bg-electric" : "w-1.5 bg-slate-300"}`}
          />
        ))}
      </div>
    </div>
  );
}
