import { useEffect, useState } from "react";
import DashboardLayout from "../DashboardLayout.jsx";
import { Badge, Panel, Table, Td, Button } from "../ui.jsx";
import { Inbox, UserSearch, PackageSearch, Send, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { useAuth } from "../../context/AuthContext.jsx";

const sections = [
  { key: "tickets", label: "Tickets", icon: Inbox },
  { key: "lookup", label: "Customer Lookup", icon: UserSearch },
  { key: "orders", label: "Track Orders", icon: PackageSearch },
];

const priorityTone = { high: "danger", medium: "warning", low: "neutral" };
const statusTone = { open: "warning", in_progress: "info", resolved: "success" };

function Spinner() {
  return <div className="flex justify-center py-10"><Loader2 size={20} className="animate-spin text-electric" /></div>;
}

export default function SupportPortal() {
  const [active, setActive] = useState("tickets");
  const [openTicket, setOpenTicket] = useState(null);

  return (
    <DashboardLayout
      roleLabel="Customer Support"
      roleColor="bg-electric"
      sections={sections}
      active={active}
      onSelect={setActive}
      title={sections.find((s) => s.key === active).label}
      subtitle="Respond to customers and resolve issues quickly."
    >
      {active === "tickets" && !openTicket && <TicketQueue onOpen={setOpenTicket} />}
      {active === "tickets" && openTicket && <TicketDetail ticket={openTicket} onBack={() => setOpenTicket(null)} />}
      {active === "lookup" && <CustomerLookup />}
      {active === "orders" && <OrderTracking />}
    </DashboardLayout>
  );
}

function TicketQueue({ onOpen }) {
  const [tickets, setTickets] = useState(null);
  useEffect(() => {
    supabase.from("support_tickets").select("*, profiles(full_name)").order("created_at", { ascending: false })
      .then(({ data }) => setTickets(data || []));
  }, []);
  if (tickets === null) return <Spinner />;

  return (
    <Panel title="Ticket Queue">
      <Table columns={["Ticket", "Customer", "Subject", "Priority", "Status", ""]}>
        {tickets.map((t) => (
          <tr key={t.id}>
            <Td bold>{t.ticket_number}</Td>
            <Td>{t.profiles?.full_name || "—"}</Td>
            <Td>{t.subject}</Td>
            <Td><Badge tone={priorityTone[t.priority]}>{t.priority}</Badge></Td>
            <Td><Badge tone={statusTone[t.status]}>{t.status.replaceAll("_", " ")}</Badge></Td>
            <Td><Button variant="ghost" onClick={() => onOpen(t)}>Open</Button></Td>
          </tr>
        ))}
        {tickets.length === 0 && <tr><Td colSpan={6}>No tickets yet.</Td></tr>}
      </Table>
    </Panel>
  );
}

function TicketDetail({ ticket, onBack }) {
  const { profile } = useAuth();
  const [messages, setMessages] = useState(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  async function load() {
    const { data } = await supabase.from("ticket_messages").select("*").eq("ticket_id", ticket.id).order("created_at", { ascending: true });
    setMessages(data || []);
  }
  useEffect(() => { load(); }, [ticket.id]);

  async function sendReply() {
    if (!reply.trim()) return;
    setSending(true);
    await supabase.from("ticket_messages").insert({ ticket_id: ticket.id, sender_role: "agent", sender_id: profile.id, message: reply.trim() });
    await supabase.from("support_tickets").update({ status: "in_progress" }).eq("id", ticket.id);
    setReply("");
    setSending(false);
    load();
  }

  async function resolve() {
    await supabase.from("support_tickets").update({ status: "resolved" }).eq("id", ticket.id);
    onBack();
  }

  if (messages === null) return <Spinner />;

  return (
    <div className="grid grid-cols-3 gap-5">
      <div className="col-span-2 bg-white rounded-allvex shadow-card flex flex-col h-[560px]">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[13.5px] font-bold text-midnight">{ticket.subject}</p>
            <p className="text-[11.5px] text-slate-400 mt-0.5">{ticket.ticket_number}</p>
          </div>
          <Button variant="ghost" onClick={onBack}>Back to queue</Button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-3">
          {messages.map((m) => (
            <div key={m.id} className={`max-w-[75%] px-4 py-2.5 rounded-allvex text-[13px] leading-snug ${m.sender_role === "agent" ? "bg-electric text-white self-end" : "bg-slate-50 text-midnight self-start"}`}>
              {m.message}
            </div>
          ))}
          {messages.length === 0 && <p className="text-[13px] text-slate-400 text-center py-8">No messages yet.</p>}
        </div>
        <div className="px-5 py-4 border-t border-slate-100 flex items-center gap-2.5">
          <input value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendReply()} placeholder="Type a reply..." className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[13px] outline-none" />
          <button onClick={sendReply} disabled={sending} className="tap w-9 h-9 rounded-xl bg-electric flex items-center justify-center shrink-0 disabled:opacity-60">
            <Send size={15} className="text-white" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Panel title="Ticket Info">
          <div className="p-5 flex flex-col gap-3 text-[13px]">
            <Row label="Priority"><Badge tone={priorityTone[ticket.priority]}>{ticket.priority}</Badge></Row>
            <Row label="Status"><Badge tone={statusTone[ticket.status]}>{ticket.status.replaceAll("_", " ")}</Badge></Row>
          </div>
        </Panel>
        <div className="flex flex-col gap-2">
          <Button className="w-full py-3" onClick={resolve}>Mark Resolved</Button>
        </div>
      </div>
    </div>
  );
}

function CustomerLookup() {
  const [customers, setCustomers] = useState(null);
  useEffect(() => {
    supabase.from("profiles").select("*").eq("role", "customer").order("created_at", { ascending: false })
      .then(({ data }) => setCustomers(data || []));
  }, []);
  if (customers === null) return <Spinner />;

  return (
    <Panel title="Customers">
      <Table columns={["Name", "Email", "Status", ""]}>
        {customers.map((c) => (
          <tr key={c.id}>
            <Td bold>{c.full_name}</Td>
            <Td>{c.email}</Td>
            <Td><Badge tone={c.status === "active" ? "success" : "danger"}>{c.status}</Badge></Td>
            <Td><Button variant="ghost">View Profile</Button></Td>
          </tr>
        ))}
        {customers.length === 0 && <tr><Td colSpan={4}>No customers yet.</Td></tr>}
      </Table>
    </Panel>
  );
}

function OrderTracking() {
  const [orders, setOrders] = useState(null);
  useEffect(() => {
    supabase.from("import_orders").select("*, profiles(full_name)").order("created_at", { ascending: false })
      .then(({ data }) => setOrders(data || []));
  }, []);
  if (orders === null) return <Spinner />;

  return (
    <Panel title="All Orders">
      <Table columns={["Order", "Customer", "Vehicle", "Stage", "Progress", ""]}>
        {orders.map((o) => (
          <tr key={o.id}>
            <Td bold>{o.order_number}</Td>
            <Td>{o.profiles?.full_name || "—"}</Td>
            <Td>{o.vehicle_label}</Td>
            <Td>{o.stage.replaceAll("_", " ")}</Td>
            <Td>{o.progress}%</Td>
            <Td><Button variant="ghost">View Timeline</Button></Td>
          </tr>
        ))}
        {orders.length === 0 && <tr><Td colSpan={6}>No orders yet.</Td></tr>}
      </Table>
    </Panel>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-midnight">{children}</span>
    </div>
  );
}
