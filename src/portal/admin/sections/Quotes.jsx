import { useEffect, useState } from "react";
import { MessageSquare, Check, X } from "lucide-react";
import { SectionPanel, SearchBar, DataTable, TR, TD, Chip, Btn, Spinner, EmptyState, StatCard } from "../components/ui.jsx";
import { supabase } from "../../../lib/supabase.js";

export default function Quotes({ toast }) {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("quote_requests")
      .select("*, profiles(full_name, email), vehicles(brand, model, year)")
      .order("created_at", { ascending: false });
    setQuotes(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id, status) {
    await supabase.from("quote_requests").update({ status }).eq("id", id);
    toast.success(`Quote marked as ${status}.`);
    setQuotes((qs) => qs.map((q) => (q.id === id ? { ...q, status } : q)));
  }

  const filtered = quotes.filter((q) => {
    const str = `${q.profiles?.full_name} ${q.vehicles?.brand} ${q.vehicles?.model}`.toLowerCase();
    const matchQ = !query || str.includes(query.toLowerCase());
    const matchS = statusFilter === "all" || q.status === statusFilter;
    return matchQ && matchS;
  });

  const pending = quotes.filter((q) => q.status === "pending").length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Quotes" value={quotes.length} icon={MessageSquare} />
        <StatCard label="Pending" value={pending} tone="warning" icon={MessageSquare} />
        <StatCard label="Responded" value={quotes.filter((q) => q.status === "responded").length} tone="success" icon={Check} />
      </div>

      <SectionPanel
        title="Import Quote Requests"
        action={
          <SearchBar value={query} onChange={setQuery} placeholder="Search customer or vehicle...">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] outline-none">
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="responded">Responded</option>
              <option value="converted">Converted</option>
            </select>
          </SearchBar>
        }
      >
        {loading ? <Spinner /> : (
          <>
            <DataTable columns={["Customer", "Email", "Vehicle", "Budget", "Status", "Received", "Actions"]}>
              {filtered.map((q) => (
                <TR key={q.id}>
                  <TD bold>{q.profiles?.full_name || q.full_name || "—"}</TD>
                  <TD>{q.profiles?.email || "—"}</TD>
                  <TD>{q.vehicles ? `${q.vehicles.brand} ${q.vehicles.model} (${q.vehicles.year})` : "—"}</TD>
                  <TD>{q.budget || "Not specified"}</TD>
                  <TD>
                    <Chip tone={q.status === "pending" ? "warning" : q.status === "responded" ? "success" : "info"}>
                      {q.status}
                    </Chip>
                  </TD>
                  <TD>{new Date(q.created_at).toLocaleDateString()}</TD>
                  <TD>
                    <div className="flex gap-1.5">
                      {q.status === "pending" && (
                        <>
                          <Btn variant="success" onClick={() => updateStatus(q.id, "responded")}>
                            <Check size={12} className="inline mr-1" />Respond
                          </Btn>
                          <Btn variant="ghost" onClick={() => updateStatus(q.id, "converted")}>
                            Convert
                          </Btn>
                        </>
                      )}
                      {q.status !== "pending" && <Chip tone="neutral">Done</Chip>}
                    </div>
                  </TD>
                </TR>
              ))}
            </DataTable>
            {filtered.length === 0 && <EmptyState text="No quote requests found." />}
          </>
        )}
      </SectionPanel>
    </div>
  );
}

