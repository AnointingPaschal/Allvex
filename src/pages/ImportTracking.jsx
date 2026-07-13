import TopBar from "../components/TopBar.jsx";
import StageTimeline from "../components/StageTimeline.jsx";
import VehicleArt from "../components/VehicleArt.jsx";
import { activeImport, importTimeline } from "../data/mock.js";
import { FileText, MessageSquare, Wallet } from "lucide-react";

export default function ImportTracking() {
  return (
    <div className="pb-6">
      <TopBar title="Import Tracking" />
      <div className="px-4 sm:px-6 lg:px-8 pt-2 lg:grid lg:grid-cols-2 lg:gap-6">
        <div>
          <div className="bg-midnight rounded-xl p-3.5 flex gap-3 items-center">
            <VehicleArt category="Electric" src={activeImport.image} className="w-14 h-14 rounded-lg shrink-0" iconSize={22} />
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-[12.5px] truncate">{activeImport.vehicle}</p>
              <p className="text-slate-400 text-[10.5px] mt-0.5">Order #ALX-20394</p>
              <div className="h-1.5 bg-white/10 rounded-pill mt-2 overflow-hidden">
                <div className="h-full bg-electric rounded-pill" style={{ width: `${activeImport.progress}%` }} />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">{activeImport.progress}% · ETA {activeImport.eta}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3.5">
            <QuickBtn icon={FileText} label="Documents" />
            <QuickBtn icon={MessageSquare} label="Messages" />
            <QuickBtn icon={Wallet} label="Payments" />
          </div>

          <div className="mt-4 bg-amber-50 rounded-xl p-3.5">
            <p className="text-[11.5px] font-semibold text-warning">No delays reported</p>
            <p className="text-[10.5px] text-slate-500 mt-1">Your vehicle is on schedule. We'll notify you the moment its status changes.</p>
          </div>
        </div>

        <div>
          <h2 className="text-[13px] font-bold text-midnight mt-5 lg:mt-0 mb-3">Shipment Timeline</h2>
          <div className="bg-white rounded-xl shadow-card p-4">
            <StageTimeline stages={importTimeline} />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickBtn({ icon: Icon, label }) {
  return (
    <button className="tap bg-white rounded-xl shadow-card py-3 flex flex-col items-center gap-1">
      <Icon size={15} className="text-electric" />
      <span className="text-[10px] font-semibold text-midnight">{label}</span>
    </button>
  );
}
