import { Check } from "lucide-react";

export default function StageTimeline({ stages }) {
  return (
    <div className="relative pl-1">
      {stages.map((s, i) => {
        const isLast = i === stages.length - 1;
        return (
          <div key={i} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast && (
              <div
                className={`absolute left-[11px] top-6 w-[2px] h-[calc(100%-1rem)] ${
                  s.done ? "bg-electric" : "bg-slate-200"
                }`}
              />
            )}
            <div
              className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                s.done
                  ? s.current
                    ? "bg-electric ring-4 ring-electric/20"
                    : "bg-electric"
                  : "bg-white border-2 border-slate-200"
              }`}
            >
              {s.done && !s.current && <Check size={13} className="text-white" strokeWidth={3} />}
              {s.current && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
            </div>
            <div className="pt-0.5">
              <p className={`text-[12px] leading-tight ${s.done ? "text-midnight font-semibold" : "text-slate-400 font-medium"}`}>
                {s.label}
              </p>
              <p className="text-[10.5px] text-slate-400 mt-0.5">{s.date}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
