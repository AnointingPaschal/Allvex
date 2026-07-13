import { useEffect, useState } from "react";
import DashboardLayout from "../DashboardLayout.jsx";
import { Badge, Panel, Table, Td, Button } from "../ui.jsx";
import { ClipboardList, History, Camera, X, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { useAuth } from "../../context/AuthContext.jsx";

const sections = [
  { key: "assigned", label: "Assigned Inspections", icon: ClipboardList },
  { key: "history", label: "History", icon: History },
];

const checklistItems = ["Exterior", "Interior", "Engine", "Battery", "Tyres", "Electronics", "Undercarriage", "Paint Thickness"];

function Spinner() {
  return <div className="flex justify-center py-10"><Loader2 size={20} className="animate-spin text-electric" /></div>;
}

export default function InspectorPortal() {
  const { profile } = useAuth();
  const [active, setActive] = useState("assigned");
  const [inspecting, setInspecting] = useState(null);
  const [inspector, setInspector] = useState(null);
  const [assigned, setAssigned] = useState(null);
  const [completed, setCompleted] = useState(null);

  useEffect(() => {
    if (!profile?.inspector_id) return;
    supabase.from("inspectors").select("*").eq("id", profile.inspector_id).single().then(({ data }) => setInspector(data));
  }, [profile]);

  async function loadLists() {
    if (!profile?.inspector_id) return;
    const [a, c] = await Promise.all([
      supabase.from("inspections").select("*").eq("inspector_id", profile.inspector_id).in("status", ["pending", "in_progress"]).order("id"),
      supabase.from("inspections").select("*").eq("inspector_id", profile.inspector_id).in("status", ["passed", "minor_issues", "not_recommended"]).order("submitted_at", { ascending: false }),
    ]);
    setAssigned(a.data || []);
    setCompleted(c.data || []);
  }

  useEffect(() => { loadLists(); }, [profile]);

  if (!profile?.inspector_id) {
    return (
      <DashboardLayout roleLabel="Inspector" roleColor="bg-success" sections={sections} active={active} onSelect={setActive} title="Inspector Portal">
        <Panel><div className="p-6 text-[13px] text-slate-400">This account isn't linked to an inspector record yet. Ask an administrator to link it.</div></Panel>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      roleLabel="Inspector"
      roleColor="bg-success"
      sections={sections}
      active={active}
      onSelect={setActive}
      title={sections.find((s) => s.key === active).label}
      subtitle={inspector ? `${inspector.full_name} · ${inspector.location}` : ""}
    >
      {active === "assigned" && (
        assigned === null ? <Spinner /> : (
          <Panel title="Assigned to You">
            <Table columns={["Vehicle", "VIN", "Location", "Due", ""]}>
              {assigned.map((i) => (
                <tr key={i.id}>
                  <Td bold>{i.vehicle_label}</Td>
                  <Td>{i.vin || "—"}</Td>
                  <Td>{i.location || "—"}</Td>
                  <Td><Badge tone={i.due_label === "Today" ? "warning" : "neutral"}>{i.due_label || "—"}</Badge></Td>
                  <Td><Button onClick={() => setInspecting(i)}>Start Inspection</Button></Td>
                </tr>
              ))}
              {assigned.length === 0 && <tr><Td colSpan={5}>No inspections assigned right now.</Td></tr>}
            </Table>
          </Panel>
        )
      )}

      {active === "history" && (
        completed === null ? <Spinner /> : (
          <Panel title="Completed Inspections">
            <Table columns={["Vehicle", "VIN", "Date", "Result"]}>
              {completed.map((i) => (
                <tr key={i.id}>
                  <Td bold>{i.vehicle_label}</Td>
                  <Td>{i.vin || "—"}</Td>
                  <Td>{i.submitted_at ? new Date(i.submitted_at).toLocaleDateString() : "—"}</Td>
                  <Td><Badge tone={i.status === "passed" ? "success" : "warning"}>{i.status.replaceAll("_", " ")}</Badge></Td>
                </tr>
              ))}
              {completed.length === 0 && <tr><Td colSpan={4}>No completed inspections yet.</Td></tr>}
            </Table>
          </Panel>
        )
      )}

      {inspecting && (
        <InspectionForm
          inspection={inspecting}
          onClose={() => setInspecting(null)}
          onSubmitted={() => { setInspecting(null); loadLists(); }}
        />
      )}
    </DashboardLayout>
  );
}

function InspectionForm({ inspection, onClose, onSubmitted }) {
  const [checked, setChecked] = useState({});
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState("passed");
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    await supabase.from("inspections").update({
      status: result,
      checklist: checked,
      notes,
      submitted_at: new Date().toISOString(),
    }).eq("id", inspection.id);

    // If it passed, mark the linked vehicle verified & live
    if (inspection.vehicle_id && result === "passed") {
      await supabase.from("vehicles").update({ verified: true, status: "live" }).eq("id", inspection.vehicle_id);
    }
    setSaving(false);
    onSubmitted();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-allvex w-[520px] max-h-[85vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[16px] font-bold text-midnight">Inspection Report</h3>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        <p className="text-[12.5px] text-slate-400 mb-5">{inspection.vehicle_label} · VIN {inspection.vin || "—"}</p>

        <p className="text-[12.5px] font-semibold text-midnight mb-2.5">Checklist</p>
        <div className="grid grid-cols-2 gap-2 mb-5">
          {checklistItems.map((item) => (
            <label key={item} className="flex items-center gap-2.5 bg-slate-50 rounded-xl px-3.5 py-2.5">
              <input type="checkbox" className="accent-electric w-4 h-4" checked={!!checked[item]} onChange={(e) => setChecked((c) => ({ ...c, [item]: e.target.checked }))} />
              <span className="text-[12.5px] text-midnight">{item}</span>
            </label>
          ))}
        </div>

        <p className="text-[12.5px] font-semibold text-midnight mb-2.5">Media</p>
        <div className="grid grid-cols-4 gap-2 mb-5">
          {[1, 2, 3, 4].map((n) => (
            <button key={n} className="tap aspect-square rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300">
              <Camera size={18} />
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate-400 -mt-3 mb-5">Photo/video upload requires a Supabase Storage bucket — not wired up yet.</p>

        <p className="text-[12.5px] font-semibold text-midnight mb-2.5">Inspector Notes</p>
        <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes about condition, damage, or concerns..." className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[13px] outline-none mb-5 resize-none" />

        <p className="text-[12.5px] font-semibold text-midnight mb-2.5">Result</p>
        <div className="flex gap-2 mb-6">
          {[{ v: "passed", l: "Passed" }, { v: "minor_issues", l: "Minor Issues" }, { v: "not_recommended", l: "Not Recommended" }].map((r) => (
            <button key={r.v} onClick={() => setResult(r.v)} className={`tap flex-1 py-2.5 rounded-xl text-[12px] font-semibold ${result === r.v ? "bg-midnight text-white" : "bg-slate-100 text-slate-500"}`}>
              {r.l}
            </button>
          ))}
        </div>

        <Button className="w-full py-3" onClick={submit} disabled={saving}>{saving ? "Submitting..." : "Submit Report"}</Button>
      </div>
    </div>
  );
}
