import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export default function TopBar({ title, right = null, transparent = false }) {
  const navigate = useNavigate();
  return (
    <div className={`sticky top-0 z-30 flex items-center justify-between px-4 py-4 ${
      transparent ? "bg-transparent" : "bg-white/90 backdrop-blur border-b border-slate-100"
    }`}>
      <button onClick={() => navigate(-1)} className="tap w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
        <ChevronLeft size={20} className="text-midnight" />
      </button>
      <h1 className="text-[15px] font-semibold text-midnight truncate max-w-[60%]">{title}</h1>
      <div className="w-9 h-9 flex items-center justify-center">{right}</div>
    </div>
  );
}
