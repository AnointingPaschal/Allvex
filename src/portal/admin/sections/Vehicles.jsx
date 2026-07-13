import { useEffect, useState } from "react";
import { Plus, Eye, Trash2, BadgeCheck, Image } from "lucide-react";
import { SectionPanel, SearchBar, DataTable, TR, TD, Chip, Btn, Spinner, EmptyState, Modal, Field, Input, Select, Textarea, SaveBtn, Confirm, StatCard } from "../components/ui.jsx";
import FileUpload from "../../../components/FileUpload.jsx";
import { supabase } from "../../../lib/supabase.js";
import { Car } from "lucide-react";

const CATEGORIES = ["SUV", "Sedan", "Electric", "Pickup", "Luxury"];
const FUELS = ["Petrol", "Diesel", "Electric", "Hybrid"];
const TRANSMISSIONS = ["Automatic", "Manual"];
const STATUSES = ["live", "pending_inspection", "unlisted"];

const blankVehicle = {
  brand: "", model: "", year: new Date().getFullYear(), fuel: "Petrol", transmission: "Automatic",
  mileage: 0, condition: "new", price: "", delivery_estimate: "", category: "SUV", score: "",
  status: "pending_inspection", verified: false,
  specs: { engine: "", battery: "—", hp: "", range: "—", seats: 5, drive: "FWD" },
  performance: { accel: "", topSpeed: "", charge: "—" },
  ownership: { insurance: "", maintenance: "", running: "" },
  features: "",
  supplier_id: "",
};

