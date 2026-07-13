import { useEffect, useState } from "react";
import { Plus, Eye, Trash2 } from "lucide-react";
import { SectionPanel, SearchBar, DataTable, TR, TD, Chip, Btn, Spinner, EmptyState, Modal, Field, Input, Select, SaveBtn, Confirm, StatCard } from "../components/ui.jsx";
import { supabase } from "../../../lib/supabase.js";
import { Truck, CheckCircle, AlertTriangle } from "lucide-react";

const blank = { company_name: "", rating: "5.0", status: "pending_review" };

export default function Suppliers({ toast }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [vehicleCounts, setVehicleCounts] = useState({});
  const [userModal, setUserModal] = useState(null); // supplier to link a user
  const [linkEmail, setLinkEmail] = useState("");
  const [linking, setLinking] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("suppliers").select("*").order("created_at", { ascending: false });
    const list = data || [];
    setSuppliers(list);
    if (list.length > 0) {
      const { data: vc } = await supabase.from("vehicles").select("supplier_id").in("supplier_id", list.map((s) => s.id));
      const counts = {};
      (vc || []).forEach((v) => { counts[v.supplier_id] = (counts[v.supplier_id] || 0) + 1; });
      setVehicleCounts(counts);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing.company_name.trim()) { toast.error("Company name is required."); return; }
    setSaving(true);
    const payload = { company_name: editing.company_name.trim(), rating: Number(editing.rating) || 0, status: editing.status };
    const { error } = isNew
      ? await supabase.from("suppliers").insert(payload)
      : await supabase.from("suppliers").update(payload).eq("id", editing.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(isNew ? "Supplier added." : "Supplier updated.");
    setEditing(null);
    load();
  }

  async function setStatus(s, status) {
    await supabase.from("suppliers").update({ status }).eq("id", s.id);
    toast.success(`${s.company_name} ${status}.`);
    load();
  }

  async function del(s) {
    await supabase.from("suppliers").delete().eq("id", s.id);
    toast.success("Supplier deleted.");
    setConfirm(null);
    load();
  }

  async function linkUser() {
    if (!linkEmail.trim()) return;
    setLinking(true);
    const { data: profile } = await supabase.from("profiles").select("id, full_name, role").eq("email", linkEmail.trim()).single();
    if (!profile) { toast.error("No account found with that email."); setLinking(false); return; }
    await supabase.from("profiles").update({ role: "supplier", supplier_id: userModal.id }).eq("id", profile.id);
    toast.success(`${profile.full_name} linked as supplier.`);
    setLinking(false);
    setUserModal(null);
    setLinkEmail("");
  }

  const filtered = suppliers.filter((s) => !query || s.company_name.toLowerCase().includes(query.toLowerCase()));
  const approved = suppliers.filter((s) => s.status === "approved").length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Suppliers" value={suppliers.length} icon={Truck} />
        <StatCard label="Approved" value={approved} tone="success" icon={CheckCircle} />
        <StatCard label="Pending Review" value={suppliers.filter((s) => s.status === "pending_review").length} tone="warning" icon={AlertTriangle} />
      </div>

      <SectionPanel
        title="Suppliers"
        action={
          <>
            <SearchBar value={query} onChange={setQuery} placeholder="Search supplier..." />
            <Btn variant="primary" onClick={() => { setEditing({ ...blank }); setIsNew(true); }}>
              <Plus size={13} className="inline mr-1" />Add Supplier
            </Btn>
          </>
        }
      >
        {loading ? <Spinner /> : (
          <>
            <DataTable columns={["Company", "Vehicles", "Rating", "Status", "Actions"]}>
              {filtered.map((s) => (
                <TR key={s.id}>
                  <TD bold>{s.company_name}</TD>
                  <TD>{vehicleCounts[s.id] || 0}</TD>
                  <TD>{Number(s.rating).toFixed(1)} / 5</TD>
                  <TD>
                    <Chip tone={s.status === "approved" ? "success" : s.status === "suspended" ? "danger" : "warning"}>
                      {s.status.replaceAll("_", " ")}
                    </Chip>
                  </TD>
                  <TD>
                    <div className="flex gap-1.5">
                      <Btn onClick={() => { setEditing({ ...s, rating: String(s.rating) }); setIsNew(false); }}><Eye size={12} /></Btn>
                      {s.status !== "approved" && <Btn variant="success" onClick={() => setStatus(s, "approved")}>Approve</Btn>}
                      {s.status === "approved" && <Btn variant="danger" onClick={() => setStatus(s, "suspended")}>Suspend</Btn>}
                      <Btn onClick={() => setUserModal(s)}>Link User</Btn>
                      <Btn variant="danger" onClick={() => setConfirm(s)}><Trash2 size={12} /></Btn>
                    </div>
                  </TD>
                </TR>
              ))}
            </DataTable>
            {filtered.length === 0 && <EmptyState text="No suppliers found." />}
          </>
        )}
      </SectionPanel>

      {editing && (
        <Modal title={isNew ? "Add Supplier" : `Edit — ${editing.company_name}`} onClose={() => setEditing(null)}>
          <div className="space-y-3">
            <Field label="Company Name"><Input value={editing.company_name} onChange={(e) => setEditing((x) => ({ ...x, company_name: e.target.value }))} placeholder="e.g. Guangzhou Auto Trading Co." /></Field>
            <Field label="Rating (0–5)"><Input type="number" min={0} max={5} step={0.1} value={editing.rating} onChange={(e) => setEditing((x) => ({ ...x, rating: e.target.value }))} /></Field>
            <Field label="Status">
              <Select value={editing.status} onChange={(e) => setEditing((x) => ({ ...x, status: e.target.value }))}>
                <option value="pending_review">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="suspended">Suspended</option>
              </Select>
            </Field>
            <SaveBtn saving={saving} label={isNew ? "Add Supplier" : "Save"} onClick={save} />
          </div>
        </Modal>
      )}

      {userModal && (
        <Modal title={`Link User to ${userModal.company_name}`} onClose={() => setUserModal(null)}>
          <div className="space-y-3">
            <p className="text-[12.5px] text-slate-400">Enter the email of an existing Allvex account to link them as a supplier for this company.</p>
            <Field label="User Email"><Input type="email" value={linkEmail} onChange={(e) => setLinkEmail(e.target.value)} placeholder="supplier@company.com" /></Field>
            <SaveBtn saving={linking} label="Link Account" onClick={linkUser} />
          </div>
        </Modal>
      )}

      {confirm && (
        <Confirm title="Delete Supplier" message={`Delete ${confirm.company_name}? Their vehicles won't be deleted, just unlinked.`} danger confirmLabel="Delete" onConfirm={() => del(confirm)} onCancel={() => setConfirm(null)} />
      )}
    </div>
  );
}
