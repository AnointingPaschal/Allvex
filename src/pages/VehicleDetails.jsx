import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Gauge, Zap, Users, Compass, ShieldCheck, MessageCircle, Loader2, Check } from "lucide-react";
import VehicleGallery from "../components/VehicleGallery.jsx";
import QuoteForm from "../components/QuoteForm.jsx";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [v, setV] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  async function startChat() {
    if (!profile) return;
    // Find or create a chat for this vehicle
    const { data: existing } = await supabase
      .from("advisor_chats")
      .select("id")
      .eq("customer_id", profile.id)
      .eq("vehicle_id", v.id)
      .eq("status", "open")
      .limit(1);

    if (existing?.length > 0) {
      navigate("/chat");
      return;
    }

    await supabase.from("advisor_chats").insert({
      customer_id: profile.id,
      vehicle_id: v.id,
      vehicle_label: `${v.brand} ${v.model}`,
      subject: `Enquiry — ${v.brand} ${v.model} (${v.year})`,
      status: "open",
    });
    navigate("/chat");
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("vehicles")
        .select("*, vehicle_images(url,category,label,position)")
        .eq("id", id)
        .single();
      setV(data);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={22} className="animate-spin text-electric" />
      </div>
    );
  }

  if (!v) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-center px-6">
        <p className="text-[13px] text-slate-400">Vehicle not found.</p>
      </div>
    );
  }

  const gallery = (v.vehicle_images || [])
    .sort((a, b) => a.position - b.position)
    .map((img) => ({ ...img, category: img.category.charAt(0).toUpperCase() + img.category.slice(1) }));

  return (
    <div className="pb-36 relative">
      <div className="lg:grid lg:grid-cols-5 lg:gap-6 lg:px-8 lg:pt-6">
        <div className="lg:col-span-2 relative">
          <VehicleGallery photos={gallery} verified={v.verified} />
        </div>

        <div className="lg:col-span-3 px-4 sm:px-6 lg:px-0 -mt-2 lg:mt-0 relative">
          <div className="bg-white rounded-xl shadow-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[16px] font-bold text-midnight">{v.brand} {v.model}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{v.year} · {v.condition} · {v.fuel}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400">Allvex Score</p>
                <p className="text-[15px] font-bold text-success">{v.score}<span className="text-[10px] text-slate-400">/100</span></p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mt-3.5">
              <Spec icon={Gauge} label={v.specs.hp} />
              <Spec icon={Zap} label={v.specs.range !== "—" ? v.specs.range : v.specs.engine} />
              <Spec icon={Users} label={`${v.specs.seats} seats`} />
              <Spec icon={Compass} label={v.specs.drive} />
            </div>

            <div className="mt-3.5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10.5px] text-slate-400">Estimated Landing Cost</p>
                <p className="text-[16px] font-bold text-midnight">₦{Number(v.price).toLocaleString()}</p>
              </div>
              <p className="text-[10.5px] text-electric font-semibold bg-electric/10 px-2.5 py-1 rounded-pill">{v.delivery_estimate}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-5">
            <Section title="Ownership Estimate">
              <div className="grid grid-cols-3 gap-2">
                <MiniStat label="Insurance/yr" value={`₦${(v.ownership.insurance / 1000).toFixed(0)}k`} />
                <MiniStat label="Maintenance/yr" value={`₦${(v.ownership.maintenance / 1000).toFixed(0)}k`} />
                <MiniStat label="Running/mo" value={`₦${(v.ownership.running / 1000).toFixed(0)}k`} />
              </div>
            </Section>

            <Section title="Performance">
              <div className="bg-white rounded-xl shadow-card divide-y divide-slate-100">
                <Row label="0–100 km/h" value={v.performance.accel} />
                <Row label="Top Speed" value={v.performance.topSpeed} />
                {v.performance.charge !== "—" && <Row label="Fast Charge" value={v.performance.charge} />}
              </div>
            </Section>
          </div>

          <Section title="Key Features">
            <div className="flex flex-wrap gap-1.5">
              {(v.features || []).map((f) => (
                <span key={f} className="text-[10.5px] font-medium text-midnight bg-slate-100 px-2.5 py-1 rounded-pill">{f}</span>
              ))}
            </div>
          </Section>

          <div className="grid sm:grid-cols-2 gap-4">
            <Section title="Inspection">
              <div className="bg-white rounded-xl shadow-card p-3.5 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                  <ShieldCheck size={16} className="text-success" />
                </div>
                <div>
                  <p className="text-[11.5px] font-semibold text-midnight">
                    {v.status === "live" ? "Passed · VIN Verified" : "Inspection Pending"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Exterior, interior, battery checked</p>
                </div>
              </div>
            </Section>

            <Section title="Have questions?">
              <button onClick={startChat} className="tap w-full bg-white rounded-xl shadow-card p-3.5 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-electric/10 flex items-center justify-center shrink-0">
                  <MessageCircle size={15} className="text-electric" />
                </div>
                <div className="text-left">
                  <p className="text-[11.5px] font-semibold text-midnight">Chat with an Advisor</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Financing, timelines, colors — live reply</p>
                </div>
              </button>
            </Section>
          </div>
        </div>
      </div>

      <div className="fixed bottom-[62px] left-0 right-0 bg-white border-t border-slate-100 p-3 flex gap-2.5 z-40 shadow-[0_-4px_16px_rgba(15,23,42,0.08)]">
        <div className="page w-full flex gap-2.5 mx-auto">
          <button onClick={startChat} className="tap px-3.5 py-3 rounded-xl border border-slate-200 text-midnight font-semibold text-[12px] flex items-center gap-1.5">
            <MessageCircle size={14} /> Chat
          </button>
          <button onClick={() => setShowQuoteForm(true)} className="tap flex-1 sm:flex-none sm:px-8 py-3 rounded-xl bg-electric text-white font-semibold text-[12.5px]">
            Import This Vehicle
          </button>
        </div>
      </div>

      {showQuoteForm && (
        <QuoteForm
          vehicle={v}
          onClose={() => setShowQuoteForm(false)}
          onOpenChat={() => { setShowQuoteForm(false); navigate("/chat"); }}
        />
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mt-5">
      <h2 className="text-[12.5px] font-bold text-midnight mb-2.5">{title}</h2>
      {children}
    </div>
  );
}
function Spec({ icon: Icon, label }) {
  return (
    <div className="bg-slate-50 rounded-lg py-2 flex flex-col items-center gap-1">
      <Icon size={13} className="text-electric" />
      <span className="text-[9px] font-semibold text-midnight text-center leading-tight px-1">{label}</span>
    </div>
  );
}
function MiniStat({ label, value }) {
  return (
    <div className="bg-white rounded-xl shadow-card py-3 flex flex-col items-center">
      <p className="text-[12px] font-bold text-midnight">{value}</p>
      <p className="text-[9px] text-slate-400 mt-0.5 text-center px-1">{label}</p>
    </div>
  );
}
function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between px-3.5 py-2.5">
      <span className="text-[11px] text-slate-400">{label}</span>
      <span className="text-[11.5px] font-semibold text-midnight">{value}</span>
    </div>
  );
}