export default function Vehicles({ toast }) {
  const [vehicles, setVehicles] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editing, setEditing] = useState(null); // vehicle obj or null
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [imageModal, setImageModal] = useState(null); // vehicle
  const [images, setImages] = useState([]);
  const [newImage, setNewImage] = useState({ url: "", category: "exterior", label: "" });
  const [addingImage, setAddingImage] = useState(false);

  async function load() {
    setLoading(true);
    const [vRes, sRes] = await Promise.all([
      supabase.from("vehicles").select("*, suppliers(company_name)").order("created_at", { ascending: false }),
      supabase.from("suppliers").select("id, company_name").eq("status", "approved"),
    ]);
    setVehicles(vRes.data || []);
    setSuppliers(sRes.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = vehicles.filter((v) => {
    const q = query.toLowerCase();
    const matchQ = !q || `${v.brand} ${v.model}`.toLowerCase().includes(q);
    const matchC = catFilter === "all" || v.category === catFilter;
    const matchS = statusFilter === "all" || v.status === statusFilter;
    return matchQ && matchC && matchS;
  });

  function openNew() {
    setEditing({ ...blankVehicle });
    setIsNew(true);
  }

  function openEdit(v) {
    setEditing({
      ...v,
      features: Array.isArray(v.features) ? v.features.join(", ") : (v.features || ""),
      specs: { ...blankVehicle.specs, ...(v.specs || {}) },
      performance: { ...blankVehicle.performance, ...(v.performance || {}) },
      ownership: { ...blankVehicle.ownership, ...(v.ownership || {}) },
    });
    setIsNew(false);
  }

  function setField(path, value) {
    setEditing((e) => {
      if (!path.includes(".")) return { ...e, [path]: value };
      const [section, key] = path.split(".");
      return { ...e, [section]: { ...e[section], [key]: value } };
    });
  }

  async function save() {
    if (!editing.brand.trim() || !editing.model.trim() || !editing.price) { toast.error("Brand, model and price are required."); return; }
    setSaving(true);
    const payload = {
      ...editing,
      year: Number(editing.year),
      price: Number(editing.price),
      mileage: Number(editing.mileage) || 0,
      score: Number(editing.score) || null,
      features: editing.features.split(",").map((f) => f.trim()).filter(Boolean),
      specs: editing.specs,
      performance: editing.performance,
      ownership: {
        insurance: Number(editing.ownership.insurance) || 0,
        maintenance: Number(editing.ownership.maintenance) || 0,
        running: Number(editing.ownership.running) || 0,
      },
      supplier_id: editing.supplier_id || null,
    };

    let error;
    if (isNew) {
      ({ error } = await supabase.from("vehicles").insert(payload));
    } else {
      ({ error } = await supabase.from("vehicles").update(payload).eq("id", editing.id));
    }

    setSaving(false);
    if (error) { toast.error("Error: " + error.message); return; }
    toast.success(isNew ? "Vehicle added." : "Vehicle updated.");
    setEditing(null);
    load();
  }

  async function toggleVerify(v) {
    await supabase.from("vehicles").update({ verified: !v.verified, status: !v.verified ? "live" : v.status }).eq("id", v.id);
    toast.success(v.verified ? "Verification removed." : "Vehicle verified and set live.");
    load();
  }

  async function deleteVehicle(v) {
    await supabase.from("vehicles").delete().eq("id", v.id);
    toast.success("Vehicle deleted.");
    setConfirm(null);
    load();
  }

  async function openImages(v) {
    setImageModal(v);
    const { data } = await supabase.from("vehicle_images").select("*").eq("vehicle_id", v.id).order("position");
    setImages(data || []);
  }

  async function addImage() {
    if (!newImage.url.trim()) return;
    setAddingImage(true);
    const position = images.length;
    await supabase.from("vehicle_images").insert({ vehicle_id: imageModal.id, ...newImage, position });
    const { data } = await supabase.from("vehicle_images").select("*").eq("vehicle_id", imageModal.id).order("position");
    setImages(data || []);
    setNewImage({ url: "", category: "exterior", label: "" });
    setAddingImage(false);
    toast.success("Image added.");
  }

  async function deleteImage(id) {
    await supabase.from("vehicle_images").delete().eq("id", id);
    setImages((imgs) => imgs.filter((i) => i.id !== id));
    toast.success("Image removed.");
  }

  const live = vehicles.filter((v) => v.status === "live").length;
  const pending = vehicles.filter((v) => v.status === "pending_inspection").length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Vehicles" value={vehicles.length} icon={Car} />
        <StatCard label="Live" value={live} tone="success" icon={Car} />
        <StatCard label="Pending Inspection" value={pending} tone="warning" icon={Car} />
      </div>

      <SectionPanel
        title="Marketplace Vehicles"
        action={
          <>
            <SearchBar value={query} onChange={setQuery} placeholder="Search brand or model...">
              <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] outline-none">
                <option value="all">All categories</option>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] outline-none">
                <option value="all">All statuses</option>
                {STATUSES.map((s) => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}
              </select>
            </SearchBar>
            <Btn variant="primary" onClick={openNew}><Plus size={13} className="inline mr-1" />Add Vehicle</Btn>
          </>
        }
      >
        {loading ? <Spinner /> : (
          <>
            <DataTable columns={["Vehicle", "Category", "Price", "Supplier", "Score", "Status", "Verified", "Actions"]}>
              {filtered.map((v) => (
                <TR key={v.id}>
                  <TD bold>{v.brand} {v.model} ({v.year})</TD>
                  <TD><Chip tone="neutral">{v.category}</Chip></TD>
                  <TD>₦{Number(v.price).toLocaleString()}</TD>
                  <TD>{v.suppliers?.company_name || "—"}</TD>
                  <TD>{v.score ? `${v.score}/100` : "—"}</TD>
                  <TD><Chip tone={v.status === "live" ? "success" : "warning"}>{v.status.replaceAll("_", " ")}</Chip></TD>
                  <TD><Chip tone={v.verified ? "success" : "neutral"}>{v.verified ? "Verified" : "Unverified"}</Chip></TD>
                  <TD>
                    <div className="flex gap-1.5">
                      <Btn onClick={() => openEdit(v)}><Eye size={12} /></Btn>
                      <Btn onClick={() => openImages(v)} title="Manage images"><Image size={12} /></Btn>
                      <Btn variant={v.verified ? "ghost" : "success"} onClick={() => toggleVerify(v)}>
                        <BadgeCheck size={12} />
                      </Btn>
                      <Btn variant="danger" onClick={() => setConfirm(v)}><Trash2 size={12} /></Btn>
                    </div>
                  </TD>
                </TR>
              ))}
            </DataTable>
            {filtered.length === 0 && <EmptyState text="No vehicles found." />}
          </>
        )}
      </SectionPanel>

      {/* Vehicle edit/add modal */}
      {editing && (
        <Modal title={isNew ? "Add Vehicle" : `Edit — ${editing.brand} ${editing.model}`} onClose={() => setEditing(null)} width="max-w-2xl">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Brand"><Input value={editing.brand} onChange={(e) => setField("brand", e.target.value)} placeholder="e.g. BYD" /></Field>
              <Field label="Model"><Input value={editing.model} onChange={(e) => setField("model", e.target.value)} placeholder="e.g. Seal Premium" /></Field>
              <Field label="Year"><Input type="number" value={editing.year} onChange={(e) => setField("year", e.target.value)} /></Field>
              <Field label="Price (₦)"><Input type="number" value={editing.price} onChange={(e) => setField("price", e.target.value)} /></Field>
              <Field label="Category">
                <Select value={editing.category} onChange={(e) => setField("category", e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </Select>
              </Field>
              <Field label="Fuel">
                <Select value={editing.fuel} onChange={(e) => setField("fuel", e.target.value)}>
                  {FUELS.map((f) => <option key={f}>{f}</option>)}
                </Select>
              </Field>
              <Field label="Transmission">
                <Select value={editing.transmission} onChange={(e) => setField("transmission", e.target.value)}>
                  {TRANSMISSIONS.map((t) => <option key={t}>{t}</option>)}
                </Select>
              </Field>
              <Field label="Condition">
                <Select value={editing.condition} onChange={(e) => setField("condition", e.target.value)}>
                  <option value="new">New</option>
                  <option value="used">Used</option>
                </Select>
              </Field>
              <Field label="Status">
                <Select value={editing.status} onChange={(e) => setField("status", e.target.value)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}
                </Select>
              </Field>
              <Field label="Allvex Score (0-100)"><Input type="number" min={0} max={100} value={editing.score} onChange={(e) => setField("score", e.target.value)} /></Field>
              <Field label="Delivery Estimate"><Input value={editing.delivery_estimate} onChange={(e) => setField("delivery_estimate", e.target.value)} placeholder="e.g. 35–45 Days" /></Field>
              <Field label="Supplier">
                <Select value={editing.supplier_id || ""} onChange={(e) => setField("supplier_id", e.target.value)}>
                  <option value="">No supplier</option>
                  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.company_name}</option>)}
                </Select>
              </Field>
            </div>

            <p className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wide pt-1">Specifications</p>
            <div className="grid grid-cols-3 gap-3">
              {["engine", "hp", "seats", "drive", "battery", "range"].map((k) => (
                <Field key={k} label={k.charAt(0).toUpperCase() + k.slice(1)}>
                  <Input value={editing.specs[k] ?? ""} onChange={(e) => setField(`specs.${k}`, e.target.value)} />
                </Field>
              ))}
            </div>

            <p className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wide pt-1">Performance</p>
            <div className="grid grid-cols-3 gap-3">
              {["accel", "topSpeed", "charge"].map((k) => (
                <Field key={k} label={k}>
                  <Input value={editing.performance[k] ?? ""} onChange={(e) => setField(`performance.${k}`, e.target.value)} />
                </Field>
              ))}
            </div>

            <p className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wide pt-1">Annual Ownership Cost (₦)</p>
            <div className="grid grid-cols-3 gap-3">
              {["insurance", "maintenance", "running"].map((k) => (
                <Field key={k} label={k}>
                  <Input type="number" value={editing.ownership[k] ?? ""} onChange={(e) => setField(`ownership.${k}`, e.target.value)} />
                </Field>
              ))}
            </div>

            <Field label="Key Features (comma-separated)">
              <Textarea value={editing.features} onChange={(e) => setField("features", e.target.value)} rows={2} placeholder="Adaptive Cruise, Panoramic Roof, Wireless Charging..." />
            </Field>

            <label className="flex items-center gap-2.5">
              <input type="checkbox" checked={editing.verified} onChange={(e) => setField("verified", e.target.checked)} className="accent-electric w-4 h-4" />
              <span className="text-[12.5px] font-medium text-midnight">Mark as Verified by Allvex</span>
            </label>

            <SaveBtn saving={saving} label={isNew ? "Add Vehicle" : "Save Changes"} onClick={save} />
          </div>
        </Modal>
      )}

      {/* Image management modal */}
      {imageModal && (
        <Modal title={`Images — ${imageModal.brand} ${imageModal.model}`} onClose={() => setImageModal(null)} width="max-w-lg">
          <div className="space-y-3">
            {images.map((img) => (
              <div key={img.id} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                <img src={img.url} alt={img.label} className="w-16 h-12 rounded-lg object-cover shrink-0" onError={(e) => { e.target.style.display = "none"; }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] font-semibold text-midnight truncate">{img.label || "Untitled"}</p>
                  <p className="text-[11px] text-slate-400">{img.category}</p>
                </div>
                <Btn variant="danger" onClick={() => deleteImage(img.id)}><Trash2 size={12} /></Btn>
              </div>
            ))}
            {images.length === 0 && <p className="text-[12.5px] text-slate-400">No images yet.</p>}

            <div className="border-t border-slate-100 pt-3 space-y-2.5">
              <p className="text-[12px] font-semibold text-midnight">Add Image</p>
              <Field label="Image">
                <FileUpload value={newImage.url} onChange={(url) => setNewImage((n) => ({ ...n, url }))} folder="vehicles" compact />
              </Field>
              <div className="grid grid-cols-2 gap-2.5">
                <Field label="Category">
                  <Select value={newImage.category} onChange={(e) => setNewImage((n) => ({ ...n, category: e.target.value }))}>
                    <option value="exterior">Exterior</option>
                    <option value="interior">Interior</option>
                    <option value="engine">Engine</option>
                  </Select>
                </Field>
                <Field label="Label">
                  <Input value={newImage.label} onChange={(e) => setNewImage((n) => ({ ...n, label: e.target.value }))} placeholder="e.g. Front" />
                </Field>
              </div>
              <SaveBtn saving={addingImage} label="Add Image" onClick={addImage} disabled={!newImage.url.trim()} />
            </div>
          </div>
        </Modal>
      )}

      {confirm && (
        <Confirm
          title="Delete Vehicle"
          message={`This will permanently delete ${confirm.brand} ${confirm.model} and all its images. This cannot be undone.`}
          danger
          confirmLabel="Delete"
          onConfirm={() => deleteVehicle(confirm)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
