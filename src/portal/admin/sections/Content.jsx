import { useEffect, useState } from "react";
import { Plus, Eye, Trash2, Globe, FileText } from "lucide-react";
import { SectionPanel, SearchBar, DataTable, TR, TD, Chip, Btn, Spinner, EmptyState, Modal, Field, Input, Textarea, SaveBtn, Confirm, StatCard } from "../components/ui.jsx";
import { supabase } from "../../../lib/supabase.js";

const blank = { title: "", body: "", image_url: "", read_time: "5 min read", status: "draft" };

export default function Content({ toast }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("articles").select("*").order("created_at", { ascending: false });
    setArticles(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing.title.trim()) { toast.error("Title is required."); return; }
    setSaving(true);
    const { error } = isNew
      ? await supabase.from("articles").insert({ ...editing })
      : await supabase.from("articles").update({ ...editing }).eq("id", editing.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(isNew ? "Article created." : "Article updated.");
    setEditing(null);
    load();
  }

  async function togglePublish(a) {
    const next = a.status === "published" ? "draft" : "published";
    await supabase.from("articles").update({ status: next }).eq("id", a.id);
    toast.success(next === "published" ? "Article published." : "Article moved to draft.");
    load();
  }

  async function del(a) {
    await supabase.from("articles").delete().eq("id", a.id);
    toast.success("Article deleted.");
    setConfirm(null);
    load();
  }

  const filtered = articles.filter((a) => !query || a.title.toLowerCase().includes(query.toLowerCase()));
  const published = articles.filter((a) => a.status === "published").length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Articles" value={articles.length} icon={FileText} />
        <StatCard label="Published" value={published} tone="success" icon={Globe} />
        <StatCard label="Drafts" value={articles.length - published} tone="neutral" icon={FileText} />
      </div>

      <SectionPanel
        title="Content Hub"
        action={
          <>
            <SearchBar value={query} onChange={setQuery} placeholder="Search articles..." />
            <Btn variant="primary" onClick={() => { setEditing({ ...blank }); setIsNew(true); }}>
              <Plus size={13} className="inline mr-1" />New Article
            </Btn>
          </>
        }
      >
        {loading ? <Spinner /> : (
          <>
            <DataTable columns={["Title", "Status", "Reads", "Created", "Actions"]}>
              {filtered.map((a) => (
                <TR key={a.id}>
                  <TD bold className="max-w-xs truncate">{a.title}</TD>
                  <TD><Chip tone={a.status === "published" ? "success" : "neutral"}>{a.status}</Chip></TD>
                  <TD>{a.reads.toLocaleString()}</TD>
                  <TD>{new Date(a.created_at).toLocaleDateString()}</TD>
                  <TD>
                    <div className="flex gap-1.5">
                      <Btn onClick={() => { setEditing({ ...a }); setIsNew(false); }}><Eye size={12} /></Btn>
                      <Btn variant={a.status === "published" ? "ghost" : "success"} onClick={() => togglePublish(a)}>
                        {a.status === "published" ? "Unpublish" : "Publish"}
                      </Btn>
                      <Btn variant="danger" onClick={() => setConfirm(a)}><Trash2 size={12} /></Btn>
                    </div>
                  </TD>
                </TR>
              ))}
            </DataTable>
            {filtered.length === 0 && <EmptyState text="No articles found." />}
          </>
        )}
      </SectionPanel>

      {editing && (
        <Modal title={isNew ? "New Article" : `Edit — ${editing.title.slice(0, 40)}...`} onClose={() => setEditing(null)} width="max-w-2xl">
          <div className="space-y-4">
            <Field label="Title"><Input value={editing.title} onChange={(e) => setEditing((x) => ({ ...x, title: e.target.value }))} placeholder="Article title" /></Field>
            <Field label="Image URL"><Input value={editing.image_url} onChange={(e) => setEditing((x) => ({ ...x, image_url: e.target.value }))} placeholder="https://..." /></Field>
            {editing.image_url && (
              <img src={editing.image_url} alt="preview" className="w-full h-36 object-cover rounded-xl" onError={(e) => { e.target.style.display = "none"; }} />
            )}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Read Time"><Input value={editing.read_time} onChange={(e) => setEditing((x) => ({ ...x, read_time: e.target.value }))} placeholder="e.g. 5 min read" /></Field>
              <Field label="Status">
                <select value={editing.status} onChange={(e) => setEditing((x) => ({ ...x, status: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] outline-none">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </Field>
            </div>
            <Field label="Body Content" hint="Plain text or basic markdown.">
              <Textarea value={editing.body || ""} onChange={(e) => setEditing((x) => ({ ...x, body: e.target.value }))} rows={10} placeholder="Write the article body here..." />
            </Field>
            <SaveBtn saving={saving} label={isNew ? "Create Article" : "Save Changes"} onClick={save} />
          </div>
        </Modal>
      )}

      {confirm && (
        <Confirm title="Delete Article" message={`Delete "${confirm.title}"? This cannot be undone.`} danger confirmLabel="Delete" onConfirm={() => del(confirm)} onCancel={() => setConfirm(null)} />
      )}
    </div>
  );
}

