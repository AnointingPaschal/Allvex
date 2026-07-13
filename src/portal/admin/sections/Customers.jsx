import { useEffect, useState } from "react";
import { Eye, UserX, UserCheck, Mail } from "lucide-react";
import { SectionPanel, SearchBar, DataTable, TR, TD, Chip, Btn, Spinner, EmptyState, Modal, Field, Input, Confirm, StatCard } from "../components/ui.jsx";
import { supabase } from "../../../lib/supabase.js";
import { Users } from "lucide-react";

export default function Customers({ toast }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [view, setView] = useState(null); // customer object for detail modal
  const [confirm, setConfirm] = useState(null); // { customer, action }
  const [garageCount, setGarageCount] = useState({});
  const [orderCount, setOrderCount] = useState({});

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "customer")
      .order("created_at", { ascending: false });
    const list = data || [];
    setCustomers(list);

    if (list.length > 0) {
      const ids = list.map((c) => c.id);
      const [garage, orders] = await Promise.all([
        supabase.from("garage_vehicles").select("owner_id").in("owner_id", ids),
        supabase.from("import_orders").select("customer_id").in("customer_id", ids),
      ]);
      const gc = {}, oc = {};
      (garage.data || []).forEach((r) => { gc[r.owner_id] = (gc[r.owner_id] || 0) + 1; });
      (orders.data || []).forEach((r) => { oc[r.customer_id] = (oc[r.customer_id] || 0) + 1; });
      setGarageCount(gc);
      setOrderCount(oc);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = customers.filter((c) => {
    const q = query.toLowerCase();
    const matchQ = !q || c.full_name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q);
    const matchS = statusFilter === "all" || c.status === statusFilter;
    return matchQ && matchS;
  });

  async function toggleStatus(c) {
    const next = c.status === "active" ? "suspended" : "active";
    const { error } = await supabase.from("profiles").update({ status: next }).eq("id", c.id);
    if (error) { toast.error("Update failed: " + error.message); return; }
    toast.success(`${c.full_name} ${next === "active" ? "reinstated" : "suspended"}.`);
    setConfirm(null);
    setView(null);
    load();
  }

  async function sendNotification(c) {
    await supabase.from("notifications").insert({ user_id: c.id, title: "Message from Allvex", body: "Your account has been reviewed by our team." });
    toast.success("Notification sent.");
  }

  const active = customers.filter((c) => c.status === "active").length;
  const suspended = customers.filter((c) => c.status === "suspended").length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Customers" value={customers.length} icon={Users} />
        <StatCard label="Active" value={active} tone="success" icon={UserCheck} />
        <StatCard label="Suspended" value={suspended} tone="danger" icon={UserX} />
      </div>

      <SectionPanel
        title="All Customers"
        action={
          <SearchBar value={query} onChange={setQuery} placeholder="Search name or email...">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] outline-none">
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </SearchBar>
        }
      >
        {loading ? <Spinner /> : (
          <>
            <DataTable columns={["Name", "Email", "Vehicles", "Orders", "Status", "Joined", "Actions"]}>
              {filtered.map((c) => (
                <TR key={c.id}>
                  <TD bold>{c.full_name}</TD>
                  <TD>{c.email}</TD>
                  <TD>{garageCount[c.id] || 0}</TD>
                  <TD>{orderCount[c.id] || 0}</TD>
                  <TD><Chip tone={c.status === "active" ? "success" : "danger"}>{c.status}</Chip></TD>
                  <TD>{new Date(c.created_at).toLocaleDateString()}</TD>
                  <TD>
                    <div className="flex gap-1.5">
                      <Btn onClick={() => setView(c)}><Eye size={12} /></Btn>
                      <Btn variant={c.status === "active" ? "danger" : "success"} onClick={() => setConfirm({ customer: c, action: c.status === "active" ? "suspend" : "reinstate" })}>
                        {c.status === "active" ? <UserX size={12} /> : <UserCheck size={12} />}
                      </Btn>
                      <Btn onClick={() => sendNotification(c)}><Mail size={12} /></Btn>
                    </div>
                  </TD>
                </TR>
              ))}
            </DataTable>
            {filtered.length === 0 && <EmptyState text="No customers match your search." />}
            <div className="px-5 py-3 border-t border-slate-100 text-[11.5px] text-slate-400">
              Showing {filtered.length} of {customers.length} customers
            </div>
          </>
        )}
      </SectionPanel>

      {/* Customer detail modal */}
      {view && (
        <Modal title={`Customer Profile — ${view.full_name}`} onClose={() => setView(null)} width="max-w-xl">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Detail label="Full Name" value={view.full_name} />
              <Detail label="Email" value={view.email} />
              <Detail label="Phone" value={view.phone || "Not set"} />
              <Detail label="Status" value={<Chip tone={view.status === "active" ? "success" : "danger"}>{view.status}</Chip>} />
              <Detail label="Garage Vehicles" value={garageCount[view.id] || 0} />
              <Detail label="Total Orders" value={orderCount[view.id] || 0} />
              <Detail label="Joined" value={new Date(view.created_at).toLocaleDateString()} />
              <Detail label="User ID" value={<span className="font-mono text-[11px]">{view.id.slice(0, 18)}…</span>} />
            </div>
            <div className="flex gap-2.5 pt-2 border-t border-slate-100">
              <Btn variant={view.status === "active" ? "danger" : "success"} className="flex-1" onClick={() => { setConfirm({ customer: view, action: view.status === "active" ? "suspend" : "reinstate" }); setView(null); }}>
                {view.status === "active" ? "Suspend Account" : "Reinstate Account"}
              </Btn>
              <Btn className="flex-1" onClick={() => { sendNotification(view); setView(null); }}>
                <Mail size={13} className="inline mr-1" /> Send Notification
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm action */}
      {confirm && (
        <Confirm
          title={`${confirm.action === "suspend" ? "Suspend" : "Reinstate"} Account`}
          message={`Are you sure you want to ${confirm.action} ${confirm.customer.full_name}'s account?`}
          danger={confirm.action === "suspend"}
          confirmLabel={confirm.action === "suspend" ? "Suspend" : "Reinstate"}
          onConfirm={() => toggleStatus(confirm.customer)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="bg-slate-50 rounded-xl px-3.5 py-2.5">
      <p className="text-[10.5px] text-slate-400 font-medium">{label}</p>
      <p className="text-[12.5px] font-semibold text-midnight mt-0.5">{typeof value === "string" || typeof value === "number" ? value : value}</p>
    </div>
  );
}
