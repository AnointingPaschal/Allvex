import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Gauge, ShieldCheck, X, Loader2 } from "lucide-react";
import VehicleArt from "../components/VehicleArt.jsx";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";

function healthColor(h) {
  if (h >= 85) return "text-success";
  if (h >= 60) return "text-warning";
  return "text-danger";
}

const empty = { nickname: "", brand: "", model: "", year: "", color: "", plate: "", mileage: "" };

export default function Garage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  async function load() {
    if (!profile) return;
    setLoading(true);
    const { data } = await supabase
      .from("garage_vehicles")
      .select("*, maintenance_reminders(*)")
      .eq("owner_id", profile.id)
      .order("created_at", { ascending: false });
    setVehicles(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [profile]);

  function nextServiceLabel(v) {
    const reminders = v.maintenance_reminders || [];
    if (reminders.length === 0) return "No reminders set";
    const overdue = reminders.find((r) => r.level === "overdue");
    const soonest = overdue || reminders.sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0];
    return `${soonest.title} · ${soonest.level === "overdue" ? "Overdue" : new Date(soonest.due_date).toLocaleDateString()}`;
  }

  async function submitAdd() {
    if (!form.nickname.trim() || !form.brand.trim() || !form.model.trim() || !form.year) return;
    setSaving(true);
    await supabase.from("garage_vehicles").insert({
      owner_id: profile.id,
      nickname: form.nickname.trim(),
      brand: form.brand.trim(),
      model: form.model.trim(),
      year: Number(form.year),
      color: form.color.trim() || null,
      plate: form.plate.trim() || null,
      mileage: Number(form.mileage) || 0,
      health_score: 100,
      insurance_status: "Not set",
    });
    setSaving(false);
    setShowAdd(false);
    setForm(empty);
    load();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={22} className="animate-spin text-electric" />
      </div>
    );
  }

  return (
    <div>
      <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-3.5 bg-white sticky top-0 z-30 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h1 className="text-[17px] font-bold text-midnight">My Garage</h1>
          <p className="text-[11px] text-slate-400 mt-0.5">{vehicles.length} registered vehicles</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="tap w-9 h-9 rounded-xl bg-electric flex items-center justify-center">
          <Plus size={17} className="text-white" />
        </button>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 mt-3.5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {vehicles.map((v) => (
          <button key={v.id} onClick={() => navigate(`/garage/${v.id}`)} className="tap bg-white rounded-xl shadow-card overflow-hidden text-left">
            <VehicleArt category={v.brand === "BYD" ? "Electric" : "SUV"} src={v.image_url} className="h-24 w-full" iconSize={26} />
            <div className="p-3.5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-midnight text-[13px]">{v.nickname}</p>
                  <p className="text-[10.5px] text-slate-400 mt-0.5">{v.brand} {v.model} · {v.year}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-[14px] font-bold ${healthColor(v.health_score)}`}>{v.health_score}%</p>
                  <p className="text-[9px] text-slate-400">Health</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="bg-slate-50 rounded-lg px-2.5 py-2 flex items-center gap-1.5">
                  <Gauge size={12} className="text-electric shrink-0" />
                  <span className="text-[10px] font-medium text-midnight truncate">{nextServiceLabel(v)}</span>
                </div>
                <div className="bg-slate-50 rounded-lg px-2.5 py-2 flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-electric shrink-0" />
                  <span className="text-[10px] font-medium text-midnight truncate">{v.insurance_status}</span>
                </div>
              </div>
            </div>
          </button>
        ))}

        <button onClick={() => setShowAdd(true)} className="tap border-2 border-dashed border-slate-200 rounded-xl py-8 flex flex-col items-center gap-2 text-slate-400">
          <Plus size={18} />
          <span className="text-[12px] font-semibold">Register a vehicle</span>
        </button>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50" onClick={() => !saving && setShowAdd(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white w-full sm:w-[420px] sm:rounded-xl rounded-t-[24px] p-5 pb-7 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14.5px] font-bold text-midnight">Register a Vehicle</h3>
              <button onClick={() => setShowAdd(false)}><X size={18} className="text-slate-400" /></button>
            </div>
            <div className="flex flex-col gap-2.5">
              <input placeholder="Nickname (e.g. My Seal)" value={form.nickname} onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))} className="bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 text-[12.5px] outline-none" />
              <div className="grid grid-cols-2 gap-2.5">
                <input placeholder="Brand" value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} className="bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 text-[12.5px] outline-none" />
                <input placeholder="Model" value={form.model} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))} className="bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 text-[12.5px] outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <input placeholder="Year" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))} className="bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 text-[12.5px] outline-none" />
                <input placeholder="Color" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} className="bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 text-[12.5px] outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <input placeholder="Plate number" value={form.plate} onChange={(e) => setForm((f) => ({ ...f, plate: e.target.value }))} className="bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 text-[12.5px] outline-none" />
                <input placeholder="Mileage (km)" value={form.mileage} onChange={(e) => setForm((f) => ({ ...f, mileage: e.target.value }))} className="bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 text-[12.5px] outline-none" />
              </div>
              <button
                onClick={submitAdd}
                disabled={saving}
                className="tap w-full py-3 rounded-xl bg-electric text-white font-semibold text-[13px] mt-1.5 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? "Saving..." : "Register Vehicle"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="h-4" />
    </div>
  );
}
