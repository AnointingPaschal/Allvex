import { useEffect, useState } from "react";
import { Bell, Send, Users, User } from "lucide-react";
import { SectionPanel, DataTable, TR, TD, Chip, Btn, Spinner, EmptyState, Field, Input, Textarea, SaveBtn, StatCard } from "../components/ui.jsx";
import { supabase } from "../../../lib/supabase.js";

export default function Notifications({ toast }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState("all"); // all | customer | specific
  const [specificEmail, setSpecificEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("notifications")
      .select("*, profiles(full_name)")
      .order("created_at", { ascending: false })
      .limit(30);
    setRecent(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function send() {
    if (!title.trim() || !body.trim()) { toast.error("Title and body are required."); return; }
    setSending(true);

    let userIds = [];

    if (target === "all") {
      const { data } = await supabase.from("profiles").select("id").eq("role", "customer");
      userIds = (data || []).map((p) => p.id);
    } else if (target === "customers") {
      const { data } = await supabase.from("profiles").select("id").eq("role", "customer").eq("status", "active");
      userIds = (data || []).map((p) => p.id);
    } else if (target === "specific") {
      if (!specificEmail.trim()) { toast.error("Enter a specific email address."); setSending(false); return; }
      const { data } = await supabase.from("profiles").select("id").eq("email", specificEmail.trim()).single();
      if (!data) { toast.error("No user found with that email."); setSending(false); return; }
      userIds = [data.id];
    }

    if (userIds.length === 0) { toast.error("No matching users found."); setSending(false); return; }

    const rows = userIds.map((user_id) => ({ user_id, title: title.trim(), body: body.trim() }));
    const { error } = await supabase.from("notifications").insert(rows);
    setSending(false);

    if (error) { toast.error(error.message); return; }
    toast.success(`Notification sent to ${userIds.length} user${userIds.length > 1 ? "s" : ""}.`);
    setTitle("");
    setBody("");
    setSpecificEmail("");
    load();
  }

  const unread = recent.filter((n) => !n.read).length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Notifications Sent (recent 30)" value={recent.length} icon={Bell} />
        <StatCard label="Unread" value={unread} icon={Bell} tone="warning" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Send form */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <p className="text-[14px] font-bold text-midnight mb-4">Send Notification</p>
          <div className="space-y-3.5">
            <Field label="Title">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Import Update" />
            </Field>
            <Field label="Message">
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="Your notification message..." />
            </Field>
            <Field label="Recipients">
              <div className="flex flex-col gap-2 mt-1">
                {[
                  { v: "all", l: "All users", icon: Users },
                  { v: "customers", l: "Active customers only", icon: Users },
                  { v: "specific", l: "Specific user by email", icon: User },
                ].map((opt) => (
                  <label key={opt.v} className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border cursor-pointer ${target === opt.v ? "border-electric bg-blue-50" : "border-slate-200 bg-white"}`}>
                    <input type="radio" value={opt.v} checked={target === opt.v} onChange={(e) => setTarget(e.target.value)} className="accent-electric" />
                    <opt.icon size={14} className="text-slate-400" />
                    <span className="text-[12.5px] font-medium text-midnight">{opt.l}</span>
                  </label>
                ))}
              </div>
            </Field>
            {target === "specific" && (
              <Field label="Email">
                <Input type="email" value={specificEmail} onChange={(e) => setSpecificEmail(e.target.value)} placeholder="user@email.com" />
              </Field>
            )}
            <SaveBtn saving={sending} label={`Send Notification${target !== "specific" ? " (Broadcast)" : ""}`} onClick={send} />
          </div>
        </div>

        {/* Recent */}
        <SectionPanel title="Recent Notifications">
          {loading ? <Spinner /> : (
            <>
              <DataTable columns={["User", "Title", "Status", "Sent"]}>
                {recent.map((n) => (
                  <TR key={n.id}>
                    <TD bold>{n.profiles?.full_name || "—"}</TD>
                    <TD className="max-w-[160px] truncate">{n.title}</TD>
                    <TD><Chip tone={n.read ? "success" : "neutral"}>{n.read ? "Read" : "Unread"}</Chip></TD>
                    <TD>{new Date(n.created_at).toLocaleDateString()}</TD>
                  </TR>
                ))}
              </DataTable>
              {recent.length === 0 && <EmptyState text="No notifications sent yet." />}
            </>
          )}
        </SectionPanel>
      </div>
    </div>
  );
}

