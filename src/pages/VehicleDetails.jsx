import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Gauge, Zap, Users, Compass, ShieldCheck, MessageCircle, Loader2, Check } from "lucide-react";
import VehicleGallery from "../components/VehicleGallery.jsx";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [v, setV] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQuote, setShowQuote] = useState(false);
  const [quoteName, setQuoteName] = useState("");
  const [quotePhone, setQuotePhone] = useState("");
  const [quoteBudget, setQuoteBudget] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

  useEffect(() => {
    if (profile) setQuoteName(profile.full_name || "");
    if (profile) setQuotePhone(profile.phone || "");
  }, [profile]);

  async function submitQuote() {
    if (!profile || !v) return;
    setSubmitting(true);
    await supabase.from("quote_requests").insert({
      customer_id: profile.id,
      vehicle_id: v.id,
      full_name: quoteName,
      phone: quotePhone,
      budget: quoteBudget,
    });
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      setShowQuote(false);
      setSubmitted(false);
      navigate("/import");
    }, 1400);
  }

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
    <div className="pb-24 relative">
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
              <button className="tap w-full bg-white rounded-xl shadow-card p-3.5 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-electric/10 flex items-center justify-center shrink-0">
                  <MessageCircle size={15} className="text-electric" />
                </div>
                <div className="text-left">
                  <p className="text-[11.5px] font-semibold text-midnight">Chat with an Advisor</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Financing, timelines, colors</p>
                </div>
              </button>
            </Section>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-3.5 flex gap-2.5 z-40">
        <div className="page w-full flex gap-2.5 mx-auto">
          <button className="tap px-3.5 py-3 rounded-xl border border-slate-200 text-midnight font-semibold text-[12px]">
            Compare
          </button>
          <button onClick={() => setShowQuote(true)} className="tap flex-1 sm:flex-none sm:px-8 py-3 rounded-xl bg-electric text-white font-semibold text-[12.5px]">
            Import This Vehicle
          </button>
        </div>
      </div>

      {showQuote && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50" onClick={() => !submitting && setShowQuote(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white w-full sm:w-[400px] sm:rounded-xl rounded-t-[24px] p-5 pb-7">
            {submitted ? (
              <div className="py-6 flex flex-col items-center text-center">
                <div className="w-11 h-11 rounded-full bg-success/10 flex items-center justify-center mb-3">
                  <Check size={20} className="text-success" />
                </div>
                <p className="text-[13.5px] font-bold text-midnight">Request submitted</p>
                <p className="text-[11.5px] text-slate-400 mt-1">An advisor will reach out within 24 hours.</p>
              </div>
            ) : (
              <>
                <div className="w-8 h-1 bg-slate-200 rounded-pill mx-auto mb-4 sm:hidden" />
                <h3 className="text-[14.5px] font-bold text-midnight mb-1">Request a Quote</h3>
                <p className="text-[11px] text-slate-400 mb-4">An advisor will reach out within 24 hours.</p>
                <div className="flex flex-col gap-2.5">
                  <input value={quoteName} onChange={(e) => setQuoteName(e.target.value)} placeholder="Full name" className="bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 text-[12.5px] outline-none" />
                  <input value={quotePhone} onChange={(e) => setQuotePhone(e.target.value)} placeholder="Phone number" className="bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 text-[12.5px] outline-none" />
                  <input value={quoteBudget} onChange={(e) => setQuoteBudget(e.target.value)} placeholder="Budget (optional)" className="bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 text-[12.5px] outline-none" />
                  <button
                    onClick={submitQuote}
                    disabled={submitting}
                    className="tap w-full py-3 rounded-xl bg-electric text-white font-semibold text-[13px] mt-1.5 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {submitting && <Loader2 size={14} className="animate-spin" />}
                    {submitting ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
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
