import { useNavigate } from "react-router-dom";
import { Plus, Gauge, ShieldCheck } from "lucide-react";
import VehicleArt from "../components/VehicleArt.jsx";
import { garageVehicles } from "../data/mock.js";

function healthColor(h) {
  if (h >= 85) return "text-success";
  if (h >= 60) return "text-warning";
  return "text-danger";
}

export default function Garage() {
  const navigate = useNavigate();
  return (
    <div className="pb-8">
      <div className="px-5 pt-14 pb-4 bg-white sticky top-0 z-30 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-midnight">My Garage</h1>
          <p className="text-[12.5px] text-slate-400 mt-0.5">{garageVehicles.length} registered vehicles</p>
        </div>
        <button className="tap w-11 h-11 rounded-allvex bg-electric flex items-center justify-center">
          <Plus size={20} className="text-white" />
        </button>
      </div>

      <div className="px-5 mt-4 flex flex-col gap-3.5">
        {garageVehicles.map((v) => (
          <button
            key={v.id}
            onClick={() => navigate(`/garage/${v.id}`)}
            className="tap bg-white rounded-allvex shadow-card overflow-hidden text-left"
          >
            <VehicleArt category={v.brand === "BYD" ? "Electric" : "SUV"} className="h-32 w-full" iconSize={34} />
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-midnight text-[15px]">{v.nickname}</p>
                  <p className="text-[12px] text-slate-400 mt-0.5">{v.brand} {v.model} · {v.year} · {v.color}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-[16px] font-bold ${healthColor(v.health)}`}>{v.health}%</p>
                  <p className="text-[10px] text-slate-400">Health</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 mt-3.5">
                <div className="bg-slate-50 rounded-xl px-3 py-2.5 flex items-center gap-2">
                  <Gauge size={14} className="text-electric shrink-0" />
                  <span className="text-[11.5px] font-medium text-midnight truncate">{v.nextService}</span>
                </div>
                <div className="bg-slate-50 rounded-xl px-3 py-2.5 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-electric shrink-0" />
                  <span className="text-[11.5px] font-medium text-midnight truncate">{v.insurance}</span>
                </div>
              </div>
            </div>
          </button>
        ))}

        <button className="tap w-full border-2 border-dashed border-slate-200 rounded-allvex py-6 flex flex-col items-center gap-2 text-slate-400">
          <Plus size={20} />
          <span className="text-[13px] font-semibold">Register a vehicle</span>
        </button>
      </div>
    </div>
  );
}
