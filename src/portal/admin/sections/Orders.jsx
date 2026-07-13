import { useEffect, useState } from "react";
import { Eye, ChevronRight, Plus, Check } from "lucide-react";
import { SectionPanel, SearchBar, DataTable, TR, TD, Chip, Btn, Spinner, EmptyState, Modal, Field, Input, Select, Textarea, SaveBtn, StatCard } from "../components/ui.jsx";
import { supabase } from "../../../lib/supabase.js";
import { PackageCheck, Truck, MapPin } from "lucide-react";

const STAGES = [
  "inquiry_submitted", "quote_sent", "deposit_paid", "vehicle_purchased",
  "container_booked", "container_loaded", "at_sea", "arrived_port",
  "customs_clearance", "ready_for_delivery", "delivered", "cancelled",
];

const stageTone = (s) => {
  if (s === "delivered") return "success";
  if (["customs_clearance", "arrived_port", "ready_for_delivery"].includes(s)) return "warning";
  if (s === "cancelled") return "danger";
  return "info";
};

export default function Orders({ toast }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [view, setView] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [editStage, setEditStage] = useState("");
  const [editProgress, setEditProgress] = useState(0);
  const [editEta, setEditEta] = useState("");
  const [saving, setSaving] = useState(false);
  const [newEventLabel, setNewEventLabel] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [addingEvent, setAddingEvent] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("import_orders")
      .select("*, profiles(full_name, email)")
      .order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function openOrder(o) {
    setView(o);
    setEditStage(o.stage);
    setEditProgress(o.progress);
    setEditEta(o.eta_days || "");
    setTimelineLoading(true);
    const { data } = await supabase
      .from("order_timeline_events")
      .select("*")
      .eq("order_id", o.id)
      .order("position", { ascending: true });
    setTimeline(data || []);
    setTimelineLoading(false);
  }

  async function saveOrder() {
    setSaving(true);
    const { error } = await supabase.from("import_orders").update({
      stage: editStage,
      progress: Number(editProgress),
      eta_days: Number(editEta) || null,
    }).eq("id", view.id);
    if (error) { toast.error("Failed: " + error.message); setSaving(false); return; }
    toast.success("Order updated.");
    setSaving(false);
    load();
    setView((v) => ({ ...v, stage: editStage, progress: Number(editProgress), eta_days: Number(editEta) }));
  }

  async function markTimelineEvent(event) {
    const newDone = !event.done;
    await supabase.from("order_timeline_events").update({ done: newDone, is_current: newDone }).eq("id", event.id);
    setTimeline((t) => t.map((e) => e.id === event.id ? { ...e, done: newDone, is_current: newDone } : { ...e, is_current: false }));
    toast.success(newDone ? "Stage marked complete." : "Stage unmarked.");
  }

  async function addTimelineEvent() {
    if (!newEventLabel.trim()) return;
    setAddingEvent(true);
    const position = timeline.length;
    await supabase.from("order_timeline_events").insert({
      order_id: view.id,
      label: newEventLabel.trim(),
      done: false,
      is_current: false,
      event_date: newEventDate || null,
      position,
    });
    setNewEventLabel("");
    setNewEventDate("");
    const { data } = await supabase.from("order_timeline_events").select("*").eq("order_id", view.id).order("position");
    setTimeline(data || []);
    setAddingEvent(false);
    toast.success("Timeline event added.");
  }

  async function deleteEvent(id) {
    await supabase.from("order_timeline_events").delete().eq("id", id);
    setTimeline((t) => t.filter((e) => e.id !== id));
    toast.success("Event removed.");
  }

  const filtered = orders.filter((o) => {
    const q = query.toLowerCase();
    const matchQ = !q || o.order_number?.toLowerCase().includes(q) || o.vehicle_label?.toLowerCase().includes(q) || o.profiles?.full_name?.toLowerCase().includes(q);
    const matchS = stageFilter === "all" || o.stage === stageFilter;
    return matchQ && matchS;
  });

  const active = orders.filter((o) => !["delivered", "cancelled"].includes(o.stage)).length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Orders" value={orders.length} icon={PackageCheck} />
        <StatCard label="Active" value={active} tone="success" icon={Truck} />
        <StatCard label="Delivered" value={orders.filter((o) => o.stage === "delivered").length} tone="electric" icon={MapPin} />
      </div>

      <SectionPanel
        title="Import Orders"
        action={
          <SearchBar value={query} onChange={setQuery} placeholder="Search order, vehicle, customer...">
            <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] outline-none">
              <option value="all">All stages</option>
              {STAGES.map((s) => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}
            </select>
          </SearchBar>
        }
      >
        {loading ? <Spinner /> : (
          <>
            <DataTable columns={["Order #", "Customer", "Vehicle", "Stage", "Progress", "ETA", "Actions"]}>
              {filtered.map((o) => (
                <TR key={o.id}>
                  <TD bold>{o.order_number}</TD>
                  <TD>{o.profiles?.full_name || "—"}</TD>
                  <TD>{o.vehicle_label}</TD>
                  <TD><Chip tone={stageTone(o.stage)}>{o.stage.replaceAll("_", " ")}</Chip></TD>
                  <TD>
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-electric rounded-full" style={{ width: `${o.progress}%` }} />
                      </div>
                      <span className="text-[10.5px]">{o.progress}%</span>
                    </div>
                  </TD>
                  <TD>{o.eta_days ? `${o.eta_days} days` : "—"}</TD>
                  <TD><Btn onClick={() => openOrder(o)}><Eye size={12} className="inline mr-1" />Manage</Btn></TD>
                </TR>
              ))}
            </DataTable>
            {filtered.length === 0 && <EmptyState text="No orders found." />}
          </>
        )}
      </SectionPanel>

      {/* Order management modal */}
      {view && (
        <Modal title={`Manage Order — ${view.order_number}`} onClose={() => setView(null)} width="max-w-2xl">
          <div className="space-y-5">
            {/* Customer info */}
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-[11px] font-semibold text-slate-400 mb-1">CUSTOMER</p>
              <p className="text-[13px] font-semibold text-midnight">{view.profiles?.full_name}</p>
              <p className="text-[12px] text-slate-400">{view.profiles?.email}</p>
            </div>

            {/* Stage controls */}
            <div className="grid grid-cols-3 gap-3">
              <Field label="Stage">
                <Select value={editStage} onChange={(e) => setEditStage(e.target.value)}>
                  {STAGES.map((s) => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}
                </Select>
              </Field>
              <Field label="Progress (%)">
                <Input type="number" min={0} max={100} value={editProgress} onChange={(e) => setEditProgress(e.target.value)} />
              </Field>
              <Field label="ETA (days)">
                <Input type="number" min={0} value={editEta} onChange={(e) => setEditEta(e.target.value)} placeholder="e.g. 18" />
              </Field>
            </div>
            <SaveBtn saving={saving} label="Update Order" onClick={saveOrder} />

            {/* Timeline editor */}
            <div className="border-t border-slate-100 pt-4">
              <p className="text-[13px] font-bold text-midnight mb-3">Shipment Timeline</p>
              {timelineLoading ? <Spinner /> : (
                <div className="space-y-2 mb-3">
                  {timeline.map((e) => (
                    <div key={e.id} className={`flex items-center gap-3 p-3 rounded-xl border ${e.done ? "border-electric/20 bg-blue-50" : "border-slate-100 bg-white"}`}>
                      <button onClick={() => markTimelineEvent(e)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${e.done ? "bg-electric border-electric" : "border-slate-300"}`}>
                        {e.done && <Check size={11} className="text-white" strokeWidth={3} />}
                      </button>
                      <span className={`flex-1 text-[12.5px] ${e.done ? "font-semibold text-midnight" : "text-slate-400"}`}>{e.label}</span>
                      <span className="text-[11px] text-slate-400">{e.event_date || "—"}</span>
                      <button onClick={() => deleteEvent(e.id)} className="text-slate-300 hover:text-danger transition text-[11px]">✕</button>
                    </div>
                  ))}
                  {timeline.length === 0 && <p className="text-[12.5px] text-slate-400">No timeline events yet.</p>}
                </div>
              )}

              {/* Add event */}
              <div className="flex gap-2">
                <Input value={newEventLabel} onChange={(e) => setNewEventLabel(e.target.value)} placeholder="Event label (e.g. Container Sealed)" />
                <Input value={newEventDate} onChange={(e) => setNewEventDate(e.target.value)} placeholder="Date (e.g. Jul 20)" className="w-32" />
                <Btn variant="primary" onClick={addTimelineEvent} disabled={addingEvent || !newEventLabel.trim()}>
                  <Plus size={13} />
                </Btn>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
