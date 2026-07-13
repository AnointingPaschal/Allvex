import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export default function TopBar({ title, right = null, transparent = false }) {
  const navigate = useNavigate();
  return (
    <div className={`sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 ${
      transparent ? "bg-transparent" : "bg-white/90 backdrop-blur border-b border-slate-100"
    }`}>
      <button onClick={() => navigate(-1)} className="tap w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
        <ChevronLeft size={17} className="text-midnight" />
      </button>
      <h1 className="text-[13.5px] font-semibold text-midnight truncate max-w-[60%]">{title}</h1>
      <div className="w-8 h-8 flex items-center justify-center">{right}</div>
    </div>
  );
}
