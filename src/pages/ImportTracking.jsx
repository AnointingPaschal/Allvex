import TopBar from "../components/TopBar.jsx";
import StageTimeline from "../components/StageTimeline.jsx";
import VehicleArt from "../components/VehicleArt.jsx";
import { activeImport, importTimeline } from "../data/mock.js";
import { FileText, MessageSquare, Wallet } from "lucide-react";

export default function ImportTracking() {
  return (
    <div className="pb-10">
      <TopBar title="Import Tracking" />
      <div className="px-5 pt-2">
        <div className="bg-midnight rounded-allvex p-4 flex gap-3.5 items-center">
          <VehicleArt category="Electric" className="w-16 h-16 rounded-2xl shrink-0" iconSize={26} />
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-[14px] truncate">{activeImport.vehicle}</p>
            <p className="text-slate-400 text-[12px] mt-0.5">Order #ALX-20394</p>
            <div className="h-1.5 bg-white/10 rounded-pill mt-2.5 overflow-hidden">
              <div className="h-full bg-electric rounded-pill" style={{ width: `${activeImport.progress}%` }} />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">{activeImport.progress}% · ETA {activeImport.eta}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5 mt-4">
          <QuickBtn icon={FileText} label="Documents" />
          <QuickBtn icon={MessageSquare} label="Messages" />
          <QuickBtn icon={Wallet} label="Payments" />
        </div>

        <h2 className="text-[14.5px] font-bold text-midnight mt-6 mb-4">Shipment Timeline</h2>
        <div className="bg-white rounded-allvex shadow-card p-5">
          <StageTimeline stages={importTimeline} />
        </div>

        <div className="mt-5 bg-amber-50 rounded-allvex p-4">
          <p className="text-[12.5px] font-semibold text-warning">No delays reported</p>
          <p className="text-[11.5px] text-slate-500 mt-1">Your vehicle is on schedule. We'll notify you the moment its status changes.</p>
        </div>
      </div>
    </div>
  );
}

function QuickBtn({ icon: Icon, label }) {
  return (
    <button className="tap bg-white rounded-allvex shadow-card py-3.5 flex flex-col items-center gap-1.5">
      <Icon size={17} className="text-electric" />
      <span className="text-[11px] font-semibold text-midnight">{label}</span>
    </button>
  );
}
