import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Search, BadgeCheck, Check, Loader2, Truck, SlidersHorizontal, X } from "lucide-react";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";

const STEPS = ["Choose Vehicle", "Your Details", "Confirm"];
const COLORS = ["White", "Black", "Silver", "Pearl White", "Blue", "Red", "Grey", "Dark Grey", "Champagne", "Other"];
const TIMELINES = ["ASAP (within 30 days)", "1–2 months", "2–3 months", "3–6 months", "Flexible"];
const CATEGORIES = ["All", "SUV", "Sedan", "Electric", "Pickup", "Luxury"];

export default function ImportRequest() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [step, setStep] = useState(0);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  const [color, setColor] = useState("");
  const [timeline, setTimeline] = useState("");
  const [notes, setNotes] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.full_name || "");
      setPhone(profile.phone || "");
      setEmail(profile.email || "");
    }
  }, [profile]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("vehicles")
        .select("*, vehicle_images(url, category, position)")
        .eq("status", "live")
        .order("created_at", { ascending: false });

      setVehicles(
        (data || []).map((v) => {
          const imgs = (v.vehicle_images || []).sort((a, b) => a.position - b.position);
          const hero = imgs.find((i) => i.category === "exterior") || imgs[0];
          return { ...v, image: hero?.url };
        })
      );
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      const q = query.toLowerCase();
      const matchQ = !q || `${v.brand} ${v.model}`.toLowerCase().includes(q);
      const matchC = catFilter === "All" || v.category === catFilter;
      return matchQ && matchC;
    });
  }, [vehicles, query, catFilter]);

  const canNext = [
    Boolean(selected),
    name.trim() && phone.trim() && timeline,
    true,
  ];

  async function submit() {
    setSubmitting(true);
    await supabase.from("import_requests").insert({
      customer_id: profile.id,
      brand: selected.brand,
      model: selected.model,
      year: selected.year,
      color: color || null,
      fuel: selected.fuel,
      transmission: selected.transmission,
      budget: `₦${Number(selected.price).toLocaleString()}`,
      notes: notes || null,
      status: "pending",
    });
    // Also create a quote request tied to this vehicle
    await supabase.from("quote_requests").insert({
      customer_id: profile.id,
      vehicle_id: selected.id,
      full_name: name,
      phone,
      budget: `₦${Number(selected.price).toLocaleString()}`,
      status: "pending",
    });
    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-card p-8 max-w-sm w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
            <Check size={28} className="text-success" strokeWidth={2.5} />
          </div>
          <p className="text-[18px] font-bold text-midnight">Request Submitted!</p>
          <div className="bg-slate-50 rounded-xl p-3.5 text-left space-y-1.5">
            <Row label="Vehicle" value={`${selected.brand} ${selected.model} (${selected.year})`} />
            <Row label="Colour" value={color || "As available"} />
            <Row label="Timeline" value={timeline} />
            <Row label="Price" value={`₦${Number(selected.price).toLocaleString()}`} />
          </div>
          <p className="text-[13px] text-slate-400 leading-relaxed">
            An Allvex advisor will contact you within 24 hours to confirm availability and next steps.
          </p>
          <div className="flex gap-2.5">
            <button onClick={() => navigate("/import")} className="tap flex-1 py-3 rounded-xl bg-slate-100 text-midnight font-semibold text-[13px]">Track Orders</button>
            <button onClick={() => navigate("/")} className="tap flex-1 py-3 rounded-xl bg-electric text-white font-semibold text-[13px]">Go Home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-midnight text-white px-4 sm:px-6 pt-6 pb-5 shrink-0">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => step > 0 ? setStep(step - 1) : navigate(-1)}
            className="tap w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <ChevronLeft size={17} />
          </button>
          <div className="flex-1">
            <p className="font-bold text-[15px]">Import a Vehicle</p>
            <p className="text-slate-400 text-[11px] mt-0.5">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
          </div>
          <Truck size={20} className="text-electric" />
        </div>
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? "bg-electric" : "bg-white/20"}`} />
          ))}
        </div>
      </div>

      {/* ── STEP 0: Choose vehicle ── */}
      {step === 0 && (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Search + filter */}
          <div className="px-4 sm:px-6 py-3 border-b border-slate-100 space-y-2.5 shrink-0">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search brand or model…"
                className="bg-transparent outline-none text-[13px] w-full placeholder:text-slate-400" />
              {query && <button onClick={() => setQuery("")}><X size={13} className="text-slate-400" /></button>}
            </div>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {CATEGORIES.map((c) => (
                <button key={c} onClick={() => setCatFilter(c)}
                  className={`tap shrink-0 px-3 py-1.5 rounded-pill text-[11.5px] font-semibold transition ${catFilter === c ? "bg-electric text-white" : "bg-slate-100 text-slate-500"}`}>
                  {c}
                </button>
              ))}
            </div>
            {selected && (
              <div className="flex items-center gap-2 bg-success/10 border border-success/20 rounded-xl px-3 py-2">
                <Check size={13} className="text-success shrink-0" />
                <span className="text-[12.5px] font-semibold text-success flex-1 truncate">
                  Selected: {selected.brand} {selected.model}
                </span>
                <button onClick={() => setSelected(null)}><X size={13} className="text-success" /></button>
              </div>
            )}
          </div>

          {/* Vehicle grid */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 size={22} className="animate-spin text-electric" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-[13px]">No vehicles match your search.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filtered.map((v) => {
                  const isSelected = selected?.id === v.id;
                  return (
                    <button key={v.id} onClick={() => setSelected(isSelected ? null : v)}
                      className={`tap text-left rounded-2xl border-2 overflow-hidden transition ${isSelected ? "border-electric shadow-lg" : "border-slate-100 bg-white shadow-sm hover:border-slate-300"}`}>
                      <div className="relative">
                        {v.image
                          ? <img src={v.image} alt={`${v.brand} ${v.model}`} className="w-full h-36 object-cover" />
                          : <div className="w-full h-36 bg-gradient-to-br from-midnight to-slate-700" />}
                        {isSelected && (
                          <div className="absolute inset-0 bg-electric/20 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-electric flex items-center justify-center">
                              <Check size={20} className="text-white" strokeWidth={3} />
                            </div>
                          </div>
                        )}
                        {v.verified && (
                          <span className="absolute top-2 left-2 flex items-center gap-1 bg-white/90 rounded-pill px-2 py-0.5 text-[9.5px] font-semibold text-electric">
                            <BadgeCheck size={9} /> Verified
                          </span>
                        )}
                        <span className={`absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-pill ${isSelected ? "bg-electric text-white" : "bg-midnight/70 text-white"}`}>
                          {v.category}
                        </span>
                      </div>
                      <div className="p-3">
                        <p className="font-bold text-midnight text-[13.5px]">{v.brand} {v.model}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{v.year} · {v.fuel} · {v.transmission}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-[14px] font-black text-electric">₦{(v.price / 1000000).toFixed(1)}m</p>
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-pill">{v.delivery_estimate}</span>
                        </div>
                        {/* Spec pills */}
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                          {[v.specs?.hp, v.specs?.seats ? `${v.specs.seats} seats` : null, v.specs?.drive].filter(Boolean).map((s) => (
                            <span key={s} className="text-[9.5px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded">{s}</span>
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="px-4 sm:px-6 py-3 border-t border-slate-100 shrink-0">
            <button onClick={() => setStep(1)} disabled={!selected}
              className="tap w-full py-4 rounded-2xl bg-electric text-white font-bold text-[14px] flex items-center justify-center gap-2 disabled:opacity-40">
              Continue with {selected ? `${selected.brand} ${selected.model}` : "selected vehicle"} <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 1: Your details ── */}
      {step === 1 && (
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4">
          {/* Selected vehicle recap */}
          {selected && (
            <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-3.5">
              {selected.image
                ? <img src={selected.image} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                : <div className="w-14 h-14 rounded-xl bg-midnight shrink-0" />}
              <div className="min-w-0">
                <p className="font-bold text-midnight text-[13px]">{selected.brand} {selected.model} ({selected.year})</p>
                <p className="text-[11.5px] text-electric font-semibold mt-0.5">₦{Number(selected.price).toLocaleString()}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{selected.fuel} · {selected.delivery_estimate}</p>
              </div>
            </div>
          )}

          <Section title="Contact Details">
            <FInput label="Full Name *" value={name} onChange={setName} placeholder="Your full name" />
            <FInput label="Phone Number *" value={phone} onChange={setPhone} placeholder="+234 800 000 0000" type="tel" />
            <FInput label="Email" value={email} onChange={setEmail} placeholder="your@email.com" type="email" />
          </Section>

          <Section title="Preferred Colour">
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button key={c} onClick={() => setColor(color === c ? "" : c)}
                  className={`tap px-3 py-1.5 rounded-pill text-[12px] font-medium border transition ${color === c ? "border-electric bg-blue-50 text-electric" : "border-slate-200 text-slate-600 bg-white"}`}>
                  {c}
                </button>
              ))}
            </div>
          </Section>

          <Section title="When do you need it? *">
            <div className="space-y-2">
              {TIMELINES.map((t) => (
                <button key={t} onClick={() => setTimeline(t)}
                  className={`tap w-full text-left px-4 py-3 rounded-xl border text-[13px] font-medium flex items-center justify-between transition ${timeline === t ? "border-electric bg-blue-50 text-electric" : "border-slate-200 text-midnight bg-white"}`}>
                  {t}
                  {timeline === t && <Check size={14} strokeWidth={3} />}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Additional Notes">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              placeholder="Any specific requests — interior trim, accessories to include, delivery location, financing questions…"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] outline-none focus:border-electric resize-none" />
          </Section>

          <button onClick={() => setStep(2)} disabled={!canNext[1]}
            className="tap w-full py-4 rounded-2xl bg-midnight text-white font-bold text-[14px] flex items-center justify-center gap-2 disabled:opacity-40">
            Review Request <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ── STEP 2: Review & confirm ── */}
      {step === 2 && (
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4">
          {selected && (
            <div className="relative rounded-2xl overflow-hidden">
              {selected.image
                ? <img src={selected.image} alt="" className="w-full h-44 object-cover" />
                : <div className="w-full h-44 bg-midnight" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-white font-black text-[18px]">{selected.brand} {selected.model}</p>
                <p className="text-slate-300 text-[12px] mt-0.5">{selected.year} · {selected.fuel} · {selected.category}</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
            <SummaryRow label="Estimated Price" value={`₦${Number(selected?.price || 0).toLocaleString()}`} highlight />
            <SummaryRow label="Delivery Estimate" value={selected?.delivery_estimate} />
            <SummaryRow label="Preferred Colour" value={color || "As available"} />
            <SummaryRow label="Timeline" value={timeline} />
            <SummaryRow label="Contact" value={`${name} · ${phone}`} />
            {notes && <SummaryRow label="Notes" value={notes} />}
          </div>

          <div className="bg-electric/5 border border-electric/20 rounded-2xl p-4 flex gap-2.5">
            <Check size={15} className="text-electric shrink-0 mt-0.5" />
            <p className="text-[12.5px] text-slate-600 leading-relaxed">
              After submitting, an Allvex advisor will contact you within <strong>24 hours</strong> to confirm vehicle availability, discuss payment options, and kick off your import.
            </p>
          </div>

          <button onClick={submit} disabled={submitting}
            className="tap w-full py-4 rounded-2xl bg-electric text-white font-bold text-[14.5px] flex items-center justify-center gap-2 disabled:opacity-60">
            {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : <><Truck size={16} /> Submit Import Request</>}
          </button>
          <button onClick={() => setStep(1)} className="tap w-full py-2.5 text-[13px] text-slate-400 font-medium">
            ← Go back and edit
          </button>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-2.5">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{title}</p>
      {children}
    </div>
  );
}
function FInput({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="text-[11.5px] font-semibold text-slate-500 block mb-1">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type={type}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13.5px] outline-none focus:border-electric transition" />
    </div>
  );
}
function Row({ label, value }) {
  return (
    <div className="flex justify-between text-[12px]">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-midnight text-right max-w-[60%]">{value}</span>
    </div>
  );
}
function SummaryRow({ label, value, highlight }) {
  return (
    <div className="flex items-start justify-between px-4 py-3 gap-3">
      <span className="text-[12px] text-slate-400 shrink-0">{label}</span>
      <span className={`text-[12.5px] font-semibold text-right ${highlight ? "text-electric" : "text-midnight"}`}>{value || "—"}</span>
    </div>
  );
}
