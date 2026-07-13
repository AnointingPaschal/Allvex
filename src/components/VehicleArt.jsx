import { Car, Zap } from "lucide-react";

const gradients = {
  Electric: "from-[#0F172A] via-[#1E3A8A] to-[#2563EB]",
  SUV: "from-[#0F172A] via-[#1E293B] to-[#334155]",
  Sedan: "from-[#0F172A] via-[#1E3A5F] to-[#2563EB]",
  default: "from-[#0F172A] via-[#1E293B] to-[#2563EB]",
};

export default function VehicleArt({ category = "default", className = "", iconSize = 56 }) {
  const grad = gradients[category] || gradients.default;
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${grad} ${className}`}>
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: "radial-gradient(circle at 30% 20%, white 0%, transparent 40%)"
      }} />
      <div className="absolute inset-0 flex items-center justify-center">
        {category === "Electric"
          ? <Zap size={iconSize} className="text-white/90" strokeWidth={1.5} />
          : <Car size={iconSize} className="text-white/90" strokeWidth={1.5} />}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent" />
    </div>
  );
}
