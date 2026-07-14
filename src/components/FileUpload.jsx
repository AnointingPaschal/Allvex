import { useRef, useState } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { supabase } from "../lib/supabase.js";

/**
 * FileUpload — uploads to Supabase Storage bucket "allvex-media".
 *
 * Props:
 *  value       string   current image URL (shows preview)
 *  onChange    fn(url)  called with the new public URL after upload
 *  folder      string   subfolder inside the bucket (default: "misc")
 *  accept      string   file accept string (default: "image/*")
 *  className   string   container class
 *  compact     bool     smaller version for tables / inline use
 */
export default function FileUpload({ value, onChange, folder = "misc", accept = "image/*", className = "", compact = false }) {
  const ref = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { setError("File must be under 8 MB."); return; }
    setError("");
    setUploading(true);

    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { data, error: upErr } = await supabase.storage.from("allvex-media").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (upErr) {
      if (upErr.message?.toLowerCase().includes("bucket")) {
        setError("Storage bucket not found. Go to Supabase → Storage → New Bucket, create 'allvex-media' (Public: ON), then run supabase/storage.sql.");
      } else if (upErr.message?.toLowerCase().includes("policy") || upErr.statusCode === "403") {
        setError("Upload permission denied. Run supabase/storage.sql in your Supabase SQL Editor to set access policies.");
      } else {
        setError(upErr.message || "Upload failed.");
      }
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("allvex-media").getPublicUrl(data.path);
    onChange(publicUrl);
    setUploading(false);
    e.target.value = "";
  }

  function clear(e) {
    e.stopPropagation();
    onChange("");
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {value ? (
          <div className="relative">
            <img src={value} alt="" className="w-16 h-12 rounded-lg object-cover border border-slate-200" onError={(e) => { e.target.style.display = "none"; }} />
            <button onClick={clear} className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-danger flex items-center justify-center"><X size={9} className="text-white" /></button>
          </div>
        ) : (
          <div className="w-16 h-12 rounded-lg bg-slate-100 flex items-center justify-center"><ImageIcon size={14} className="text-slate-400" /></div>
        )}
        <div>
          <input type="file" ref={ref} accept={accept} onChange={handleFile} className="hidden" />
          <button type="button" onClick={() => ref.current?.click()} disabled={uploading} className="tap flex items-center gap-1.5 text-[11.5px] font-semibold text-electric bg-blue-50 px-3 py-1.5 rounded-lg disabled:opacity-50">
            {uploading ? <Loader2 size={11} className="animate-spin" /> : <Upload size={11} />}
            {uploading ? "Uploading…" : "Upload"}
          </button>
          {error && <p className="text-[10.5px] text-danger mt-1 leading-snug max-w-[200px]">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <input type="file" ref={ref} accept={accept} onChange={handleFile} className="hidden" />
      <div
        onClick={() => !uploading && ref.current?.click()}
        className={`relative border-2 border-dashed rounded-xl overflow-hidden transition cursor-pointer ${uploading ? "border-electric bg-blue-50" : "border-slate-200 hover:border-electric hover:bg-blue-50/30"}`}
      >
        {value ? (
          <div className="relative">
            <img src={value} alt="" className="w-full h-36 object-cover" onError={(e) => { e.target.src = ""; }} />
            <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition flex items-center justify-center gap-2">
              <span className="text-white text-[12px] font-semibold bg-black/40 px-3 py-1.5 rounded-lg">Change image</span>
            </div>
            <button type="button" onClick={clear} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-danger flex items-center justify-center z-10">
              <X size={11} className="text-white" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-7 px-4 text-center">
            {uploading
              ? <Loader2 size={22} className="animate-spin text-electric mb-2" />
              : <Upload size={22} className="text-slate-400 mb-2" />}
            <p className="text-[12.5px] font-semibold text-slate-500">{uploading ? "Uploading…" : "Click to upload"}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WEBP — max 8 MB</p>
          </div>
        )}
      </div>
      {error && <p className="text-[11.5px] text-danger mt-1.5">{error}</p>}
    </div>
  );
}
