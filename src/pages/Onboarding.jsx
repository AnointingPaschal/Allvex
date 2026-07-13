import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wrench, Bot, ChevronRight, Car } from "lucide-react";

const slides = [
  {
    icon: Car,
    title: "Welcome to Allvex",
    text: "Import, own and manage your vehicle with confidence.",
  },
  {
    icon: Wrench,
    title: "Everything About Your Car, In One Place",
    text: "Track service history, insurance, warranty and maintenance in the Garage.",
  },
  {
    icon: Bot,
    title: "Meet Your Automotive Assistant",
    text: "Ask questions, compare vehicles, track imports and get reminders.",
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const slide = slides[step];
  const Icon = slide.icon;
  const isLast = step === slides.length - 1;

  return (
    <div className="flex flex-col h-full min-h-screen bg-midnight text-white px-6 pt-16 pb-10">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 rounded-allvex bg-white/10 flex items-center justify-center mb-10">
          <Icon size={44} strokeWidth={1.5} className="text-electric" />
        </div>
        <h1 className="text-2xl font-bold leading-snug mb-3">{slide.title}</h1>
        <p className="text-slate-300 text-[15px] leading-relaxed max-w-xs">{slide.text}</p>
      </div>

      <div className="flex justify-center gap-2 mb-8">
        {slides.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-pill transition-all ${i === step ? "w-6 bg-electric" : "w-1.5 bg-white/20"}`} />
        ))}
      </div>

      <div className="flex items-center gap-3">
        {!isLast && (
          <button
            onClick={() => navigate("/login")}
            className="tap flex-1 py-3.5 rounded-allvex text-slate-300 font-medium text-[14px]"
          >
            Skip
          </button>
        )}
        <button
          onClick={() => (isLast ? navigate("/login") : setStep(step + 1))}
          className="tap flex-[2] py-3.5 rounded-allvex bg-electric text-white font-semibold text-[15px] flex items-center justify-center gap-2"
        >
          {isLast ? "Get Started" : "Next"}
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
