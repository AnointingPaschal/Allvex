import { useState } from "react";
import DashboardLayout from "../DashboardLayout.jsx";
import { Badge, Panel, Table, Td, Button } from "../ui.jsx";
import { Inbox, UserSearch, PackageSearch, Send } from "lucide-react";
import { tickets, ticketThread, customers, adminOrders } from "../../data/portalMock.js";

const sections = [
  { key: "tickets", label: "Tickets", icon: Inbox },
  { key: "lookup", label: "Customer Lookup", icon: UserSearch },
  { key: "orders", label: "Track Orders", icon: PackageSearch },
];

const priorityTone = { High: "danger", Medium: "warning", Low: "neutral" };
const statusTone = { Open: "warning", "In Progress": "info", Resolved: "success" };

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
      {active === "tickets" && !openTicket && (
        <Panel title="Ticket Queue">
          <Table columns={["Ticket", "Customer", "Subject", "Priority", "Status", ""]}>
            {tickets.map((t) => (
              <tr key={t.id}>
                <Td bold>{t.id}</Td>
                <Td>{t.customer}</Td>
                <Td>{t.subject}</Td>
                <Td><Badge tone={priorityTone[t.priority]}>{t.priority}</Badge></Td>
                <Td><Badge tone={statusTone[t.status]}>{t.status}</Badge></Td>
                <Td><Button variant="ghost" onClick={() => setOpenTicket(t)}>Open</Button></Td>
              </tr>
            ))}
          </Table>
        </Panel>
      )}

      {active === "tickets" && openTicket && (
        <TicketDetail ticket={openTicket} onBack={() => setOpenTicket(null)} />
      )}

      {active === "lookup" && (
        <Panel title="Customers">
          <Table columns={["Name", "Email", "Vehicles", "Active Orders", "Status", ""]}>
            {customers.map((c) => (
              <tr key={c.id}>
                <Td bold>{c.name}</Td>
                <Td>{c.email}</Td>
                <Td>{c.vehicles}</Td>
                <Td>{c.activeOrders}</Td>
                <Td><Badge tone={c.status === "Active" ? "success" : "danger"}>{c.status}</Badge></Td>
                <Td><Button variant="ghost">View Profile</Button></Td>
              </tr>
            ))}
          </Table>
        </Panel>
      )}

      {active === "orders" && (
        <Panel title="All Orders">
          <Table columns={["Order", "Customer", "Vehicle", "Stage", "ETA", ""]}>
            {adminOrders.map((o) => (
              <tr key={o.id}>
                <Td bold>{o.id}</Td>
                <Td>{o.customer}</Td>
                <Td>{o.vehicle}</Td>
                <Td>{o.stage}</Td>
                <Td>{o.eta}</Td>
                <Td><Button variant="ghost">View Timeline</Button></Td>
              </tr>
            ))}
          </Table>
        </Panel>
      )}
    </DashboardLayout>
  );
}

function TicketDetail({ ticket, onBack }) {
  return (
    <div className="grid lg:grid-cols-3 gap-4 lg:gap-5">
      <div className="col-span-2 bg-white rounded-allvex shadow-card flex flex-col h-[560px]">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[13.5px] font-bold text-midnight">{ticket.subject}</p>
            <p className="text-[11.5px] text-slate-400 mt-0.5">{ticket.id} · {ticket.customer}</p>
          </div>
          <Button variant="ghost" onClick={onBack}>Back to queue</Button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-3">
          {ticketThread.map((m, i) => (
            <div
              key={i}
              className={`max-w-[75%] px-4 py-2.5 rounded-allvex text-[13px] leading-snug ${
                m.from === "agent" ? "bg-electric text-white self-end" : "bg-slate-50 text-midnight self-start"
              }`}
            >
              {m.text}
            </div>
          ))}
        </div>
        <div className="px-5 py-4 border-t border-slate-100 flex items-center gap-2.5">
          <input placeholder="Type a reply..." className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[13px] outline-none" />
          <button className="tap w-9 h-9 rounded-xl bg-electric flex items-center justify-center shrink-0">
            <Send size={15} className="text-white" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Panel title="Ticket Info">
          <div className="p-5 flex flex-col gap-3 text-[13px]">
            <Row label="Priority"><Badge tone={priorityTone[ticket.priority]}>{ticket.priority}</Badge></Row>
            <Row label="Status"><Badge tone={statusTone[ticket.status]}>{ticket.status}</Badge></Row>
            <Row label="Customer">{ticket.customer}</Row>
          </div>
        </Panel>
        <div className="flex flex-col gap-2">
          <Button className="w-full py-3">Mark Resolved</Button>
          <Button variant="ghost" className="w-full py-3">Escalate to Admin</Button>
        </div>
      </div>
    </div>
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
