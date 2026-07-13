import { useNavigate } from "react-router-dom";
import { Shield, Truck, ClipboardCheck, Headset, Smartphone, ChevronRight } from "lucide-react";

const roles = [
  { key: "/admin", icon: Shield, label: "Administrator", desc: "Manage customers, imports, suppliers, vehicles, content and inspectors." },
  { key: "/supplier", icon: Truck, label: "Supplier Portal", desc: "Upload vehicles, confirm orders, update shipment status, respond to quotes." },
  { key: "/inspector", icon: ClipboardCheck, label: "Inspector Portal", desc: "View assigned inspections and submit vehicle inspection reports." },
  { key: "/support", icon: Headset, label: "Customer Support", desc: "Manage tickets, look up customers, track orders on their behalf." },
];

export default function PortalHub() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#EDF0F4] flex items-center justify-center px-6 py-16">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-10">
          <div className="w-12 h-12 rounded-2xl bg-midnight flex items-center justify-center mx-auto mb-5">
            <span className="text-white font-extrabold text-lg">A</span>
          </div>
          <h1 className="text-[24px] font-bold text-midnight">Allvex Staff Portals</h1>
          <p className="text-[13.5px] text-slate-400 mt-1.5">Choose a workspace to continue.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {roles.map((r) => (
            <button
              key={r.key}
              onClick={() => navigate(r.key)}
              className="tap bg-white rounded-allvex shadow-card p-5 text-left flex flex-col gap-3"
            >
              <div className="w-11 h-11 rounded-xl bg-electric/10 flex items-center justify-center">
                <r.icon size={20} className="text-electric" />
              </div>
              <div>
                <p className="font-semibold text-midnight text-[14.5px]">{r.label}</p>
                <p className="text-[12px] text-slate-400 mt-1 leading-snug">{r.desc}</p>
              </div>
              <span className="flex items-center gap-1 text-electric text-[12.5px] font-semibold mt-1">
                Enter <ChevronRight size={13} />
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={() => navigate("/")}
          className="tap w-full flex items-center justify-center gap-2 mt-6 text-[13px] font-semibold text-slate-400"
        >
          <Smartphone size={15} /> Go to Customer App
        </button>
      </div>
    </div>
  );
}
