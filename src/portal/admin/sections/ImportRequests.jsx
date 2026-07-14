import { useEffect, useState } from "react";
import { Eye, TrendingUp, Clock, CheckCircle, Loader2 } from "lucide-react";
import { SectionPanel, SearchBar, DataTable, TR, TD, Chip, Btn, Spinner, EmptyState, Modal, StatCard } from "../components/ui.jsx";
import { supabase } from "../../../lib/supabase.js";

const statusTone = { pending: "warning", in_review: "info", quoted: "success", converted: "success", rejected: "danger" };

export default function ImportRequests({ toast }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [view, setView] = useState(null);
  const [converting, setConverting] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("import_requests")
      .select("*, profiles(full_name, email, phone)")
      .order("created_at", { ascending: false });
    setRequests(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id, status) {
    await supabase.from("import_requests").update({ status }).eq("id", id);
    toast.success(`Request marked as ${status}.`);
    setRequests((rs) => rs.map((r) => r.id === id ? { ...r, status } : r));
    if (view?.id === id) setView((v) => ({ ...v, status }));
  }

  async function convertToOrder(req) {
    if (!req.profiles) return;
    setConverting(true);
    const orderNum = `ALX-${Date.now().toString().slice(-5)}`;
    const label = `${req.brand || "Vehicle"} ${req.model || ""}`.trim();

    const { error } = await supabase.from("import_orders").insert({
      order_number: orderNum,
      customer_id: req.customer_id,
      vehicle_label: label,
      stage: "inquiry_submitted",
      progress: 5,
      eta_days: 45,
    });

    if (error) { toast.error(error.message); setConverting(false); return; }
    await supabase.from("import_requests").update({ status: "converted" }).eq("id", req.id);
    await supabase.from("notifications").insert({ user_id: req.customer_id, title: "Import Order Created", body: `Your request for ${label} has been converted to order ${orderNum}. An advisor will contact you shortly.` });
    setConverting(false);
    toast.success(`Order ${orderNum} created and customer notified.`);
    setView(null);
    load();
  }

  const filtered = requests.filter((r) => {
    const q = query.toLowerCase();
    const matchQ = !q || r.profiles?.full_name?.toLowerCase().includes(q) || `${r.brand} ${r.model}`.toLowerCase().includes(q);
    const matchS = statusFilter === "all" || r.status === statusFilter;
    return matchQ && matchS;
  });

  const pending = requests.filter((r) => r.status === "pending").length;
  const converted = requests.filter((r) => r.status === "converted").length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Requests" value={requests.length} icon={TrendingUp} />
        <StatCard label="Pending" value={pending} tone="warning" icon={Clock} />
        <StatCard label="Converted to Orders" value={converted} tone="success" icon={CheckCircle} />
      </div>

      <SectionPanel
        title="Import Requests"
        action={
          <SearchBar value={query} onChange={setQuery} placeholder="Search customer or vehicle...">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] outline-none">
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="in_review">In Review</option>
              <option value="quoted">Quoted</option>
              <option value="converted">Converted</option>
              <option value="rejected">Rejected</option>
            </select>
          </SearchBar>
        }
      >
        {loading ? <Spinner /> : (
          <>
            <DataTable columns={["Customer", "Vehicle", "Budget", "Fuel", "Status", "Submitted", "Actions"]}>
              {filtered.map((r) => (
                <TR key={r.id}>
                  <TD bold>{r.profiles?.full_name || "—"}</TD>
                  <TD>{`${r.brand || "—"} ${r.model || ""}`.trim()}</TD>
                  <TD>{r.budget || "—"}</TD>
                  <TD>{r.fuel || "—"}</TD>
                  <TD><Chip tone={statusTone[r.status] || "neutral"}>{r.status?.replaceAll("_", " ")}</Chip></TD>
                  <TD>{new Date(r.created_at).toLocaleDateString()}</TD>
                  <TD>
                    <div className="flex gap-1.5">
                      <Btn onClick={() => setView(r)}><Eye size={12} /></Btn>
                      {r.status === "pending" && <Btn variant="ghost" onClick={() => updateStatus(r.id, "in_review")}>Review</Btn>}
                    </div>
                  </TD>
                </TR>
              ))}
            </DataTable>
            {filtered.length === 0 && <EmptyState text="No import requests found." />}
          </>
        )}
      </SectionPanel>

      {view && (
        <Modal title={`Import Request — ${view.profiles?.full_name}`} onClose={() => setView(null)} width="max-w-lg">
          <div className="space-y-4">
            {/* Customer */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-1">
              <p className="text-[11px] font-semibold text-slate-400">CUSTOMER</p>
              <p className="text-[13.5px] font-bold text-midnight">{view.profiles?.full_name}</p>
              <p className="text-[12px] text-slate-400">{view.profiles?.email}</p>
              {view.profiles?.phone && <p className="text-[12px] text-slate-400">{view.profiles.phone}</p>}
            </div>

            {/* Request details */}
            <div className="grid grid-cols-2 gap-2.5">
              {[
                ["Brand", view.brand], ["Model", view.model], ["Year", view.year],
                ["Color", view.color], ["Fuel", view.fuel], ["Transmission", view.transmission],
                ["Condition", view.condition], ["Budget", view.budget],
              ].map(([label, val]) => val && (
                <div key={label} className="bg-slate-50 rounded-xl px-3 py-2.5">
                  <p className="text-[10px] text-slate-400">{label}</p>
                  <p className="text-[12.5px] font-semibold text-midnight">{val}</p>
                </div>
              ))}
            </div>

            {view.notes && (
              <div className="bg-slate-50 rounded-xl p-3.5">
                <p className="text-[11px] text-slate-400 mb-1">NOTES</p>
                <p className="text-[12.5px] text-slate-600">{view.notes}</p>
              </div>
            )}

            {view.reference_url && (
              <div className="bg-slate-50 rounded-xl p-3.5">
                <p className="text-[11px] text-slate-400 mb-1">REFERENCE</p>
                <a href={view.reference_url} target="_blank" rel="noreferrer" className="text-[12.5px] text-electric underline break-all">{view.reference_url}</a>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <span className="text-[12px] text-slate-400">Status:</span>
              <Chip tone={statusTone[view.status] || "neutral"}>{view.status?.replaceAll("_", " ")}</Chip>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              {view.status !== "converted" && (
                <button onClick={() => convertToOrder(view)} disabled={converting}
                  className="tap w-full py-3 rounded-xl bg-electric text-white font-semibold text-[13px] flex items-center justify-center gap-2 disabled:opacity-60">
                  {converting ? <><Loader2 size={14} className="animate-spin" /> Converting…</> : "Convert to Import Order"}
                </button>
              )}
              <div className="grid grid-cols-3 gap-2">
                {view.status === "pending" && <Btn className="py-2.5" onClick={() => updateStatus(view.id, "in_review")}>Mark In Review</Btn>}
                {["pending", "in_review"].includes(view.status) && <Btn className="py-2.5" variant="success" onClick={() => updateStatus(view.id, "quoted")}>Mark Quoted</Btn>}
                {view.status !== "rejected" && view.status !== "converted" && <Btn className="py-2.5" variant="danger" onClick={() => updateStatus(view.id, "rejected")}>Reject</Btn>}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
