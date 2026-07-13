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
    <div className="pb-8">
      <div className="px-5 pt-14 pb-6 bg-midnight text-white rounded-b-[28px]">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-electric flex items-center justify-center font-bold text-[20px]">AJ</div>
          <div>
            <p className="font-bold text-[16px]">Alex Johnson</p>
            <p className="text-slate-400 text-[12.5px] mt-0.5">alex.johnson@email.com</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2.5 mt-5">
          <MiniStat value="2" label="Vehicles" />
          <MiniStat value="1" label="Active Import" />
          <MiniStat value="94%" label="Avg Health" />
        </div>
      </div>

      <div className="px-5 mt-5">
        <div className="bg-white rounded-allvex shadow-card overflow-hidden">
          {menu.map((m, i) => (
            <button key={m.label} className={`tap w-full flex items-center gap-3 px-4 py-3.5 text-left ${i !== menu.length - 1 ? "border-b border-slate-100" : ""}`}>
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <m.icon size={16} className="text-midnight" />
              </div>
              <span className="flex-1 text-[13.5px] font-medium text-midnight">{m.label}</span>
              <ChevronRight size={16} className="text-slate-300" />
            </button>
          ))}
        </div>

        <button className="tap w-full flex items-center justify-center gap-2 bg-white rounded-allvex shadow-card py-3.5 mt-3.5 text-[13.5px] font-medium text-midnight">
          <Fingerprint size={16} /> Enable Biometric Login
        </button>

        <button
          onClick={() => navigate("/login")}
          className="tap w-full flex items-center justify-center gap-2 py-3.5 mt-5 text-[13.5px] font-semibold text-danger"
        >
          <LogOut size={16} /> Log Out
        </button>
      </div>
    </div>
  );
}

function MiniStat({ value, label }) {
  return (
    <div className="bg-white/10 rounded-2xl py-2.5 flex flex-col items-center">
      <p className="text-[15px] font-bold">{value}</p>
      <p className="text-[10px] text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}
