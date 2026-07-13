import { useNavigate } from "react-router-dom";
import {
  User, Bell, ShieldCheck, CreditCard, HelpCircle, Gift, Settings,
  ChevronRight, LogOut, Fingerprint,
} from "lucide-react";

const menu = [
  { icon: User, label: "Personal Information" },
  { icon: Bell, label: "Notifications" },
  { icon: ShieldCheck, label: "Security & Privacy" },
  { icon: CreditCard, label: "Payment Methods" },
  { icon: Gift, label: "Referral Program" },
  { icon: HelpCircle, label: "Customer Support" },
  { icon: Settings, label: "Settings" },
];

export default function Profile() {
  const navigate = useNavigate();
  return (
    <div>
      <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-5 bg-midnight text-white rounded-b-[24px]">
        <div className="flex items-center gap-3">
          <div className="w-[52px] h-[52px] rounded-full bg-electric flex items-center justify-center font-bold text-[16px]">AJ</div>
          <div>
            <p className="font-bold text-[14px]">Alex Johnson</p>
            <p className="text-slate-400 text-[11px] mt-0.5">alex.johnson@email.com</p>
          </div>
        </div>
        <div className="grid grid-cols-3 sm:max-w-sm gap-2 mt-4">
          <MiniStat value="2" label="Vehicles" />
          <MiniStat value="1" label="Active Import" />
          <MiniStat value="94%" label="Avg Health" />
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 mt-4 sm:max-w-xl">
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          {menu.map((m, i) => (
            <button key={m.label} className={`tap w-full flex items-center gap-2.5 px-3.5 py-3 text-left ${i !== menu.length - 1 ? "border-b border-slate-100" : ""}`}>
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <m.icon size={14} className="text-midnight" />
              </div>
              <span className="flex-1 text-[12.5px] font-medium text-midnight">{m.label}</span>
              <ChevronRight size={14} className="text-slate-300" />
            </button>
          ))}
        </div>

        <button className="tap w-full flex items-center justify-center gap-2 bg-white rounded-xl shadow-card py-3 mt-3 text-[12.5px] font-medium text-midnight">
          <Fingerprint size={14} /> Enable Biometric Login
        </button>

        <button
          onClick={() => navigate("/login")}
          className="tap w-full flex items-center justify-center gap-2 py-3 mt-4 text-[12.5px] font-semibold text-danger"
        >
          <LogOut size={14} /> Log Out
        </button>
      </div>
      <div className="h-4" />
    </div>
  );
}

function MiniStat({ value, label }) {
  return (
    <div className="bg-white/10 rounded-xl py-2 flex flex-col items-center">
      <p className="text-[13px] font-bold">{value}</p>
      <p className="text-[9px] text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}
