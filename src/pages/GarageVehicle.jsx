import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TopBar from "../components/TopBar.jsx";
import VehicleArt from "../components/VehicleArt.jsx";
import StageTimeline from "../components/StageTimeline.jsx";
import { supabase } from "../lib/supabase.js";
import {
  Gauge, ShieldCheck, FileText, Wallet, Plus, Droplet, Wrench,
  X, MoreHorizontal, Upload, Loader2,
} from "lucide-react";

const tabs = ["Overview", "Maintenance", "Documents", "Expenses", "Timeline"];

const levelStyles = {
  upcoming: "bg-blue-50 text-electric",
  overdue: "bg-red-50 text-danger",
  due: "bg-amber-50 text-warning",
  scheduled: "bg-slate-100 text-slate-500",
};

export default function GarageVehicle() {
  const { id } = useParams();
  const [tab, setTab] = useState("Overview");
  const [loading, setLoading] = useState(true);
  const [v, setV] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [showAddReminder, setShowAddReminder] = useState(false);
  const [showAddDoc, setShowAddDoc] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [saving, setSaving] = useState(false);

  const [reminderForm, setReminderForm] = useState({ title: "", km: "", months: "" });
  const [docForm, setDocForm] = useState({ name: "" });
  const [expenseForm, setExpenseForm] = useState({ category: "", amount: "", note: "" });

  async function load() {
    setLoading(true);
    const [vRes, remRes, docRes, expRes] = await Promise.all([
      supabase.from("garage_vehicles").select("*").eq("id", id).single(),
      supabase.from("maintenance_reminders").select("*").eq("garage_vehicle_id", id).order("due_date", { ascending: true }),
      supabase.from("garage_documents").select("*").eq("garage_vehicle_id", id).order("uploaded_at", { ascending: false }),
      supabase.from("vehicle_expenses").select("*").eq("garage_vehicle_id", id).order("expense_date", { ascending: false }),
    ]);
    setV(vRes.data);
    setReminders(remRes.data || []);
    setDocuments(docRes.data || []);
    setExpenses(expRes.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function submitReminder() {
    if (!reminderForm.title.trim()) return;
    setSaving(true);
    await supabase.from("maintenance_reminders").insert({
      garage_vehicle_id: id,
      title: reminderForm.title.trim(),
      interval_km: Number(reminderForm.km) || null,
      interval_months: Number(reminderForm.months) || null,
      due_date: new Date().toISOString().slice(0, 10),
      level: "upcoming",
    });
    setSaving(false);
    setShowAddReminder(false);
    setReminderForm({ title: "", km: "", months: "" });
    load();
  }

  async function submitDoc() {
    if (!docForm.name.trim()) return;
    setSaving(true);
    await supabase.from("garage_documents").insert({ garage_vehicle_id: id, name: docForm.name.trim(), file_type: "PDF" });
    setSaving(false);
    setShowAddDoc(false);
    setDocForm({ name: "" });
    load();
  }

  async function submitExpense() {
    if (!expenseForm.category.trim() || !expenseForm.amount) return;
    setSaving(true);
    await supabase.from("vehicle_expenses").insert({
      garage_vehicle_id: id,
      category: expenseForm.category.trim(),
      amount: Number(expenseForm.amount),
      note: expenseForm.note.trim() || null,
    });
    setSaving(false);
    setShowAddExpense(false);
    setExpenseForm({ category: "", amount: "", note: "" });
    load();
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

  const totalExpense = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const avgMonthly = expenses.length ? totalExpense / Math.max(1, new Set(expenses.map((e) => e.expense_date.slice(0, 7))).size) : 0;

  const timelineEvents = [
    { label: "Vehicle Registered in Garage", done: true, date: new Date(v.created_at).toLocaleDateString() },
    ...documents.map((d) => ({ label: `${d.name} uploaded`, done: true, date: new Date(d.uploaded_at).toLocaleDateString() })),
    ...expenses.map((e) => ({ label: `${e.category} · ₦${Number(e.amount).toLocaleString()}`, done: true, date: new Date(e.expense_date).toLocaleDateString() })),
    ...reminders.filter((r) => r.level !== "overdue").map((r) => ({ label: `Upcoming: ${r.title}`, done: false, date: r.due_date ? new Date(r.due_date).toLocaleDateString() : "—" })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="pb-10">
      <TopBar title={v.nickname} right={<MoreHorizontal size={19} className="text-midnight" />} />
      <VehicleArt category={v.brand === "BYD" ? "Electric" : "SUV"} src={v.image_url} className="h-32 sm:h-40 w-full" iconSize={32} />

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between mt-4">
          <div>
            <p className="text-[15px] font-bold text-midnight">{v.brand} {v.model}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{v.year} · {v.color} · {v.plate}</p>
          </div>
          <div className="text-right">
            <p className="text-[17px] font-bold text-success">{v.health_score}%</p>
            <p className="text-[10.5px] text-slate-400">Health Score</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar mt-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`tap shrink-0 px-4 py-2 rounded-pill text-[12.5px] font-semibold ${
                tab === t ? "bg-midnight text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {tab === "Overview" && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2.5">
                <Stat icon={Gauge} label="Mileage" value={`${v.mileage.toLocaleString()} km`} />
                <Stat icon={ShieldCheck} label="Insurance" value={v.insurance_status} />
              </div>
              <button onClick={() => setTab("Maintenance")} className="tap w-full bg-electric/10 rounded-xl p-4 text-left">
                <p className="text-[13px] font-semibold text-electric">Set a routine reminder</p>
                <p className="text-[11.5px] text-slate-500 mt-0.5">Oil change, servicing, wash & more — never miss a task.</p>
              </button>
            </div>
          )}

          {tab === "Maintenance" && (
            <div className="flex flex-col gap-3">
              <button onClick={() => setShowAddReminder(true)} className="tap w-full flex items-center justify-center gap-2 bg-midnight text-white rounded-xl py-3 font-semibold text-[13px]">
                <Plus size={16} /> Add Routine Task
              </button>
              {reminders.length === 0 && <EmptyState text="No reminders set for this vehicle yet." />}
              {reminders.map((r) => (
                <div key={r.id} className="bg-white rounded-xl shadow-card p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-electric/10 flex items-center justify-center shrink-0">
                    {r.title.toLowerCase().includes("oil") ? <Droplet size={17} className="text-electric" /> : <Wrench size={17} className="text-electric" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-semibold text-midnight">{r.title}</p>
                    <p className="text-[11.5px] text-slate-400 mt-0.5">
                      {r.interval_km ? `Every ${r.interval_km.toLocaleString()} km` : ""}
                      {r.interval_km && r.interval_months ? " or " : ""}
                      {r.interval_months ? `${r.interval_months} months` : ""}
                    </p>
                  </div>
                  <span className={`text-[10.5px] font-semibold px-2.5 py-1 rounded-pill shrink-0 ${levelStyles[r.level] || levelStyles.scheduled}`}>
                    {r.due_date ? new Date(r.due_date).toLocaleDateString() : "—"}
                  </span>
                </div>
              ))}
              <p className="text-[11.5px] text-slate-400 text-center mt-1">
                Allvex tracks these by date or mileage and notifies you when a task is due.
              </p>
            </div>
          )}

          {tab === "Documents" && (
            <div className="flex flex-col gap-3">
              <button onClick={() => setShowAddDoc(true)} className="tap w-full flex items-center justify-center gap-2 bg-midnight text-white rounded-xl py-3 font-semibold text-[13px]">
                <Upload size={16} /> Add Document
              </button>
              {documents.length === 0 && <EmptyState text="No documents uploaded yet." />}
              {documents.map((d) => (
                <div key={d.id} className="bg-white rounded-xl shadow-card p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <FileText size={17} className="text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-midnight truncate">{d.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{d.file_type}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "Expenses" && (
            <div className="flex flex-col gap-3.5">
              <button onClick={() => setShowAddExpense(true)} className="tap w-full flex items-center justify-center gap-2 bg-midnight text-white rounded-xl py-3 font-semibold text-[13px]">
                <Plus size={16} /> Log Expense
              </button>
              <div className="bg-midnight rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-slate-400">Total ownership cost</p>
                  <p className="text-[19px] font-bold text-white">₦{totalExpense.toLocaleString()}</p>
                </div>
                <Wallet size={22} className="text-electric" />
              </div>
              {expenses.length === 0 ? (
                <EmptyState text="No expenses logged yet." />
              ) : (
                expenses.map((e) => (
                  <div key={e.id} className="bg-white rounded-xl shadow-card p-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-[12.5px] font-semibold text-midnight">{e.category}</p>
                      <p className="text-[10.5px] text-slate-400 mt-0.5">{new Date(e.expense_date).toLocaleDateString()}{e.note ? ` · ${e.note}` : ""}</p>
                    </div>
                    <p className="text-[12.5px] font-bold text-midnight">₦{Number(e.amount).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "Timeline" && (
            <div className="bg-white rounded-xl shadow-card p-4">
              {timelineEvents.length === 0 ? (
                <EmptyState text="No activity recorded yet." />
              ) : (
                <StageTimeline stages={timelineEvents} />
              )}
            </div>
          )}
        </div>
      </div>

      {showAddReminder && (
        <Modal onClose={() => setShowAddReminder(false)} title="Add Routine Task">
          <input placeholder="Task name (e.g. Tyre Rotation)" value={reminderForm.title} onChange={(e) => setReminderForm((f) => ({ ...f, title: e.target.value }))} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[13.5px] outline-none" />
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Every (km)" value={reminderForm.km} onChange={(e) => setReminderForm((f) => ({ ...f, km: e.target.value }))} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[13.5px] outline-none" />
            <input placeholder="Every (months)" value={reminderForm.months} onChange={(e) => setReminderForm((f) => ({ ...f, months: e.target.value }))} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[13.5px] outline-none" />
          </div>
          <p className="text-[11.5px] text-slate-400 -mt-1">We'll notify you by whichever comes first — date or mileage.</p>
          <SaveButton onClick={submitReminder} saving={saving} label="Save Reminder" />
        </Modal>
      )}

      {showAddDoc && (
        <Modal onClose={() => setShowAddDoc(false)} title="Add Document">
          <input placeholder="Document name (e.g. Insurance Certificate)" value={docForm.name} onChange={(e) => setDocForm({ name: e.target.value })} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[13.5px] outline-none" />
          <p className="text-[11.5px] text-slate-400 -mt-1">File upload isn't wired up yet — this saves the record so it appears in your vault.</p>
          <SaveButton onClick={submitDoc} saving={saving} label="Save Document" />
        </Modal>
      )}

      {showAddExpense && (
        <Modal onClose={() => setShowAddExpense(false)} title="Log an Expense">
          <input placeholder="Category (e.g. Fuel, Service)" value={expenseForm.category} onChange={(e) => setExpenseForm((f) => ({ ...f, category: e.target.value }))} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[13.5px] outline-none" />
          <input placeholder="Amount (₦)" value={expenseForm.amount} onChange={(e) => setExpenseForm((f) => ({ ...f, amount: e.target.value }))} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[13.5px] outline-none" />
          <input placeholder="Note (optional)" value={expenseForm.note} onChange={(e) => setExpenseForm((f) => ({ ...f, note: e.target.value }))} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[13.5px] outline-none" />
          <SaveButton onClick={submitExpense} saving={saving} label="Save Expense" />
        </Modal>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="bg-white rounded-xl shadow-card p-3.5 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-electric/10 flex items-center justify-center shrink-0">
        <Icon size={16} className="text-electric" />
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-bold text-midnight truncate">{value}</p>
        <p className="text-[10.5px] text-slate-400">{label}</p>
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="bg-white rounded-xl shadow-card p-5 text-center">
      <p className="text-[12px] text-slate-400">{text}</p>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-end z-50 max-w-[430px] mx-auto" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white w-full rounded-t-[24px] p-5 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-bold text-midnight">{title}</h3>
          <button onClick={onClose}><X size={19} className="text-slate-400" /></button>
        </div>
        <div className="flex flex-col gap-3">{children}</div>
      </div>
    </div>
  );
}

function SaveButton({ onClick, saving, label }) {
  return (
    <button onClick={onClick} disabled={saving} className="tap w-full py-3 rounded-xl bg-electric text-white font-semibold text-[13.5px] mt-1 flex items-center justify-center gap-2 disabled:opacity-60">
      {saving && <Loader2 size={14} className="animate-spin" />}
      {saving ? "Saving..." : label}
    </button>
  );
}
