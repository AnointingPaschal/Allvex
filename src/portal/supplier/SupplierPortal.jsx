import { useState } from "react";
import DashboardLayout from "../DashboardLayout.jsx";
import { KpiCard, Badge, Panel, Table, Td, Button } from "../ui.jsx";
import { LayoutGrid, Warehouse, PackageCheck, MessageSquareQuote, Car, Wallet } from "lucide-react";
import { supplierInventory, supplierOrders, supplierQuotes } from "../../data/portalMock.js";

const sections = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "inventory", label: "Inventory", icon: Warehouse },
  { key: "orders", label: "Orders", icon: PackageCheck },
  { key: "quotes", label: "Quotations", icon: MessageSquareQuote },
];

export default function SupplierPortal() {
  const [active, setActive] = useState("overview");
  const [showUpload, setShowUpload] = useState(false);

  return (
    <DashboardLayout
      roleLabel="Supplier"
      roleColor="bg-warning text-midnight"
      sections={sections}
      active={active}
      onSelect={setActive}
      title={sections.find((s) => s.key === active).label}
      subtitle="Guangzhou Auto Trading Co."
    >
      {active === "overview" && (
        <div className="grid grid-cols-3 gap-4">
          <KpiCard label="Vehicles Listed" value="24" icon={Car} />
          <KpiCard label="Pending Orders" value="2" icon={PackageCheck} />
          <KpiCard label="Revenue (MTD)" value="₦96.4m" sub="+12% vs last month" icon={Wallet} />
        </div>
      )}

      {active === "inventory" && (
        <Panel title="My Vehicles" action={<Button onClick={() => setShowUpload(true)}>Upload Vehicle</Button>}>
          <Table columns={["Vehicle", "Year", "Price", "Status", "Orders", ""]}>
            {supplierInventory.map((v) => (
              <tr key={v.id}>
                <Td bold>{v.name}</Td>
                <Td>{v.year}</Td>
                <Td>{v.price}</Td>
                <Td><Badge tone={v.status === "Listed" ? "success" : "warning"}>{v.status}</Badge></Td>
                <Td>{v.orders}</Td>
                <Td><Button variant="ghost">Edit</Button></Td>
              </tr>
            ))}
          </Table>
        </Panel>
      )}

      {active === "orders" && (
        <Panel title="Incoming Orders">
          <Table columns={["Order", "Vehicle", "Customer", "Stage", ""]}>
            {supplierOrders.map((o) => (
              <tr key={o.id}>
                <Td bold>{o.id}</Td>
                <Td>{o.vehicle}</Td>
                <Td>{o.customer}</Td>
                <Td>{o.stage}</Td>
                <Td><Button>{o.action}</Button></Td>
              </tr>
            ))}
          </Table>
        </Panel>
      )}

      {active === "quotes" && (
        <Panel title="Quotation Requests">
          <Table columns={["Vehicle", "Customer", "Budget", "Status", ""]}>
            {supplierQuotes.map((q) => (
              <tr key={q.id}>
                <Td bold>{q.vehicle}</Td>
                <Td>{q.customer}</Td>
                <Td>{q.budget}</Td>
                <Td><Badge tone="warning">{q.status}</Badge></Td>
                <Td><Button>Respond</Button></Td>
              </tr>
            ))}
          </Table>
        </Panel>
      )}

      {showUpload && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowUpload(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-allvex w-[420px] p-6">
            <h3 className="text-[16px] font-bold text-midnight mb-4">Upload Vehicle</h3>
            <div className="flex flex-col gap-3">
              <input placeholder="Brand & model" className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[13px] outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Year" className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[13px] outline-none" />
                <input placeholder="Price (₦)" className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[13px] outline-none" />
              </div>
              <input placeholder="VIN" className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[13px] outline-none" />
              <button className="tap w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-[12.5px] text-slate-400 font-medium">
                Upload photos & spec sheet
              </button>
              <div className="flex gap-3 mt-2">
                <Button variant="ghost" className="flex-1" onClick={() => setShowUpload(false)}>Cancel</Button>
                <Button className="flex-1" onClick={() => setShowUpload(false)}>Submit for Review</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
