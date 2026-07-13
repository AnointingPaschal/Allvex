import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Heart, Share2, BadgeCheck, Gauge, Zap, Users, Compass, ShieldCheck, MessageCircle, ChevronLeft } from "lucide-react";
import VehicleArt from "../components/VehicleArt.jsx";
import { vehicles } from "../data/mock.js";

export default function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showQuote, setShowQuote] = useState(false);
  const v = vehicles.find((x) => x.id === id) || vehicles[0];

  return (
    <div className="pb-32 relative">
      <div className="relative">
        <VehicleArt category={v.category} className="h-64 w-full" iconSize={64} />
        <div className="absolute top-14 left-4 right-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="tap w-9 h-9 rounded-full bg-white/90 flex items-center justify-center">
            <ChevronLeft size={19} className="text-midnight" />
          </button>
          <div className="flex gap-2">
            <button className="tap w-9 h-9 rounded-full bg-white/90 flex items-center justify-center">
              <Share2 size={16} className="text-midnight" />
            </button>
            <button className="tap w-9 h-9 rounded-full bg-white/90 flex items-center justify-center">
              <Heart size={16} className="text-midnight" />
            </button>
          </div>
        </div>
        {v.verified && (
          <span className="absolute bottom-4 left-4 flex items-center gap-1 bg-white rounded-pill px-3 py-1 text-[11px] font-semibold text-electric shadow-card">
            <BadgeCheck size={13} /> Verified by Allvex
          </span>
        )}
      </div>

      <div className="px-5 -mt-5 relative">
        <div className="bg-white rounded-allvex shadow-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[19px] font-bold text-midnight">{v.brand} {v.model}</p>
              <p className="text-[12.5px] text-slate-400 mt-0.5">{v.year} · {v.condition} · {v.fuel}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-slate-400">Allvex Score</p>
              <p className="text-[17px] font-bold text-success">{v.score}<span className="text-[11px] text-slate-400">/100</span></p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 mt-4">
            <Spec icon={Gauge} label={v.specs.hp} />
            <Spec icon={Zap} label={v.specs.range !== "—" ? v.specs.range : v.specs.engine} small />
            <Spec icon={Users} label={`${v.specs.seats} seats`} />
            <Spec icon={Compass} label={v.specs.drive} />
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[11.5px] text-slate-400">Estimated Landing Cost</p>
              <p className="text-[19px] font-bold text-midnight">₦{v.price.toLocaleString()}</p>
            </div>
            <p className="text-[11.5px] text-electric font-semibold bg-electric/10 px-3 py-1.5 rounded-pill">{v.delivery}</p>
          </div>
        </div>

        {/* Ownership estimate */}
        <Section title="Ownership Estimate">
          <div className="grid grid-cols-3 gap-2.5">
            <MiniStat label="Insurance/yr" value={`₦${(v.ownership.insurance / 1000).toFixed(0)}k`} />
            <MiniStat label="Maintenance/yr" value={`₦${(v.ownership.maintenance / 1000).toFixed(0)}k`} />
            <MiniStat label="Running/mo" value={`₦${(v.ownership.running / 1000).toFixed(0)}k`} />
          </div>
        </Section>

        {/* Features */}
        <Section title="Key Features">
          <div className="flex flex-wrap gap-2">
            {v.features.map((f) => (
              <span key={f} className="text-[12px] font-medium text-midnight bg-slate-100 px-3 py-1.5 rounded-pill">{f}</span>
            ))}
          </div>
        </Section>

        {/* Performance */}
        <Section title="Performance">
          <div className="bg-white rounded-allvex shadow-card divide-y divide-slate-100">
            <Row label="0–100 km/h" value={v.performance.accel} />
            <Row label="Top Speed" value={v.performance.topSpeed} />
            {v.performance.charge !== "—" && <Row label="Fast Charge" value={v.performance.charge} />}
          </div>
        </Section>

        {/* Inspection */}
        <Section title="Inspection">
          <div className="bg-white rounded-allvex shadow-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
              <ShieldCheck size={19} className="text-success" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-midnight">Passed · VIN Verified</p>
              <p className="text-[11.5px] text-slate-400 mt-0.5">Exterior, interior, battery & electronics checked</p>
            </div>
          </div>
        </Section>

        {/* Advisor chat */}
        <Section title="Have questions?">
          <button className="tap w-full bg-white rounded-allvex shadow-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-electric/10 flex items-center justify-center shrink-0">
              <MessageCircle size={18} className="text-electric" />
            </div>
            <div className="text-left">
              <p className="text-[13px] font-semibold text-midnight">Chat with an Import Advisor</p>
              <p className="text-[11.5px] text-slate-400 mt-0.5">Ask about financing, timelines or colors</p>
            </div>
          </button>
        </Section>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-white border-t border-slate-100 p-4 flex gap-3">
        <button className="tap px-4 py-3.5 rounded-allvex border border-slate-200 text-midnight font-semibold text-[13.5px]">
          Compare
        </button>
        <button onClick={() => setShowQuote(true)} className="tap flex-1 py-3.5 rounded-allvex bg-electric text-white font-semibold text-[14.5px]">
          Import This Vehicle
        </button>
      </div>

      {showQuote && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50 max-w-[430px] mx-auto" onClick={() => setShowQuote(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white w-full rounded-t-[28px] p-6 pb-8">
            <div className="w-10 h-1 bg-slate-200 rounded-pill mx-auto mb-5" />
            <h3 className="text-[16px] font-bold text-midnight mb-1">Request a Quote</h3>
            <p className="text-[12.5px] text-slate-400 mb-5">An advisor will reach out within 24 hours.</p>
            <div className="flex flex-col gap-3">
              <input placeholder="Full name" className="bg-slate-50 border border-slate-100 rounded-allvex px-4 py-3 text-[13.5px] outline-none" />
              <input placeholder="Phone number" className="bg-slate-50 border border-slate-100 rounded-allvex px-4 py-3 text-[13.5px] outline-none" />
              <input placeholder="Budget (optional)" className="bg-slate-50 border border-slate-100 rounded-allvex px-4 py-3 text-[13.5px] outline-none" />
              <button onClick={() => { setShowQuote(false); navigate("/import"); }} className="tap w-full py-3.5 rounded-allvex bg-electric text-white font-semibold text-[14.5px] mt-2">
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mt-6">
      <h2 className="text-[14.5px] font-bold text-midnight mb-3">{title}</h2>
      {children}
    </div>
  );
}
function Spec({ icon: Icon, label }) {
  return (
    <div className="bg-slate-50 rounded-xl py-2.5 flex flex-col items-center gap-1">
      <Icon size={15} className="text-electric" />
      <span className="text-[10px] font-semibold text-midnight text-center leading-tight px-1">{label}</span>
    </div>
  );
}
function MiniStat({ label, value }) {
  return (
    <div className="bg-white rounded-allvex shadow-card py-3.5 flex flex-col items-center">
      <p className="text-[13.5px] font-bold text-midnight">{value}</p>
      <p className="text-[10px] text-slate-400 mt-0.5 text-center px-1">{label}</p>
    </div>
  );
}
function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-[12.5px] text-slate-400">{label}</span>
      <span className="text-[13px] font-semibold text-midnight">{value}</span>
    </div>
  );
}
