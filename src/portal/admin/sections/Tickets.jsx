import { useEffect, useState } from "react";
import { Send, ArrowLeft } from "lucide-react";
import { SectionPanel, SearchBar, DataTable, TR, TD, Chip, Btn, Spinner, EmptyState, StatCard } from "../components/ui.jsx";
import { supabase } from "../../../lib/supabase.js";
import { useAuth } from "../../../context/AuthContext.jsx";
import { Ticket } from "lucide-react";

const priorityTone = { high: "danger", medium: "warning", low: "neutral" };
const statusTone = { open: "warning", in_progress: "info", resolved: "success" };

export default function Tickets({ toast }) {
  const { profile } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [view, setView] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("support_tickets")
      .select("*, profiles(full_name, email)")
      .order("created_at", { ascending: false });
    setTickets(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function openTicket(t) {
    setView(t);
    setMsgLoading(true);
    const { data } = await supabase.from("ticket_messages").select("*").eq("ticket_id", t.id).order("created_at");
    setMessages(data || []);
    setMsgLoading(false);
  }

  async function sendReply() {
    if (!reply.trim()) return;
    setSending(true);
    await supabase.from("ticket_messages").insert({ ticket_id: view.id, sender_role: "agent", sender_id: profile?.id, message: reply.trim() });
    await supabase.from("support_tickets").update({ status: "in_progress" }).eq("id", view.id);
    setReply("");
    setSending(false);
    const { data } = await supabase.from("ticket_messages").select("*").eq("ticket_id", view.id).order("created_at");
    setMessages(data || []);
    setView((v) => ({ ...v, status: "in_progress" }));
    setTickets((ts) => ts.map((t) => t.id === view.id ? { ...t, status: "in_progress" } : t));
    toast.success("Reply sent.");
  }

  async function resolve() {
    await supabase.from("support_tickets").update({ status: "resolved" }).eq("id", view.id);
    toast.success("Ticket resolved.");
    setView(null);
    load();
  }

  async function escalate() {
    await supabase.from("notifications").insert({ user_id: view.customer_id, title: "Your ticket has been escalated", body: `Ticket ${view.ticket_number} has been escalated to a senior team member.` });
    toast.info("Ticket escalated — notification sent to customer.");
  }

  const filtered = tickets.filter((t) => {
    const q = query.toLowerCase();
    const matchQ = !q || t.ticket_number.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q) || t.profiles?.full_name?.toLowerCase().includes(q);
    const matchS = statusFilter === "all" || t.status === statusFilter;
    return matchQ && matchS;
  });

  const open = tickets.filter((t) => t.status === "open").length;
  const inProgress = tickets.filter((t) => t.status === "in_progress").length;
  const resolved = tickets.filter((t) => t.status === "resolved").length;

  if (view) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Btn onClick={() => setView(null)}><ArrowLeft size={14} className="inline mr-1" />Back to queue</Btn>
          <span className="text-[12.5px] text-slate-400">{view.ticket_number} · {view.profiles?.full_name}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-card flex flex-col" style={{ height: 560 }}>
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="font-bold text-midnight text-[14px]">{view.subject}</p>
              <div className="flex gap-2 mt-1.5">
                <Chip tone={priorityTone[view.priority]}>{view.priority} priority</Chip>
                <Chip tone={statusTone[view.status]}>{view.status.replaceAll("_", " ")}</Chip>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
              {msgLoading ? <Spinner /> : (
                <>
                  {messages.length === 0 && <p className="text-[13px] text-slate-400 text-center py-6">No messages yet.</p>}
                  {messages.map((m) => (
                    <div key={m.id} className={`max-w-[80%] px-4 py-2.5 rounded-xl text-[12.5px] leading-snug ${m.sender_role === "agent" ? "bg-electric text-white self-end" : "bg-slate-50 text-midnight self-start border border-slate-100"}`}>
                      <p className={`text-[10px] mb-1 font-medium ${m.sender_role === "agent" ? "text-white/70" : "text-slate-400"}`}>
                        {m.sender_role === "agent" ? "Allvex Support" : view.profiles?.full_name} · {new Date(m.created_at).toLocaleTimeString()}
                      </p>
                      {m.message}
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="px-5 py-4 border-t border-slate-100 flex gap-2.5">
              <input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendReply()}
                placeholder="Type a reply..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-electric"
              />
              <button onClick={sendReply} disabled={sending || !reply.trim()} className="tap w-10 h-10 rounded-xl bg-electric flex items-center justify-center shrink-0 disabled:opacity-50">
                <Send size={15} className="text-white" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="bg-white rounded-2xl shadow-card p-5 space-y-3">
              <p className="text-[12px] font-bold text-midnight mb-2">Ticket Details</p>
              <Detail label="Customer" value={view.profiles?.full_name} />
              <Detail label="Email" value={view.profiles?.email} />
              <Detail label="Priority" value={<Chip tone={priorityTone[view.priority]}>{view.priority}</Chip>} />
              <Detail label="Status" value={<Chip tone={statusTone[view.status]}>{view.status.replaceAll("_", " ")}</Chip>} />
              <Detail label="Opened" value={new Date(view.created_at).toLocaleDateString()} />
            </div>

            <div className="flex flex-col gap-2">
              {view.status !== "resolved" && (
                <Btn variant="success" className="w-full py-2.5" onClick={resolve}>Mark as Resolved</Btn>
              )}
              <Btn className="w-full py-2.5" onClick={escalate}>Escalate to Senior Team</Btn>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Open" value={open} icon={Ticket} tone="warning" />
        <StatCard label="In Progress" value={inProgress} icon={Ticket} tone="electric" />
        <StatCard label="Resolved" value={resolved} icon={Ticket} tone="success" />
      </div>

      <SectionPanel
        title="Support Tickets"
        action={
          <SearchBar value={query} onChange={setQuery} placeholder="Search ticket, customer, subject...">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] outline-none">
              <option value="all">All status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </SearchBar>
        }
      >
        {loading ? <Spinner /> : (
          <>
            <DataTable columns={["Ticket #", "Customer", "Subject", "Priority", "Status", "Opened", "Actions"]}>
              {filtered.map((t) => (
                <TR key={t.id}>
                  <TD bold>{t.ticket_number}</TD>
                  <TD>{t.profiles?.full_name || "—"}</TD>
                  <TD className="max-w-xs truncate">{t.subject}</TD>
                  <TD><Chip tone={priorityTone[t.priority]}>{t.priority}</Chip></TD>
                  <TD><Chip tone={statusTone[t.status]}>{t.status.replaceAll("_", " ")}</Chip></TD>
                  <TD>{new Date(t.created_at).toLocaleDateString()}</TD>
                  <TD><Btn onClick={() => openTicket(t)}>Open</Btn></TD>
                </TR>
              ))}
            </DataTable>
            {filtered.length === 0 && <EmptyState text="No tickets found." />}
          </>
        )}
      </SectionPanel>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11.5px] text-slate-400">{label}</span>
      <span className="text-[12px] font-semibold text-midnight">{value}</span>
    </div>
  );
}

