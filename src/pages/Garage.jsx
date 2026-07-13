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
    <div>
      <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-3.5 bg-white sticky top-0 z-30 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h1 className="text-[17px] font-bold text-midnight">My Garage</h1>
          <p className="text-[11px] text-slate-400 mt-0.5">{garageVehicles.length} registered vehicles</p>
        </div>
        <button className="tap w-9 h-9 rounded-xl bg-electric flex items-center justify-center">
          <Plus size={17} className="text-white" />
        </button>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 mt-3.5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {garageVehicles.map((v) => (
          <button
            key={v.id}
            onClick={() => navigate(`/garage/${v.id}`)}
            className="tap bg-white rounded-xl shadow-card overflow-hidden text-left"
          >
            <VehicleArt category={v.brand === "BYD" ? "Electric" : "SUV"} src={v.image} className="h-24 w-full" iconSize={26} />
            <div className="p-3.5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-midnight text-[13px]">{v.nickname}</p>
                  <p className="text-[10.5px] text-slate-400 mt-0.5">{v.brand} {v.model} · {v.year}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-[14px] font-bold ${healthColor(v.health)}`}>{v.health}%</p>
                  <p className="text-[9px] text-slate-400">Health</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="bg-slate-50 rounded-lg px-2.5 py-2 flex items-center gap-1.5">
                  <Gauge size={12} className="text-electric shrink-0" />
                  <span className="text-[10px] font-medium text-midnight truncate">{v.nextService}</span>
                </div>
                <div className="bg-slate-50 rounded-lg px-2.5 py-2 flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-electric shrink-0" />
                  <span className="text-[10px] font-medium text-midnight truncate">{v.insurance}</span>
                </div>
              </div>
            </div>
          </button>
        ))}

        <button className="tap border-2 border-dashed border-slate-200 rounded-xl py-8 flex flex-col items-center gap-2 text-slate-400">
          <Plus size={18} />
          <span className="text-[12px] font-semibold">Register a vehicle</span>
        </button>
      </div>
      <div className="h-4" />
    </div>
  );
}
