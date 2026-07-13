import { useState } from "react";
import DashboardLayout from "../DashboardLayout.jsx";
import { KpiCard, Badge, Panel, Table, Td, Button } from "../ui.jsx";
import {
  LayoutGrid, Users, Truck, Building2, Car, ClipboardCheck, Newspaper, Search,
  Wallet, PackageCheck, TriangleAlert,
} from "lucide-react";
import { customers, adminOrders, suppliers, inspectors, adminVehicles, articles } from "../../data/portalMock.js";

const sections = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "customers", label: "Customers", icon: Users },
  { key: "imports", label: "Imports", icon: PackageCheck },
  { key: "suppliers", label: "Suppliers", icon: Truck },
  { key: "vehicles", label: "Vehicles", icon: Car },
  { key: "inspectors", label: "Inspectors", icon: ClipboardCheck },
  { key: "content", label: "Content", icon: Newspaper },
];

const orderTone = { in_progress: "info", attention: "warning", action_needed: "danger", completed: "success" };
const orderLabel = { in_progress: "In Progress", attention: "Needs Attention", action_needed: "Action Needed", completed: "Completed" };

export default function AdminPortal() {
  const [active, setActive] = useState("overview");

  return (
    <DashboardLayout
      roleLabel="Administrator"
      roleColor="bg-electric"
      sections={sections}
      active={active}
      onSelect={setActive}
      title={sections.find((s) => s.key === active).label}
      subtitle="Full platform oversight across customers, imports, suppliers and content."
    >
      {active === "overview" && <Overview />}
      {active === "customers" && <Customers />}
      {active === "imports" && <Imports />}
      {active === "suppliers" && <Suppliers />}
      {active === "vehicles" && <Vehicles />}
      {active === "inspectors" && <Inspectors />}
      {active === "content" && <Content />}
    </DashboardLayout>
  );
}

function Overview() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Total Customers" value="1,284" sub="+42 this week" icon={Users} />
        <KpiCard label="Active Imports" value="37" sub="+5 this week" icon={PackageCheck} />
        <KpiCard label="Revenue (MTD)" value="₦412.8m" sub="+18% vs last month" icon={Wallet} />
        <KpiCard label="Pending Inspections" value="6" icon={TriangleAlert} />
      </div>
      <Panel title="Recent Activity">
        <div className="divide-y divide-slate-100">
          {[
            "Alex Johnson's BYD Seal Premium departed Shenzhen Port",
            "Supplier Jiangsu Motor Group submitted 5 new vehicles for review",
            "Inspector Chinedu Obi passed inspection for GAC GS8",
            "New ticket TCK-3391 opened by Amaka Chukwu",
          ].map((a, i) => (
            <div key={i} className="px-5 py-3.5 text-[13px] text-slate-500">{a}</div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Customers() {
  return (
    <Panel title="All Customers" action={<SearchBox placeholder="Search customers..." />}>
      <Table columns={["Name", "Email", "Vehicles", "Active Orders", "Status", ""]}>
        {customers.map((c) => (
          <tr key={c.id}>
            <Td bold>{c.name}</Td>
            <Td>{c.email}</Td>
            <Td>{c.vehicles}</Td>
            <Td>{c.activeOrders}</Td>
            <Td><Badge tone={c.status === "Active" ? "success" : "danger"}>{c.status}</Badge></Td>
            <Td>
              <Button variant={c.status === "Active" ? "danger" : "ghost"}>
                {c.status === "Active" ? "Suspend" : "Reinstate"}
              </Button>
            </Td>
          </tr>
        ))}
      </Table>
    </Panel>
  );
}

function Imports() {
  return (
    <Panel title="All Import Orders" action={<SearchBox placeholder="Search order #..." />}>
      <Table columns={["Order", "Customer", "Vehicle", "Stage", "ETA", "Status", ""]}>
        {adminOrders.map((o) => (
          <tr key={o.id}>
            <Td bold>{o.id}</Td>
            <Td>{o.customer}</Td>
            <Td>{o.vehicle}</Td>
            <Td>{o.stage}</Td>
            <Td>{o.eta}</Td>
            <Td><Badge tone={orderTone[o.status]}>{orderLabel[o.status]}</Badge></Td>
            <Td><Button variant="ghost">View</Button></Td>
          </tr>
        ))}
      </Table>
    </Panel>
  );
}

function Suppliers() {
  return (
    <Panel title="Suppliers" action={<Button>Invite Supplier</Button>}>
      <Table columns={["Company", "Vehicles Listed", "Rating", "Status", ""]}>
        {suppliers.map((s) => (
          <tr key={s.id}>
            <Td bold>{s.name}</Td>
            <Td>{s.vehiclesListed}</Td>
            <Td>{s.rating} / 5</Td>
            <Td><Badge tone={s.status === "Approved" ? "success" : "warning"}>{s.status}</Badge></Td>
            <Td><Button variant={s.status === "Approved" ? "ghost" : "primary"}>{s.status === "Approved" ? "Manage" : "Review"}</Button></Td>
          </tr>
        ))}
      </Table>
    </Panel>
  );
}

function Vehicles() {
  return (
    <Panel title="Marketplace Vehicles" action={<Button>Add Vehicle</Button>}>
      <Table columns={["Vehicle", "Brand", "Price", "Verified", "Status", ""]}>
        {adminVehicles.map((v) => (
          <tr key={v.id}>
            <Td bold>{v.name}</Td>
            <Td>{v.brand}</Td>
            <Td>{v.price}</Td>
            <Td>{v.verified ? <Badge tone="success">Verified</Badge> : <Badge tone="neutral">Unverified</Badge>}</Td>
            <Td><Badge tone={v.status === "Live" ? "success" : "warning"}>{v.status}</Badge></Td>
            <Td><Button variant="ghost">Edit</Button></Td>
          </tr>
        ))}
      </Table>
    </Panel>
  );
}

function Inspectors() {
  return (
    <Panel title="Inspectors" action={<Button>Add Inspector</Button>}>
      <Table columns={["Name", "Location", "Assigned", "Completed", "Rating", ""]}>
        {inspectors.map((i) => (
          <tr key={i.id}>
            <Td bold>{i.name}</Td>
            <Td>{i.location}</Td>
            <Td>{i.assigned}</Td>
            <Td>{i.completed}</Td>
            <Td>{i.rating} / 5</Td>
            <Td><Button variant="ghost">View Profile</Button></Td>
          </tr>
        ))}
      </Table>
    </Panel>
  );
}

function Content() {
  return (
    <Panel title="Content Hub" action={<Button>New Article</Button>}>
      <Table columns={["Title", "Status", "Reads", ""]}>
        {articles.map((a) => (
          <tr key={a.id}>
            <Td bold>{a.title}</Td>
            <Td><Badge tone={a.status === "Published" ? "success" : "neutral"}>{a.status}</Badge></Td>
            <Td>{a.reads}</Td>
            <Td><Button variant="ghost">Edit</Button></Td>
          </tr>
        ))}
      </Table>
    </Panel>
  );
}

function SearchBox({ placeholder }) {
  return (
    <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
      <Search size={14} className="text-slate-400" />
      <input placeholder={placeholder} className="bg-transparent outline-none text-[12.5px] placeholder:text-slate-400" />
    </div>
  );
}
