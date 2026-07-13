import { useEffect, useState } from "react";
import DashboardLayout from "../DashboardLayout.jsx";
import { KpiCard, Badge, Panel, Table, Td, Button } from "../ui.jsx";
import {
  LayoutGrid, Users, Truck, Car, ClipboardCheck, Newspaper, Search,
  Wallet, PackageCheck, TriangleAlert, Loader2,
} from "lucide-react";
import { supabase } from "../../lib/supabase.js";

const sections = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "customers", label: "Customers", icon: Users },
  { key: "imports", label: "Imports", icon: PackageCheck },
  { key: "suppliers", label: "Suppliers", icon: Truck },
  { key: "vehicles", label: "Vehicles", icon: Car },
  { key: "inspectors", label: "Inspectors", icon: ClipboardCheck },
  { key: "content", label: "Content", icon: Newspaper },
];

const orderTone = {
  inquiry_submitted: "info", quote_sent: "info", deposit_paid: "info", vehicle_purchased: "info",
  container_booked: "info", container_loaded: "info", at_sea: "info", arrived_port: "warning",
  customs_clearance: "warning", ready_for_delivery: "success", delivered: "success", cancelled: "danger",
};

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

function useLoad(fn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fn().then((res) => { if (!cancelled) { setData(res); setLoading(false); } });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reload]);
  return [data, loading, () => setReload((r) => r + 1)];
}

function Spinner() {
  return <div className="flex justify-center py-10"><Loader2 size={20} className="animate-spin text-electric" /></div>;
}

