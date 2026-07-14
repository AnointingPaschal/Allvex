import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, Check, Loader2, User, Phone, MapPin, Banknote, Calendar, Car, MessageSquare } from "lucide-react";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const STEPS = [
  { id: "contact",     label: "Your Details",   icon: User },
  { id: "preferences", label: "Preferences",    icon: Banknote },
  { id: "notes",       label: "Confirm & Send", icon: MessageSquare },
];

const BUDGETS = ["Under ₦15m", "₦15m – ₦25m", "₦25m – ₦35m", "₦35m – ₦50m", "Over ₦50m", "Flexible"];
const TIMELINES = ["ASAP (within 30 days)", "1–2 months", "2–3 months", "3–6 months", "Flexible"];
const PAY_OPTIONS = ["Full cash payment", "Instalment plan (50% deposit)", "Bank financing", "Not decided yet"];
const COLORS = ["White", "Black", "Silver", "Blue", "Red", "Grey", "Other"];

export default function QuoteForm({ vehicle, onClose, onOpenChat }) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    // Contact
    name: "", phone: "", email: "", city: "",
    // Vehicle spec
    color: "", year_pref: "", condition: "New", specific_trim: "",
    // Preferences
    budget: "", timeline: "", payment: "", finance_interest: false, trade_in: false, trade_in_detail: "",
    // Notes
    notes: "", hear_about: "",
  });

  useEffect(() => {
    if (profile) {
      setForm((f) => ({
        ...f,
        name: profile.full_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
      }));
    }
  }, [profile]);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  const canNext = [
    form.name.trim() && form.phone.trim(),       // step 0
    form.budget && form.timeline && form.payment,  // step 1
    true,                                          // step 2
  ];

  async function submit() {
    setSubmitting(true);
    const { data } = await supabase.from("quote_requests").insert({
      customer_id: profile.id,
      vehicle_id: vehicle?.id,
      full_name: form.name,
      phone: form.phone,
      budget: form.budget,
      status: "pending",
    }).select().single();

    // Also create a chat thread so the advisor can respond in real-time
    if (data && profile) {
      await supabase.from("advisor_chats").insert({
        customer_id: profile.id,
        vehicle_id: vehicle?.id,
        vehicle_label: vehicle ? `${vehicle.brand} ${vehicle.model}` : null,
        subject: `Quote request — ${vehicle ? `${vehicle.brand} ${vehicle.model}` : "vehicle"}`,
        status: "open",
      });
    }

    setSubmitting(false);
    setSubmitted(true);
  }

  const CurrentIcon = STEPS[step].icon;

  if (submitted) {
    return (
      <ModalShell onClose={onClose}>
        <div className="flex flex-col items-center text-center py-4 space-y-4">
          <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center">
            <Check size={26} className="text-success" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[17px] font-bold text-midnight">Request submitted!</p>
            <p className="text-[13px] text-slate-400 mt-1 max-w-[260px] mx-auto leading-relaxed">
              Your quote request is in. An Allvex advisor will reach out within <strong>24 hours</strong>.
            </p>
          </div>
          <div className="w-full space-y-2.5 pt-2">
            <button onClick={() => { onClose(); navigate("/chat"); }}
              className="tap w-full py-3.5 rounded-xl bg-electric text-white font-bold text-[13.5px]">
              Open Chat with Advisor
            </button>
            <button onClick={onClose}
              className="tap w-full py-3 rounded-xl bg-slate-100 text-midnight font-semibold text-[13px]">
              Close
            </button>
          </div>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[16px] font-bold text-midnight">Request a Quote</p>
          {vehicle && (
            <p className="text-[11.5px] text-slate-400 mt-0.5">{vehicle.brand} {vehicle.model} · {vehicle.year}</p>
          )}
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
          <X size={15} className="text-slate-500" />
        </button>
      </div>

      {/* Step pills */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto no-scrollbar">
        {STEPS.map((s, i) => (
          <div key={s.id} className={`flex items-center gap-1 px-2.5 py-1 rounded-pill text-[10.5px] font-semibold shrink-0 ${
            i === step ? "bg-electric text-white" : i < step ? "bg-success/10 text-success" : "bg-slate-100 text-slate-400"
          }`}>
            {i < step ? <Check size={10} strokeWidth={3} /> : <s.icon size={10} />}
            {s.label}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="space-y-3 min-h-[220px]">
        {/* Step 0 — Contact */}
        {step === 0 && (
          <>
            <Label>Full name *</Label>
            <QInput value={form.name} onChange={(v) => set("name", v)} placeholder="Your full name" icon={<User size={14} className="text-slate-400" />} />
            <Label>Phone number *</Label>
            <QInput value={form.phone} onChange={(v) => set("phone", v)} placeholder="+234 800 000 0000" type="tel" icon={<Phone size={14} className="text-slate-400" />} />
            <Label>Email</Label>
            <QInput value={form.email} onChange={(v) => set("email", v)} placeholder="your@email.com" type="email" />
            <Label>City / State</Label>
            <QInput value={form.city} onChange={(v) => set("city", v)} placeholder="e.g. Lagos, Abuja" icon={<MapPin size={14} className="text-slate-400" />} />
          </>
        )}

        {/* Step 1 — Preferences */}
        {step === 1 && (
          <>
            <Label>Budget range *</Label>
            <div className="space-y-1.5">
              {BUDGETS.map((b) => (
                <button key={b} onClick={() => set("budget", b)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-[12.5px] font-medium transition flex items-center justify-between ${form.budget === b ? "border-electric bg-blue-50 text-electric" : "border-slate-200 text-midnight"}`}>
                  {b}
                  {form.budget === b && <Check size={13} strokeWidth={3} />}
                </button>
              ))}
            </div>
            <Label>Preferred timeline *</Label>
            <div className="space-y-1.5">
              {TIMELINES.map((t) => (
                <button key={t} onClick={() => set("timeline", t)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-[12.5px] font-medium transition flex items-center justify-between ${form.timeline === t ? "border-electric bg-blue-50 text-electric" : "border-slate-200 text-midnight"}`}>
                  {t}
                  {form.timeline === t && <Check size={13} strokeWidth={3} />}
                </button>
              ))}
            </div>
            <Label>Payment method *</Label>
            <div className="space-y-1.5">
              {PAY_OPTIONS.map((p) => (
                <button key={p} onClick={() => set("payment", p)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-[12.5px] font-medium transition flex items-center justify-between ${form.payment === p ? "border-electric bg-blue-50 text-electric" : "border-slate-200 text-midnight"}`}>
                  {p}
                  {form.payment === p && <Check size={13} strokeWidth={3} />}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <TogglePill label="Financing interest" active={form.finance_interest} onClick={() => set("finance_interest", !form.finance_interest)} />
              <TogglePill label="I have a trade-in" active={form.trade_in} onClick={() => set("trade_in", !form.trade_in)} />
            </div>
            {form.trade_in && (
              <QInput value={form.trade_in_detail} onChange={(v) => set("trade_in_detail", v)} placeholder="Trade-in vehicle (e.g. 2020 Toyota Camry)" />
            )}
          </>
        )}

        {/* Step 2 — Notes + summary */}
        {step === 2 && (
          <>
            <Label>Additional notes</Label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3}
              placeholder="Any specific requirements, questions, or information for our advisors…"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] outline-none focus:border-electric resize-none" />

            {/* Summary */}
            <div className="bg-slate-50 rounded-xl p-3.5 space-y-1.5 mt-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">Summary</p>
              {[
                ["Vehicle", vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.year})` : "—"],
                ["Price", vehicle ? `₦${Number(vehicle.price).toLocaleString()}` : "—"],
                ["Name", form.name],
                ["Phone", form.phone],
                ["Budget", form.budget],
                ["Timeline", form.timeline],
                ["Payment", form.payment],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-[11.5px]">
                  <span className="text-slate-400">{k}</span>
                  <span className="font-medium text-midnight text-right max-w-[55%]">{v}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-2.5 mt-5">
        {step > 0 && (
          <button onClick={() => setStep(step - 1)}
            className="tap w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            <ChevronLeft size={18} className="text-midnight" />
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep(step + 1)} disabled={!canNext[step]}
            className="tap flex-1 py-3 rounded-xl bg-midnight text-white font-semibold text-[13.5px] flex items-center justify-center gap-2 disabled:opacity-40">
            Next — {STEPS[step + 1].label} <ChevronRight size={15} />
          </button>
        ) : (
          <button onClick={submit} disabled={submitting || !form.name || !form.phone}
            className="tap flex-1 py-3 rounded-xl bg-electric text-white font-bold text-[13.5px] flex items-center justify-center gap-2 disabled:opacity-50">
            {submitting ? <><Loader2 size={14} className="animate-spin" />Submitting…</> : "Submit Quote Request"}
          </button>
        )}
      </div>
    </ModalShell>
  );
}

function ModalShell({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className="bg-white w-full sm:w-[480px] sm:rounded-2xl rounded-t-[28px] max-h-[90vh] overflow-y-auto p-5 pb-7">
        <div className="w-10 h-1 bg-slate-200 rounded-pill mx-auto mb-4 sm:hidden" />
        {children}
      </div>
    </div>
  );
}

function Label({ children }) {
  return <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{children}</p>;
}

function QInput({ value, onChange, placeholder, type = "text", icon }) {
  return (
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>}
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type={type}
        className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 text-[13px] outline-none focus:border-electric transition ${icon ? "pl-9 pr-3.5" : "px-3.5"}`} />
    </div>
  );
}

function TogglePill({ label, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`flex-1 py-2 rounded-xl border text-[11.5px] font-semibold transition ${active ? "border-electric bg-blue-50 text-electric" : "border-slate-200 text-slate-500"}`}>
      {label}
    </button>
  );
}
