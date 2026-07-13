import { useEffect, useState } from "react";
import { Plus, Trash2, Eye, ShoppingBag, Package, AlertTriangle } from "lucide-react";
import { SectionPanel, SearchBar, DataTable, TR, TD, Chip, Btn, Spinner, EmptyState, Modal, Field, Input, SaveBtn, Confirm, StatCard } from "../components/ui.jsx";
import { supabase } from "../../../lib/supabase.js";
import FileUpload from "../../../components/FileUpload.jsx";

const blank = { name: "", price: "", rating: "4.5", image_url: "", stock: "" };

export default function Accessories({ toast }) {
  const [accessories, setAccessories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [tab, setTab] = useState("products");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);

  async function loadProducts() {
    setLoading(true);
    const { data } = await supabase.from("accessories").select("*").order("created_at", { ascending: false });
    setAccessories(data || []);
    setLoading(false);
  }

  async function loadOrders() {
    setOrdersLoading(true);
    const { data } = await supabase
      .from("accessory_orders")
      .select("id, total, status, created_at, customer_id, profiles(full_name)")
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      const orderIds = data.map((o) => o.id);
      const { data: items } = await supabase
        .from("accessory_order_items")
        .select("order_id, quantity, unit_price, accessories(name)")
        .in("order_id", orderIds);

      const itemsByOrder = {};
      (items || []).forEach((i) => {
        if (!itemsByOrder[i.order_id]) itemsByOrder[i.order_id] = [];
        itemsByOrder[i.order_id].push(i);
      });

      setOrders(data.map((o) => ({ ...o, items: itemsByOrder[o.id] || [] })));
    } else {
      setOrders([]);
    }
    setOrdersLoading(false);
  }

  useEffect(() => { loadProducts(); loadOrders(); }, []);

  async function save() {
    if (!editing.name.trim() || !editing.price) { toast.error("Name and price are required."); return; }
    setSaving(true);
    const payload = {
      name: editing.name.trim(),
      price: Number(editing.price),
      rating: Number(editing.rating) || 0,
      image_url: editing.image_url || null,
      stock: Number(editing.stock) || 0,
    };
    const { error } = isNew
      ? await supabase.from("accessories").insert(payload)
      : await supabase.from("accessories").update(payload).eq("id", editing.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(isNew ? "Product added." : "Product updated.");
    setEditing(null);
    loadProducts();
  }

  async function del(a) {
    await supabase.from("accessories").delete().eq("id", a.id);
    toast.success("Product deleted.");
    setConfirm(null);
    loadProducts();
  }

  async function updateStock(id, delta) {
    const acc = accessories.find((a) => a.id === id);
    if (!acc) return;
    const next = Math.max(0, acc.stock + delta);
    await supabase.from("accessories").update({ stock: next }).eq("id", id);
    setAccessories((list) => list.map((a) => a.id === id ? { ...a, stock: next } : a));
  }

  async function updateOrderStatus(orderId, status) {
    await supabase.from("accessory_orders").update({ status }).eq("id", orderId);
    toast.success(`Order marked ${status}.`);
    loadOrders();
  }

  const filteredAcc = accessories.filter((a) => !query || a.name.toLowerCase().includes(query.toLowerCase()));
  const filteredOrders = orders.filter((o) => !query || o.profiles?.full_name?.toLowerCase().includes(query.toLowerCase()));
  const lowStock = accessories.filter((a) => a.stock > 0 && a.stock < 5).length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Products" value={accessories.length} icon={ShoppingBag} />
        <StatCard label="Orders" value={orders.length} icon={Package} />
        <StatCard label="Low Stock" value={lowStock} tone={lowStock > 0 ? "warning" : "success"} icon={AlertTriangle} />
      </div>

      <div className="flex gap-2">
        <Btn variant={tab === "products" ? "dark" : "ghost"} onClick={() => setTab("products")}>Products</Btn>
        <Btn variant={tab === "orders" ? "dark" : "ghost"} onClick={() => setTab("orders")}>Customer Orders</Btn>
      </div>

      {tab === "products" && (
        <SectionPanel
          title="Accessories"
          action={
            <>
              <SearchBar value={query} onChange={setQuery} placeholder="Search product..." />
              <Btn variant="primary" onClick={() => { setEditing({ ...blank }); setIsNew(true); }}>
                <Plus size={13} className="inline mr-1" />Add Product
              </Btn>
            </>
          }
        >
          {loading ? <Spinner /> : (
            <>
              <DataTable columns={["Product", "Price", "Rating", "Stock", "Actions"]}>
                {filteredAcc.map((a) => (
                  <TR key={a.id}>
                    <TD bold>
                      <div className="flex items-center gap-2.5">
                        {a.image_url && <img src={a.image_url} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" onError={(e) => { e.target.style.display = "none"; }} />}
                        {a.name}
                      </div>
                    </TD>
                    <TD>₦{Number(a.price).toLocaleString()}</TD>
                    <TD>{Number(a.rating).toFixed(1)}/5</TD>
                    <TD>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => updateStock(a.id, -1)} className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-midnight text-sm font-bold">−</button>
                        <span className={`min-w-[2rem] text-center text-[12.5px] font-semibold ${a.stock === 0 ? "text-danger" : a.stock < 5 ? "text-warning" : "text-midnight"}`}>{a.stock}</span>
                        <button onClick={() => updateStock(a.id, 1)} className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-midnight text-sm font-bold">+</button>
                        {a.stock === 0 && <Chip tone="danger">Out</Chip>}
                        {a.stock > 0 && a.stock < 5 && <Chip tone="warning">Low</Chip>}
                      </div>
                    </TD>
                    <TD>
                      <div className="flex gap-1.5">
                        <Btn onClick={() => { setEditing({ ...a, price: String(a.price), rating: String(a.rating), stock: String(a.stock) }); setIsNew(false); }}><Eye size={12} /></Btn>
                        <Btn variant="danger" onClick={() => setConfirm(a)}><Trash2 size={12} /></Btn>
                      </div>
                    </TD>
                  </TR>
                ))}
              </DataTable>
              {filteredAcc.length === 0 && <EmptyState text="No products found." />}
            </>
          )}
        </SectionPanel>
      )}

      {tab === "orders" && (
        <SectionPanel title="Customer Orders" action={<SearchBar value={query} onChange={setQuery} placeholder="Search customer..." />}>
          {ordersLoading ? <Spinner /> : (
            <>
              <DataTable columns={["Customer", "Items", "Total", "Status", "Placed", "Actions"]}>
                {filteredOrders.map((o) => (
                  <TR key={o.id}>
                    <TD bold>{o.profiles?.full_name || "—"}</TD>
                    <TD className="max-w-[200px] truncate">
                      {o.items.length > 0
                        ? o.items.map((i) => `${i.accessories?.name || "Item"} ×${i.quantity}`).join(", ")
                        : "—"}
                    </TD>
                    <TD>₦{Number(o.total).toLocaleString()}</TD>
                    <TD><Chip tone={o.status === "delivered" ? "success" : o.status === "shipped" ? "info" : "warning"}>{o.status}</Chip></TD>
                    <TD>{new Date(o.created_at).toLocaleDateString()}</TD>
                    <TD>
                      <div className="flex gap-1.5">
                        {o.status === "placed" && <Btn variant="success" onClick={() => updateOrderStatus(o.id, "shipped")}>Ship</Btn>}
                        {o.status === "shipped" && <Btn variant="success" onClick={() => updateOrderStatus(o.id, "delivered")}>Deliver</Btn>}
                        {o.status === "delivered" && <Chip tone="success">Done</Chip>}
                      </div>
                    </TD>
                  </TR>
                ))}
              </DataTable>
              {filteredOrders.length === 0 && <EmptyState text="No orders found." />}
            </>
          )}
        </SectionPanel>
      )}

      {editing && (
        <Modal title={isNew ? "Add Product" : `Edit — ${editing.name}`} onClose={() => setEditing(null)}>
          <div className="space-y-3">
            <Field label="Product Name"><Input value={editing.name} onChange={(e) => setEditing((x) => ({ ...x, name: e.target.value }))} /></Field>
            <Field label="Price (₦)"><Input type="number" value={editing.price} onChange={(e) => setEditing((x) => ({ ...x, price: e.target.value }))} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Rating (0–5)"><Input type="number" min={0} max={5} step={0.1} value={editing.rating} onChange={(e) => setEditing((x) => ({ ...x, rating: e.target.value }))} /></Field>
              <Field label="Stock Quantity"><Input type="number" min={0} value={editing.stock} onChange={(e) => setEditing((x) => ({ ...x, stock: e.target.value }))} /></Field>
            </div>
            <Field label="Product Image">
              <FileUpload value={editing.image_url} onChange={(url) => setEditing((x) => ({ ...x, image_url: url }))} folder="accessories" />
            </Field>
            <SaveBtn saving={saving} label={isNew ? "Add Product" : "Save"} onClick={save} />
          </div>
        </Modal>
      )}

      {confirm && (
        <Confirm title="Delete Product" message={`Delete "${confirm.name}"? This cannot be undone.`} danger confirmLabel="Delete" onConfirm={() => del(confirm)} onCancel={() => setConfirm(null)} />
      )}
    </div>
  );
}
