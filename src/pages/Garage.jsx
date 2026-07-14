import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Gauge, ShieldCheck, X, Loader2, Camera, Trash2, Images } from "lucide-react";
import VehicleArt from "../components/VehicleArt.jsx";
import FileUpload from "../components/FileUpload.jsx";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";
import { pageCache } from "../lib/cache.js";

function healthColor(h) {
  if (h >= 85) return "text-success";
  if (h >= 60) return "text-warning";
  return "text-danger";
}

const emptyForm = {
  nickname: "", brand: "", model: "", year: "", color: "",
  plate: "", mileage: "", image_url: "", gallery_urls: [],
};

export default function Garage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const galleryInputRef = useRef(null);

  async function load() {
    if (!profile) return;
    // Show cached instantly
    const cached = pageCache.get(`garage-${profile.id}`);
    if (cached) { setVehicles(cached); setLoading(false); }

    const { data } = await supabase
      .from("garage_vehicles")
      .select("*, maintenance_reminders(*)")
      .eq("owner_id", profile.id)
      .order("created_at", { ascending: false });
    setVehicles(data || []);
    pageCache.set(`garage-${profile.id}`, data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [profile]);

  function nextServiceLabel(v) {
    const reminders = v.maintenance_reminders || [];
    if (reminders.length === 0) return "No reminders set";
    const overdue = reminders.find((r) => r.level === "overdue");
    const soonest = overdue || reminders.sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0];
    return `${soonest.title} · ${soonest.level === "overdue" ? "Overdue" : new Date(soonest.due_date).toLocaleDateString()}`;
  }

  async function handleGalleryFiles(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remaining = 6 - form.gallery_urls.length;
    const toUpload = files.slice(0, remaining);
    if (toUpload.length === 0) return;

    setGalleryUploading(true);
    const uploaded = [];

    for (const file of toUpload) {
      if (file.size > 8 * 1024 * 1024) continue;
      const ext = file.name.split(".").pop();
      const path = `garage-gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { data, error } = await supabase.storage.from("allvex-media").upload(path, file, { cacheControl: "3600", upsert: false });
      if (!error && data) {
        const { data: { publicUrl } } = supabase.storage.from("allvex-media").getPublicUrl(data.path);
        uploaded.push(publicUrl);
      }
    }

    setForm((f) => ({ ...f, gallery_urls: [...f.gallery_urls, ...uploaded] }));
    setGalleryUploading(false);
    e.target.value = "";
  }

  function removeGalleryImage(idx) {
    setForm((f) => ({ ...f, gallery_urls: f.gallery_urls.filter((_, i) => i !== idx) }));
  }

  async function submitAdd() {
    if (!form.nickname.trim() || !form.brand.trim() || !form.model.trim() || !form.year) return;
    setSaving(true);
    await supabase.from("garage_vehicles").insert({
      owner_id: profile.id,
      nickname: form.nickname.trim(),
      brand: form.brand.trim(),
      model: form.model.trim(),
      year: Number(form.year),
      color: form.color.trim() || null,
      plate: form.plate.trim() || null,
      mileage: Number(form.mileage) || 0,
      health_score: 100,
      insurance_status: "Not set",
      image_url: form.image_url || null,
      gallery_urls: form.gallery_urls,
    });
    setSaving(false);
    setShowAdd(false);
    setForm(emptyForm);
    load();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={22} className="animate-spin text-electric" />
      </div>
    );
  }

  return (
    <div>
      <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-3.5 bg-white sticky top-0 z-30 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h1 className="text-[17px] font-bold text-midnight">My Garage</h1>
          <p className="text-[11px] text-slate-400 mt-0.5">{vehicles.length} registered vehicles</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="tap w-9 h-9 rounded-xl bg-electric flex items-center justify-center">
          <Plus size={17} className="text-white" />
        </button>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 mt-3.5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {vehicles.map((v) => (
          <button key={v.id} onClick={() => navigate(`/garage/${v.id}`)} className="tap bg-white rounded-xl shadow-card overflow-hidden text-left">
            {/* Hero image — shows gallery if no main image */}
            {v.image_url ? (
              <div className="relative h-24 w-full">
                <img src={v.image_url} alt={v.nickname} className="w-full h-full object-cover" />
                {v.gallery_urls?.length > 0 && (
                  <span className="absolute bottom-1.5 right-1.5 flex items-center gap-1 bg-black/50 text-white text-[9.5px] font-semibold px-1.5 py-0.5 rounded-pill">
                    <Images size={9} /> +{v.gallery_urls.length}
                  </span>
                )}
              </div>
            ) : (
              <VehicleArt category={v.brand === "BYD" ? "Electric" : "SUV"} src={null} className="h-24 w-full" iconSize={26} />
            )}

            <div className="p-3.5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-midnight text-[13px]">{v.nickname}</p>
                  <p className="text-[10.5px] text-slate-400 mt-0.5">{v.brand} {v.model} · {v.year}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-[14px] font-bold ${healthColor(v.health_score)}`}>{v.health_score}%</p>
                  <p className="text-[9px] text-slate-400">Health</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="bg-slate-50 rounded-lg px-2.5 py-2 flex items-center gap-1.5">
                  <Gauge size={12} className="text-electric shrink-0" />
                  <span className="text-[10px] font-medium text-midnight truncate">{nextServiceLabel(v)}</span>
                </div>
                <div className="bg-slate-50 rounded-lg px-2.5 py-2 flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-electric shrink-0" />
                  <span className="text-[10px] font-medium text-midnight truncate">{v.insurance_status}</span>
                </div>
              </div>
            </div>
          </button>
        ))}

        <button onClick={() => setShowAdd(true)} className="tap border-2 border-dashed border-slate-200 rounded-xl py-8 flex flex-col items-center gap-2 text-slate-400 hover:border-electric hover:text-electric transition">
          <Plus size={18} />
          <span className="text-[12px] font-semibold">Register a vehicle</span>
        </button>
      </div>

      {/* Registration modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50" onClick={() => !saving && setShowAdd(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full sm:w-[480px] sm:rounded-2xl rounded-t-[28px] max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white rounded-t-[28px] sm:rounded-t-2xl flex items-center justify-between px-5 pt-5 pb-3.5 border-b border-slate-100 z-10">
              <h3 className="text-[16px] font-bold text-midnight">Register a Vehicle</h3>
              <button onClick={() => setShowAdd(false)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                <X size={15} className="text-slate-500" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4 pb-7">
              {/* Primary photo */}
              <div>
                <label className="text-[11.5px] font-semibold text-slate-400 uppercase tracking-wide block mb-2">Vehicle Photo</label>
                <FileUpload
                  value={form.image_url}
                  onChange={(url) => setForm((f) => ({ ...f, image_url: url }))}
                  folder="garage-main"
                />
              </div>

              {/* Gallery section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11.5px] font-semibold text-slate-400 uppercase tracking-wide">
                    Gallery Photos <span className="text-slate-300 font-normal normal-case">(optional, up to 6)</span>
                  </label>
                  {form.gallery_urls.length < 6 && (
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      disabled={galleryUploading}
                      className="tap flex items-center gap-1.5 text-[11.5px] font-semibold text-electric bg-blue-50 hover:bg-blue-100 transition px-2.5 py-1.5 rounded-lg disabled:opacity-50"
                    >
                      {galleryUploading
                        ? <><Loader2 size={11} className="animate-spin" /> Uploading…</>
                        : <><Camera size={11} /> Add Photos</>}
                    </button>
                  )}
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleGalleryFiles}
                  />
                </div>

                {form.gallery_urls.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={galleryUploading}
                    className="w-full border-2 border-dashed border-slate-200 rounded-xl py-5 flex flex-col items-center gap-2 text-slate-400 hover:border-electric hover:text-electric transition disabled:opacity-50"
                  >
                    <Camera size={20} />
                    <span className="text-[12px] font-medium">Add interior, exterior & detail shots</span>
                    <span className="text-[10.5px] text-slate-300">Up to 6 photos · PNG, JPG, WEBP</span>
                  </button>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {form.gallery_urls.map((url, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
                        <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeGalleryImage(i)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center"
                        >
                          <X size={10} className="text-white" />
                        </button>
                      </div>
                    ))}
                    {form.gallery_urls.length < 6 && (
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        disabled={galleryUploading}
                        className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-electric hover:text-electric transition disabled:opacity-50"
                      >
                        {galleryUploading
                          ? <Loader2 size={16} className="animate-spin" />
                          : <><Plus size={16} /><span className="text-[9.5px] font-medium">Add</span></>}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Details */}
              <div>
                <label className="text-[11.5px] font-semibold text-slate-400 uppercase tracking-wide block mb-2.5">Vehicle Details</label>
                <div className="space-y-2.5">
                  <FormInput
                    placeholder="Nickname (e.g. My Seal)"
                    value={form.nickname}
                    onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))}
                  />
                  <div className="grid grid-cols-2 gap-2.5">
                    <FormInput placeholder="Brand" value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} />
                    <FormInput placeholder="Model" value={form.model} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))} />
                    <FormInput placeholder="Year" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))} />
                    <FormInput placeholder="Color" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} />
                    <FormInput placeholder="Plate number" value={form.plate} onChange={(e) => setForm((f) => ({ ...f, plate: e.target.value }))} />
                    <FormInput placeholder="Mileage (km)" value={form.mileage} onChange={(e) => setForm((f) => ({ ...f, mileage: e.target.value }))} />
                  </div>
                </div>
              </div>

              <button
                onClick={submitAdd}
                disabled={saving || !form.nickname.trim() || !form.brand.trim() || !form.model.trim() || !form.year}
                className="tap w-full py-4 rounded-xl bg-electric text-white font-bold text-[14.5px] flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {saving && <Loader2 size={15} className="animate-spin" />}
                {saving ? "Registering…" : "Register Vehicle"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="h-4" />
    </div>
  );
}

function FormInput(props) {
  return (
    <input
      {...props}
      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-3 text-[13.5px] outline-none focus:border-electric focus:ring-2 focus:ring-electric/10 transition placeholder:text-slate-300"
    />
  );
}
