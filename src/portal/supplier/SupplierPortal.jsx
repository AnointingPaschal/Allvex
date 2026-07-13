import { useEffect, useState } from "react";
import DashboardLayout from "../DashboardLayout.jsx";
import { KpiCard, Badge, Panel, Table, Td, Button } from "../ui.jsx";
import { LayoutGrid, Warehouse, PackageCheck, MessageSquareQuote, Car, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { useAuth } from "../../context/AuthContext.jsx";

const sections = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "inventory", label: "Inventory", icon: Warehouse },
  { key: "orders", label: "Orders", icon: PackageCheck },
  { key: "quotes", label: "Quotations", icon: MessageSquareQuote },
];

function Spinner() {
  return <div className="flex justify-center py-10"><Loader2 size={20} className="animate-spin text-electric" /></div>;
}

export default function SupplierPortal() {
  const { profile } = useAuth();
  const [active, setActive] = useState("overview");
  const [showUpload, setShowUpload] = useState(false);
  const [company, setCompany] = useState(null);
  const [reload, setReload] = useState(0);
  const [form, setForm] = useState({ brand: "", model: "", year: "", price: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile?.supplier_id) return;
    supabase.from("suppliers").select("*").eq("id", profile.supplier_id).single().then(({ data }) => setCompany(data));
  }, [profile]);

  async function submitVehicle() {
    if (!form.brand.trim() || !form.model.trim() || !form.year || !form.price) return;
    setSaving(true);
    await supabase.from("vehicles").insert({
      supplier_id: profile.supplier_id,
      brand: form.brand.trim(),
      model: form.model.trim(),
      year: Number(form.year),
      price: Number(form.price),
      fuel: "Petrol",
      transmission: "Automatic",
      category: "Sedan",
      status: "pending_inspection",
      verified: false,
    });
    setSaving(false);
    setShowUpload(false);
    setForm({ brand: "", model: "", year: "", price: "" });
    setReload((r) => r + 1);
  }

  if (!profile?.supplier_id) {
    return (
      <DashboardLayout roleLabel="Supplier" roleColor="bg-warning text-midnight" sections={sections} active={active} onSelect={setActive} title="Supplier Portal">
        <Panel><div className="p-6 text-[13px] text-slate-400">This account isn't linked to a supplier company yet. Ask an administrator to link it.</div></Panel>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      roleLabel="Supplier"
      roleColor="bg-warning text-midnight"
      sections={sections}
      active={active}
      onSelect={setActive}
      title={sections.find((s) => s.key === active).label}
      subtitle={company?.company_name}
    >
      {active === "overview" && <Overview supplierId={profile.supplier_id} reloadKey={reload} />}
      {active === "inventory" && <Inventory supplierId={profile.supplier_id} onUpload={() => setShowUpload(true)} reloadKey={reload} />}
      {active === "orders" && <Orders supplierId={profile.supplier_id} reloadKey={reload} />}
      {active === "quotes" && <Quotes supplierId={profile.supplier_id} reloadKey={reload} />}

      {showUpload && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => !saving && setShowUpload(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-allvex w-[420px] p-6">
            <h3 className="text-[16px] font-bold text-midnight mb-4">Upload Vehicle</h3>
            <div className="flex flex-col gap-3">
              <input placeholder="Brand" value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[13px] outline-none" />
              <input placeholder="Model" value={form.model} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[13px] outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Year" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[13px] outline-none" />
                <input placeholder="Price (₦)" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[13px] outline-none" />
              </div>
              <p className="text-[11.5px] text-slate-400">New listings enter "Pending Inspection" until Allvex verifies them.</p>
              <div className="flex gap-3 mt-2">
                <Button variant="ghost" className="flex-1" onClick={() => setShowUpload(false)}>Cancel</Button>
                <Button className="flex-1" onClick={submitVehicle} disabled={saving}>{saving ? "Submitting..." : "Submit for Review"}</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function Overview({ supplierId, reloadKey }) {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    async function load() {
      const [vehicles, orders] = await Promise.all([
        supabase.from("vehicles").select("id", { count: "exact", head: true }).eq("supplier_id", supplierId),
        supabase.from("import_orders").select("id, vehicles!inner(supplier_id)").eq("vehicles.supplier_id", supplierId).not("stage", "in", "(delivered,cancelled)"),
      ]);
      setStats({ vehicles: vehicles.count || 0, orders: (orders.data || []).length });
    }
    load();
  }, [supplierId, reloadKey]);

  if (!stats) return <Spinner />;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
      <KpiCard label="Vehicles Listed" value={stats.vehicles} icon={Car} />
      <KpiCard label="Pending Orders" value={stats.orders} icon={PackageCheck} />
      <KpiCard label="Revenue" value="—" sub="Connect payments to track" icon={MessageSquareQuote} />
    </div>
  );
}

function Inventory({ supplierId, onUpload, reloadKey }) {
  const [vehicles, setVehicles] = useState(null);
  useEffect(() => {
    supabase.from("vehicles").select("*").eq("supplier_id", supplierId).order("created_at", { ascending: false })
      .then(({ data }) => setVehicles(data || []));
  }, [supplierId, reloadKey]);

  if (!vehicles) return <Spinner />;
  return (
    <Panel title="My Vehicles" action={<Button onClick={onUpload}>Upload Vehicle</Button>}>
      <Table columns={["Vehicle", "Year", "Price", "Status", ""]}>
        {vehicles.map((v) => (
          <tr key={v.id}>
            <Td bold>{v.brand} {v.model}</Td>
            <Td>{v.year}</Td>
            <Td>₦{Number(v.price).toLocaleString()}</Td>
            <Td><Badge tone={v.status === "live" ? "success" : "warning"}>{v.status.replaceAll("_", " ")}</Badge></Td>
            <Td><Button variant="ghost">Edit</Button></Td>
          </tr>
        ))}
        {vehicles.length === 0 && <tr><Td colSpan={5}>No vehicles listed yet.</Td></tr>}
      </Table>
    </Panel>
  );
}

function Orders({ supplierId, reloadKey }) {
  const [orders, setOrders] = useState(null);
  useEffect(() => {
    supabase.from("import_orders").select("*, vehicles!inner(supplier_id), profiles(full_name)").eq("vehicles.supplier_id", supplierId)
      .order("created_at", { ascending: false }).then(({ data }) => setOrders(data || []));
  }, [supplierId, reloadKey]);

  async function advance(o) {
    const next = o.stage === "vehicle_purchased" ? "container_booked" : "container_loaded";
    await supabase.from("import_orders").update({ stage: next }).eq("id", o.id);
    setOrders((os) => os.map((x) => (x.id === o.id ? { ...x, stage: next } : x)));
  }

  if (!orders) return <Spinner />;
  return (
    <Panel title="Incoming Orders">
      <Table columns={["Order", "Vehicle", "Customer", "Stage", ""]}>
        {orders.map((o) => (
          <tr key={o.id}>
            <Td bold>{o.order_number}</Td>
            <Td>{o.vehicle_label}</Td>
            <Td>{o.profiles?.full_name || "—"}</Td>
            <Td>{o.stage.replaceAll("_", " ")}</Td>
            <Td><Button onClick={() => advance(o)}>Update Shipment</Button></Td>
          </tr>
        ))}
        {orders.length === 0 && <tr><Td colSpan={5}>No orders yet.</Td></tr>}
      </Table>
    </Panel>
  );
}

function Quotes({ supplierId, reloadKey }) {
  const [quotes, setQuotes] = useState(null);
  useEffect(() => {
    supabase.from("quote_requests").select("*, vehicles!inner(supplier_id, brand, model), profiles(full_name)").eq("vehicles.supplier_id", supplierId)
      .order("created_at", { ascending: false }).then(({ data }) => setQuotes(data || []));
  }, [supplierId, reloadKey]);

  async function respond(q) {
    await supabase.from("quote_requests").update({ status: "responded" }).eq("id", q.id);
    setQuotes((qs) => qs.map((x) => (x.id === q.id ? { ...x, status: "responded" } : x)));
  }

  if (!quotes) return <Spinner />;
  return (
    <Panel title="Quotation Requests">
      <Table columns={["Vehicle", "Customer", "Budget", "Status", ""]}>
        {quotes.map((q) => (
          <tr key={q.id}>
            <Td bold>{q.vehicles?.brand} {q.vehicles?.model}</Td>
            <Td>{q.profiles?.full_name || q.full_name || "—"}</Td>
            <Td>{q.budget || "—"}</Td>
            <Td><Badge tone={q.status === "pending" ? "warning" : "success"}>{q.status}</Badge></Td>
            <Td><Button onClick={() => respond(q)} disabled={q.status !== "pending"}>Respond</Button></Td>
          </tr>
        ))}
        {quotes.length === 0 && <tr><Td colSpan={5}>No quote requests yet.</Td></tr>}
      </Table>
    </Panel>
  );
}