function Overview() {
  const [stats, loading] = useLoad(async () => {
    const [customers, activeImports, orders, inspections, activity] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
      supabase.from("import_orders").select("id", { count: "exact", head: true }).not("stage", "in", "(delivered,cancelled)"),
      supabase.from("import_orders").select("id"),
      supabase.from("inspections").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("import_orders").select("vehicle_label, stage, created_at").order("created_at", { ascending: false }).limit(4),
    ]);
    return {
      customers: customers.count || 0,
      activeImports: activeImports.count || 0,
      pendingInspections: inspections.count || 0,
      activity: activity.data || [],
    };
  });

  if (loading) return <Spinner />;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <KpiCard label="Total Customers" value={stats.customers} icon={Users} />
        <KpiCard label="Active Imports" value={stats.activeImports} icon={PackageCheck} />
        <KpiCard label="Pending Inspections" value={stats.pendingInspections} icon={TriangleAlert} />
        <KpiCard label="Revenue" value="—" sub="Connect payments to track" icon={Wallet} />
      </div>
      <Panel title="Recent Activity">
        <div className="divide-y divide-slate-100">
          {stats.activity.length === 0 && <p className="px-5 py-4 text-[13px] text-slate-400">No activity yet.</p>}
          {stats.activity.map((a, i) => (
            <div key={i} className="px-5 py-3.5 text-[13px] text-slate-500">
              {a.vehicle_label} — {a.stage.replaceAll("_", " ")}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Customers() {
  const [customers, loading, reload] = useLoad(async () => {
    const { data } = await supabase.from("profiles").select("*").eq("role", "customer").order("created_at", { ascending: false });
    return data || [];
  });
  const [query, setQuery] = useState("");

  async function toggleStatus(c) {
    const next = c.status === "active" ? "suspended" : "active";
    await supabase.from("profiles").update({ status: next }).eq("id", c.id);
    reload();
  }

  if (loading) return <Spinner />;
  const filtered = customers.filter((c) => c.full_name.toLowerCase().includes(query.toLowerCase()));

  return (
    <Panel title="All Customers" action={<SearchBox value={query} onChange={setQuery} placeholder="Search customers..." />}>
      <Table columns={["Name", "Email", "Status", ""]}>
        {filtered.map((c) => (
          <tr key={c.id}>
            <Td bold>{c.full_name}</Td>
            <Td>{c.email}</Td>
            <Td><Badge tone={c.status === "active" ? "success" : "danger"}>{c.status}</Badge></Td>
            <Td>
              <Button variant={c.status === "active" ? "danger" : "ghost"} onClick={() => toggleStatus(c)}>
                {c.status === "active" ? "Suspend" : "Reinstate"}
              </Button>
            </Td>
          </tr>
        ))}
        {filtered.length === 0 && <tr><Td colSpan={4}>No customers found.</Td></tr>}
      </Table>
    </Panel>
  );
}

function Imports() {
  const [orders, loading] = useLoad(async () => {
    const { data } = await supabase.from("import_orders").select("*, profiles(full_name)").order("created_at", { ascending: false });
    return data || [];
  });
  if (loading) return <Spinner />;

  return (
    <Panel title="All Import Orders">
      <Table columns={["Order", "Customer", "Vehicle", "Stage", "Progress", ""]}>
        {orders.map((o) => (
          <tr key={o.id}>
            <Td bold>{o.order_number}</Td>
            <Td>{o.profiles?.full_name || "—"}</Td>
            <Td>{o.vehicle_label}</Td>
            <Td><Badge tone={orderTone[o.stage] || "neutral"}>{o.stage.replaceAll("_", " ")}</Badge></Td>
            <Td>{o.progress}%</Td>
            <Td><Button variant="ghost">View</Button></Td>
          </tr>
        ))}
        {orders.length === 0 && <tr><Td colSpan={6}>No orders yet.</Td></tr>}
      </Table>
    </Panel>
  );
}

function Suppliers() {
  const [suppliers, loading, reload] = useLoad(async () => {
    const { data } = await supabase.from("suppliers").select("*, vehicles(count)").order("created_at", { ascending: false });
    return data || [];
  });

  async function toggle(s) {
    const next = s.status === "approved" ? "suspended" : "approved";
    await supabase.from("suppliers").update({ status: next }).eq("id", s.id);
    reload();
  }

  if (loading) return <Spinner />;
  return (
    <Panel title="Suppliers">
      <Table columns={["Company", "Vehicles Listed", "Rating", "Status", ""]}>
        {suppliers.map((s) => (
          <tr key={s.id}>
            <Td bold>{s.company_name}</Td>
            <Td>{s.vehicles?.[0]?.count ?? 0}</Td>
            <Td>{s.rating} / 5</Td>
            <Td><Badge tone={s.status === "approved" ? "success" : "warning"}>{s.status.replaceAll("_", " ")}</Badge></Td>
            <Td><Button variant={s.status === "approved" ? "ghost" : "primary"} onClick={() => toggle(s)}>{s.status === "approved" ? "Suspend" : "Approve"}</Button></Td>
          </tr>
        ))}
        {suppliers.length === 0 && <tr><Td colSpan={5}>No suppliers yet.</Td></tr>}
      </Table>
    </Panel>
  );
}

function Vehicles() {
  const [vehicles, loading, reload] = useLoad(async () => {
    const { data } = await supabase.from("vehicles").select("*").order("created_at", { ascending: false });
    return data || [];
  });

  async function toggleVerified(v) {
    await supabase.from("vehicles").update({ verified: !v.verified }).eq("id", v.id);
    reload();
  }

  if (loading) return <Spinner />;
  return (
    <Panel title="Marketplace Vehicles">
      <Table columns={["Vehicle", "Brand", "Price", "Verified", "Status", ""]}>
        {vehicles.map((v) => (
          <tr key={v.id}>
            <Td bold>{v.brand} {v.model}</Td>
            <Td>{v.brand}</Td>
            <Td>₦{Number(v.price).toLocaleString()}</Td>
            <Td>{v.verified ? <Badge tone="success">Verified</Badge> : <Badge tone="neutral">Unverified</Badge>}</Td>
            <Td><Badge tone={v.status === "live" ? "success" : "warning"}>{v.status.replaceAll("_", " ")}</Badge></Td>
            <Td><Button variant="ghost" onClick={() => toggleVerified(v)}>{v.verified ? "Unverify" : "Verify"}</Button></Td>
          </tr>
        ))}
        {vehicles.length === 0 && <tr><Td colSpan={6}>No vehicles yet.</Td></tr>}
      </Table>
    </Panel>
  );
}

function Inspectors() {
  const [inspectors, loading] = useLoad(async () => {
    const { data } = await supabase.from("inspectors").select("*, inspections(count)");
    return data || [];
  });
  if (loading) return <Spinner />;
  return (
    <Panel title="Inspectors">
      <Table columns={["Name", "Location", "Rating", ""]}>
        {inspectors.map((i) => (
          <tr key={i.id}>
            <Td bold>{i.full_name}</Td>
            <Td>{i.location}</Td>
            <Td>{i.rating} / 5</Td>
            <Td><Button variant="ghost">View Profile</Button></Td>
          </tr>
        ))}
        {inspectors.length === 0 && <tr><Td colSpan={4}>No inspectors yet.</Td></tr>}
      </Table>
    </Panel>
  );
}

function Content() {
  const [articles, loading, reload] = useLoad(async () => {
    const { data } = await supabase.from("articles").select("*").order("created_at", { ascending: false });
    return data || [];
  });

  async function togglePublish(a) {
    const next = a.status === "published" ? "draft" : "published";
    await supabase.from("articles").update({ status: next }).eq("id", a.id);
    reload();
  }

  if (loading) return <Spinner />;
  return (
    <Panel title="Content Hub">
      <Table columns={["Title", "Status", "Reads", ""]}>
        {articles.map((a) => (
          <tr key={a.id}>
            <Td bold>{a.title}</Td>
            <Td><Badge tone={a.status === "published" ? "success" : "neutral"}>{a.status}</Badge></Td>
            <Td>{a.reads.toLocaleString()}</Td>
            <Td><Button variant="ghost" onClick={() => togglePublish(a)}>{a.status === "published" ? "Unpublish" : "Publish"}</Button></Td>
          </tr>
        ))}
        {articles.length === 0 && <tr><Td colSpan={4}>No articles yet.</Td></tr>}
      </Table>
    </Panel>
  );
}

function SearchBox({ value, onChange, placeholder }) {
  return (
    <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
      <Search size={14} className="text-slate-400" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="bg-transparent outline-none text-[12.5px] placeholder:text-slate-400" />
    </div>
  );
}
