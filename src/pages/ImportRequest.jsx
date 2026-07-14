import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Truck, Check, Loader2, ChevronRight } from "lucide-react";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";

const STEPS = ["Vehicle", "Preferences", "Submit"];

const BRANDS = ["BYD", "GAC", "Chery", "XPeng", "Geely", "MG", "NIO", "Li Auto", "Zeekr", "Toyota", "Honda", "Mercedes", "BMW", "Lexus", "Audi", "Other"];
const FUELS = ["Petrol", "Diesel", "Electric", "Hybrid"];
const TRANSMISSIONS = ["Automatic", "Manual", "Either"];
const CONDITIONS = ["New", "Used", "Either"];
const BUDGETS = ["Under ₦10m", "₦10m – ₦20m", "₦20m – ₦30m", "₦30m – ₦50m", "Over ₦50m"];

const blank = { brand: "", model: "", year: "", color: "", fuel: "Petrol", transmission: "Automatic", condition: "New", budget: "", reference_url: "", notes: "" };

export default function ImportRequest() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(blank);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function setF(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit() {
    setSubmitting(true);
    await supabase.from("import_requests").insert({
      customer_id: profile.id,
      brand: form.brand, model: form.model,
      year: form.year ? Number(form.year) : null,
      color: form.color, fuel: form.fuel,
      transmission: form.transmission, budget: form.budget,
      notes: form.notes, reference_url: form.reference_url,
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
          <p className="text-[18px] font-bold text-midnight">Request Submitted</p>
          <p className="text-[13px] text-slate-400 leading-relaxed">
            Your import request has been received. An Allvex advisor will reach out within 24 hours to discuss your options.
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
    <div className="min-h-screen bg-white pb-10">
      <div className="bg-midnight text-white px-4 sm:px-6 pt-6 pb-5">
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
        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? "bg-electric" : "bg-white/20"}`} />
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 sm:px-6 py-5 space-y-4">
        {/* ── Step 0: Vehicle ── */}
        {step === 0 && (
          <div className="bg-white rounded-2xl shadow-card p-5 space-y-3">
            <h2 className="text-[14px] font-bold text-midnight">Which vehicle?</h2>
            <Field label="Brand">
              <select value={form.brand} onChange={(e) => setF("brand", e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] outline-none focus:border-electric">
                <option value="">Select brand</option>
                {BRANDS.map((b) => <option key={b}>{b}</option>)}
              </select>
            </Field>
            <Field label="Model"><FormInput value={form.model} onChange={(v) => setF("model", v)} placeholder="e.g. Seal Premium, GS8, Tiggo 8 Pro" /></Field>
            <div className="grid grid-cols-2 gap-2.5">
              <Field label="Year (optional)"><FormInput value={form.year} onChange={(v) => setF("year", v)} placeholder="e.g. 2025" /></Field>
              <Field label="Preferred Color"><FormInput value={form.color} onChange={(v) => setF("color", v)} placeholder="e.g. White" /></Field>
            </div>
            <Field label="Reference URL (optional)"><FormInput value={form.reference_url} onChange={(v) => setF("reference_url", v)} placeholder="Link to listing, image or spec sheet" /></Field>
          </div>
        )}

        {/* ── Step 1: Preferences ── */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-card p-5 space-y-4">
            <h2 className="text-[14px] font-bold text-midnight">Your preferences</h2>

            <Field label="Fuel Type">
              <div className="grid grid-cols-2 gap-2">
                {FUELS.map((f) => (
                  <ToggleBtn key={f} label={f} selected={form.fuel === f} onClick={() => setF("fuel", f)} />
                ))}
              </div>
            </Field>

            <Field label="Transmission">
              <div className="grid grid-cols-3 gap-2">
                {TRANSMISSIONS.map((t) => (
                  <ToggleBtn key={t} label={t} selected={form.transmission === t} onClick={() => setF("transmission", t)} />
                ))}
              </div>
            </Field>

            <Field label="Condition">
              <div className="grid grid-cols-3 gap-2">
                {CONDITIONS.map((c) => (
                  <ToggleBtn key={c} label={c} selected={form.condition === c} onClick={() => setF("condition", c)} />
                ))}
              </div>
            </Field>

            <Field label="Budget">
              <div className="space-y-2">
                {BUDGETS.map((b) => (
                  <button key={b} onClick={() => setF("budget", b)}
                    className={`tap w-full text-left px-3.5 py-2.5 rounded-xl border text-[13px] font-medium ${form.budget === b ? "border-electric bg-blue-50 text-electric" : "border-slate-200 bg-white text-midnight"}`}>
                    {b}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Additional notes">
              <textarea value={form.notes} onChange={(e) => setF("notes", e.target.value)} rows={3}
                placeholder="Specific features, deadline, other requirements..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] outline-none focus:border-electric resize-none" />
            </Field>
          </div>
        )}

        {/* ── Step 2: Review & Submit ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-card p-5 space-y-3">
              <h2 className="text-[14px] font-bold text-midnight">Review your request</h2>
              <SummaryRow label="Vehicle" value={`${form.brand || "Any"} ${form.model || ""}`} />
              <SummaryRow label="Year" value={form.year || "Any"} />
              <SummaryRow label="Color" value={form.color || "Any"} />
              <SummaryRow label="Fuel" value={form.fuel} />
              <SummaryRow label="Transmission" value={form.transmission} />
              <SummaryRow label="Condition" value={form.condition} />
              <SummaryRow label="Budget" value={form.budget || "Not specified"} />
              {form.notes && <SummaryRow label="Notes" value={form.notes} />}
            </div>

            <div className="bg-electric/5 border border-electric/20 rounded-2xl p-4 flex gap-2.5">
              <Check size={15} className="text-electric shrink-0 mt-0.5" />
              <p className="text-[12.5px] text-slate-600 leading-relaxed">
                After submitting, an Allvex advisor will reach out <strong>within 24 hours</strong> with vehicle options that match your request, including prices and delivery estimates.
              </p>
            </div>

            <button onClick={submit} disabled={submitting || !form.brand}
              className="tap w-full py-4 rounded-2xl bg-electric text-white font-bold text-[14.5px] flex items-center justify-center gap-2 disabled:opacity-50">
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : <><Truck size={16} /> Submit Import Request</>}
            </button>
          </div>
        )}

        {step < STEPS.length - 1 && (
          <button onClick={() => setStep(step + 1)}
            className="tap w-full py-4 rounded-2xl bg-midnight text-white font-bold text-[14px] flex items-center justify-center gap-2">
            Continue <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function FormInput({ value, onChange, placeholder }) {
  return (
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] outline-none focus:border-electric transition" />
  );
}

function ToggleBtn({ label, selected, onClick }) {
  return (
    <button onClick={onClick}
      className={`tap py-2 rounded-xl text-[12.5px] font-semibold border transition ${selected ? "border-electric bg-blue-50 text-electric" : "border-slate-200 text-slate-500 bg-white hover:border-slate-300"}`}>
      {label}
    </button>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 border-b border-slate-50 last:border-0">
      <span className="text-[12px] text-slate-400">{label}</span>
      <span className="text-[12.5px] font-semibold text-midnight text-right">{value}</span>
    </div>
  );
}
