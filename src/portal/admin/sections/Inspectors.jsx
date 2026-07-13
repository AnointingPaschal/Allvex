import { useEffect, useState } from "react";
import { Plus, Trash2, ClipboardCheck } from "lucide-react";
import { SectionPanel, SearchBar, DataTable, TR, TD, Chip, Btn, Spinner, EmptyState, Modal, Field, Input, Select, SaveBtn, Confirm, StatCard } from "../components/ui.jsx";
import { supabase } from "../../../lib/supabase.js";

const blankInspector = { full_name: "", location: "", rating: "5.0" };
const blankInspection = { vehicle_label: "", vin: "", location: "", due_label: "", inspector_id: "" };

const statusTone = { pending: "warning", in_progress: "info", passed: "success", minor_issues: "warning", not_recommended: "danger" };

export default function Inspectors({ toast }) {
  const [tab, setTab] = useState("inspectors"); // "inspectors" | "inspections"
  const [inspectors, setInspectors] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editInspector, setEditInspector] = useState(null);
  const [isNewInspector, setIsNewInspector] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [newInspection, setNewInspection] = useState(null);
  const [linkEmail, setLinkEmail] = useState("");
  const [linking, setLinking] = useState(false);
  const [linkTarget, setLinkTarget] = useState(null);

  async function load() {
    setLoading(true);
    const [inspRes, inspectionRes] = await Promise.all([
      supabase.from("inspectors").select("*, inspections(count)").order("created_at", { ascending: false }),
      supabase.from("inspections").select("*, inspectors(full_name)").order("id", { ascending: false }),
    ]);
    setInspectors(inspRes.data || []);
    setInspections(inspectionRes.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function saveInspector() {
    if (!editInspector.full_name.trim()) { toast.error("Name is required."); return; }
    setSaving(true);
    const payload = { full_name: editInspector.full_name.trim(), location: editInspector.location.trim(), rating: Number(editInspector.rating) || 5 };
    const { error } = isNewInspector
      ? await supabase.from("inspectors").insert(payload)
      : await supabase.from("inspectors").update(payload).eq("id", editInspector.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(isNewInspector ? "Inspector added." : "Inspector updated.");
    setEditInspector(null);
    load();
  }

  async function deleteInspector(i) {
    await supabase.from("inspectors").delete().eq("id", i.id);
    toast.success("Inspector deleted.");
    setConfirm(null);
    load();
  }

  async function addInspection() {
    if (!newInspection.vehicle_label.trim()) { toast.error("Vehicle label is required."); return; }
    setSaving(true);
    await supabase.from("inspections").insert({
      vehicle_label: newInspection.vehicle_label.trim(),
      vin: newInspection.vin.trim() || null,
      location: newInspection.location.trim() || null,
      due_label: newInspection.due_label.trim() || null,
      inspector_id: newInspection.inspector_id || null,
      status: "pending",
    });
    setSaving(false);
    toast.success("Inspection assigned.");
    setNewInspection(null);
    load();
  }

  async function assignInspector(inspection, inspector_id) {
    await supabase.from("inspections").update({ inspector_id }).eq("id", inspection.id);
    toast.success("Inspector assigned.");
    load();
  }

  async function linkUser() {
    if (!linkEmail.trim() || !linkTarget) return;
    setLinking(true);
    const { data: profile } = await supabase.from("profiles").select("id, full_name").eq("email", linkEmail.trim()).single();
    if (!profile) { toast.error("No account found."); setLinking(false); return; }
    await supabase.from("profiles").update({ role: "inspector", inspector_id: linkTarget.id }).eq("id", profile.id);
    toast.success(`${profile.full_name} linked as inspector.`);
    setLinking(false);
    setLinkTarget(null);
    setLinkEmail("");
  }

  const filteredInspectors = inspectors.filter((i) => !query || i.full_name.toLowerCase().includes(query.toLowerCase()));
  const filteredInspections = inspections.filter((i) => !query || i.vehicle_label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Inspectors" value={inspectors.length} icon={ClipboardCheck} />
        <StatCard label="Pending Inspections" value={inspections.filter((i) => i.status === "pending").length} tone="warning" icon={ClipboardCheck} />
        <StatCard label="Completed" value={inspections.filter((i) => ["passed", "minor_issues", "not_recommended"].includes(i.status)).length} tone="success" icon={ClipboardCheck} />
      </div>

      <div className="flex gap-2">
        <Btn variant={tab === "inspectors" ? "dark" : "ghost"} onClick={() => setTab("inspectors")}>Inspectors</Btn>
        <Btn variant={tab === "inspections" ? "dark" : "ghost"} onClick={() => setTab("inspections")}>Inspections</Btn>
      </div>

      {tab === "inspectors" && (
        <SectionPanel
          title="Inspectors"
          action={
            <>
              <SearchBar value={query} onChange={setQuery} placeholder="Search..." />
              <Btn variant="primary" onClick={() => { setEditInspector({ ...blankInspector }); setIsNewInspector(true); }}>
                <Plus size={13} className="inline mr-1" />Add Inspector
              </Btn>
            </>
          }
        >
          {loading ? <Spinner /> : (
            <>
              <DataTable columns={["Name", "Location", "Rating", "Inspections", "Actions"]}>
                {filteredInspectors.map((i) => (
                  <TR key={i.id}>
                    <TD bold>{i.full_name}</TD>
                    <TD>{i.location || "—"}</TD>
                    <TD>{Number(i.rating).toFixed(1)} / 5</TD>
                    <TD>{i.inspections?.[0]?.count ?? 0}</TD>
                    <TD>
                      <div className="flex gap-1.5">
                        <Btn onClick={() => { setEditInspector({ ...i, rating: String(i.rating) }); setIsNewInspector(false); }}>Edit</Btn>
                        <Btn onClick={() => { setLinkTarget(i); }}>Link User</Btn>
                        <Btn variant="danger" onClick={() => setConfirm({ type: "inspector", data: i })}><Trash2 size={12} /></Btn>
                      </div>
                    </TD>
                  </TR>
                ))}
              </DataTable>
              {filteredInspectors.length === 0 && <EmptyState text="No inspectors found." />}
            </>
          )}
        </SectionPanel>
      )}

      {tab === "inspections" && (
        <SectionPanel
          title="Inspections"
          action={
            <>
              <SearchBar value={query} onChange={setQuery} placeholder="Search vehicle..." />
              <Btn variant="primary" onClick={() => setNewInspection({ ...blankInspection })}>
                <Plus size={13} className="inline mr-1" />Assign Inspection
              </Btn>
            </>
          }
        >
          {loading ? <Spinner /> : (
            <>
              <DataTable columns={["Vehicle", "VIN", "Location", "Inspector", "Due", "Status", "Actions"]}>
                {filteredInspections.map((i) => (
                  <TR key={i.id}>
                    <TD bold>{i.vehicle_label}</TD>
                    <TD>{i.vin || "—"}</TD>
                    <TD>{i.location || "—"}</TD>
                    <TD>{i.inspectors?.full_name || "Unassigned"}</TD>
                    <TD>{i.due_label || "—"}</TD>
                    <TD><Chip tone={statusTone[i.status] || "neutral"}>{i.status.replaceAll("_", " ")}</Chip></TD>
                    <TD>
                      {i.status === "pending" && (
                        <select className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[12px] outline-none"
                          defaultValue=""
                          onChange={(e) => e.target.value && assignInspector(i, e.target.value)}>
                          <option value="">Reassign…</option>
                          {inspectors.map((ins) => <option key={ins.id} value={ins.id}>{ins.full_name}</option>)}
                        </select>
                      )}
                      {i.status !== "pending" && <Chip tone={statusTone[i.status]}>{i.status}</Chip>}
                    </TD>
                  </TR>
                ))}
              </DataTable>
              {filteredInspections.length === 0 && <EmptyState text="No inspections found." />}
            </>
          )}
        </SectionPanel>
      )}

      {editInspector && (
        <Modal title={isNewInspector ? "Add Inspector" : `Edit — ${editInspector.full_name}`} onClose={() => setEditInspector(null)}>
          <div className="space-y-3">
            <Field label="Full Name"><Input value={editInspector.full_name} onChange={(e) => setEditInspector((x) => ({ ...x, full_name: e.target.value }))} /></Field>
            <Field label="Location (e.g. Lagos Port)"><Input value={editInspector.location} onChange={(e) => setEditInspector((x) => ({ ...x, location: e.target.value }))} /></Field>
            <Field label="Rating (0–5)"><Input type="number" min={0} max={5} step={0.1} value={editInspector.rating} onChange={(e) => setEditInspector((x) => ({ ...x, rating: e.target.value }))} /></Field>
            <SaveBtn saving={saving} label={isNewInspector ? "Add" : "Save"} onClick={saveInspector} />
          </div>
        </Modal>
      )}

      {newInspection && (
        <Modal title="Assign Inspection" onClose={() => setNewInspection(null)}>
          <div className="space-y-3">
            <Field label="Vehicle"><Input value={newInspection.vehicle_label} onChange={(e) => setNewInspection((x) => ({ ...x, vehicle_label: e.target.value }))} placeholder="e.g. GAC GS8" /></Field>
            <Field label="VIN (optional)"><Input value={newInspection.vin} onChange={(e) => setNewInspection((x) => ({ ...x, vin: e.target.value }))} /></Field>
            <Field label="Location"><Input value={newInspection.location} onChange={(e) => setNewInspection((x) => ({ ...x, location: e.target.value }))} placeholder="e.g. Guangzhou Yard 4" /></Field>
            <Field label="Due">
              <Select value={newInspection.due_label} onChange={(e) => setNewInspection((x) => ({ ...x, due_label: e.target.value }))}>
                <option value="">Set due date</option>
                <option>Today</option><option>Tomorrow</option><option>This week</option>
              </Select>
            </Field>
            <Field label="Assign to Inspector">
              <Select value={newInspection.inspector_id} onChange={(e) => setNewInspection((x) => ({ ...x, inspector_id: e.target.value }))}>
                <option value="">Select inspector</option>
                {inspectors.map((i) => <option key={i.id} value={i.id}>{i.full_name}</option>)}
              </Select>
            </Field>
            <SaveBtn saving={saving} label="Assign Inspection" onClick={addInspection} />
          </div>
        </Modal>
      )}

      {linkTarget && (
        <Modal title={`Link User to ${linkTarget.full_name}`} onClose={() => setLinkTarget(null)}>
          <div className="space-y-3">
            <Field label="User Email"><Input type="email" value={linkEmail} onChange={(e) => setLinkEmail(e.target.value)} placeholder="inspector@email.com" /></Field>
            <SaveBtn saving={linking} label="Link Account" onClick={linkUser} />
          </div>
        </Modal>
      )}

      {confirm?.type === "inspector" && (
        <Confirm title="Delete Inspector" message={`Delete ${confirm.data.full_name}? Their inspection history is preserved.`} danger confirmLabel="Delete" onConfirm={() => deleteInspector(confirm.data)} onCancel={() => setConfirm(null)} />
      )}
    </div>
  );
}

