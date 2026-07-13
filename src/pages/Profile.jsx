import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { supabase } from "../lib/supabase.js";
import FileUpload from "../components/FileUpload.jsx";
import {
  User, Bell, ShieldCheck, CreditCard, HelpCircle, Gift, Settings,
  ChevronRight, LogOut, Loader2, X, ArrowLeft, Check, Copy, Send, Eye, EyeOff, AlertTriangle
} from "lucide-react";

const menu = [
  { key: "personal", icon: User, label: "Personal Information" },
  { key: "notifications", icon: Bell, label: "Notifications" },
  { key: "security", icon: ShieldCheck, label: "Security & Privacy" },
  { key: "payment", icon: CreditCard, label: "Payment Methods" },
  { key: "referral", icon: Gift, label: "Referral Program" },
  { key: "support", icon: HelpCircle, label: "Customer Support" },
  { key: "settings", icon: Settings, label: "Settings" },
];

export default function Profile() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [stats, setStats] = useState({ vehicles: 0, activeImports: 0, avgHealth: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [subPage, setSubPage] = useState(null); // which menu item is open

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const [g, i] = await Promise.all([
        supabase.from("garage_vehicles").select("health_score").eq("owner_id", profile.id),
        supabase.from("import_orders").select("id").eq("customer_id", profile.id).not("stage", "in", "(delivered,cancelled)"),
      ]);
      const vehicles = g.data || [];
      const avg = vehicles.length ? Math.round(vehicles.reduce((s, v) => s + v.health_score, 0) / vehicles.length) : 0;
      setStats({ vehicles: vehicles.length, activeImports: (i.data || []).length, avgHealth: avg });
      setStatsLoading(false);
    })();
  }, [profile]);

  async function handleLogout() {
    setSigningOut(true);
    await signOut();
    navigate("/login", { replace: true });
  }

  if (subPage) {
    return (
      <SubPageShell title={menu.find((m) => m.key === subPage)?.label || ""} onBack={() => setSubPage(null)}>
        {subPage === "personal" && <PersonalInfo profile={profile} onClose={() => setSubPage(null)} />}
        {subPage === "notifications" && <NotificationsPage profile={profile} />}
        {subPage === "security" && <SecurityPage />}
        {subPage === "payment" && <PaymentPage />}
        {subPage === "referral" && <ReferralPage profile={profile} />}
        {subPage === "support" && <SupportPage profile={profile} />}
        {subPage === "settings" && <SettingsPage />}
      </SubPageShell>
    );
  }

  return (
    <div>
      <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-5 bg-midnight text-white rounded-b-[24px]">
        <div className="flex items-center gap-3.5">
          <div className="w-[54px] h-[54px] rounded-full bg-electric flex items-center justify-center font-bold text-[17px] shrink-0">
            {profile?.avatar_initials || "?"}
          </div>
          <div>
            <p className="font-bold text-[15px]">{profile?.full_name}</p>
            <p className="text-slate-400 text-[11.5px] mt-0.5">{profile?.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4 sm:max-w-sm">
          <MiniStat value={statsLoading ? "—" : stats.vehicles} label="Vehicles" />
          <MiniStat value={statsLoading ? "—" : stats.activeImports} label="Imports" />
          <MiniStat value={statsLoading ? "—" : `${stats.avgHealth}%`} label="Avg Health" />
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 mt-4 sm:max-w-xl">
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          {menu.map((m, i) => (
            <button
              key={m.key}
              onClick={() => setSubPage(m.key)}
              className={`tap w-full flex items-center gap-2.5 px-3.5 py-3.5 text-left hover:bg-slate-50 transition-colors ${i !== menu.length - 1 ? "border-b border-slate-100" : ""}`}
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <m.icon size={14} className="text-midnight" />
              </div>
              <span className="flex-1 text-[13px] font-medium text-midnight">{m.label}</span>
              <ChevronRight size={15} className="text-slate-300" />
            </button>
          ))}
        </div>

        <button onClick={handleLogout} disabled={signingOut}
          className="tap w-full flex items-center justify-center gap-2 py-3 mt-4 text-[13px] font-semibold text-danger disabled:opacity-60">
          {signingOut ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
          {signingOut ? "Logging out…" : "Log Out"}
        </button>
      </div>
      <div className="h-6" />
    </div>
  );
}

function SubPageShell({ title, onBack, children }) {
  return (
    <div className="pb-8">
      <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-4 bg-white sticky top-0 z-30 border-b border-slate-100 flex items-center gap-3">
        <button onClick={onBack} className="tap w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
          <ArrowLeft size={16} className="text-midnight" />
        </button>
        <h1 className="text-[16px] font-bold text-midnight">{title}</h1>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 pt-5 max-w-xl">{children}</div>
    </div>
  );
}

/* ── Personal Information ────────────────────────────────────────────────── */
function PersonalInfo({ profile, onClose }) {
  const [name, setName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    await supabase.from("profiles").update({ full_name: name.trim(), phone: phone.trim() || null }).eq("id", profile.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-4">
      <FormField label="Full Name">
        <FormInput value={name} onChange={setName} placeholder="Your full name" />
      </FormField>
      <FormField label="Email" hint="Contact support to change your email address.">
        <FormInput value={profile?.email || ""} disabled className="text-slate-400" />
      </FormField>
      <FormField label="Phone Number">
        <FormInput value={phone} onChange={setPhone} placeholder="+234 800 000 0000" />
      </FormField>
      <FormField label="Profile Photo">
        <FileUpload value={avatarUrl} onChange={setAvatarUrl} folder="avatars" compact />
      </FormField>
      <button onClick={save} disabled={saving}
        className="tap w-full py-3.5 rounded-xl bg-electric text-white font-semibold text-[13.5px] flex items-center justify-center gap-2 disabled:opacity-60">
        {saved ? <><Check size={15} /> Saved</> : saving ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : "Save Changes"}
      </button>
    </div>
  );
}

/* ── Notifications ───────────────────────────────────────────────────────── */
function NotificationsPage({ profile }) {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase.from("notifications").select("*").eq("user_id", profile.id).order("created_at", { ascending: false }).limit(30);
    setNotifs(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function markAllRead() {
    await supabase.from("notifications").update({ read: true }).eq("user_id", profile.id).eq("read", false);
    setNotifs((n) => n.map((x) => ({ ...x, read: true })));
  }

  async function markRead(id) {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifs((n) => n.map((x) => x.id === id ? { ...x, read: true } : x));
  }

  if (loading) return <div className="flex justify-center py-10"><Loader2 size={20} className="animate-spin text-electric" /></div>;

  const unread = notifs.filter((n) => !n.read).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[12.5px] text-slate-400">{unread > 0 ? `${unread} unread` : "All caught up"}</p>
        {unread > 0 && <button onClick={markAllRead} className="text-[12px] text-electric font-semibold">Mark all read</button>}
      </div>
      <div className="flex flex-col gap-2">
        {notifs.length === 0 && <p className="text-[13px] text-slate-400 text-center py-10">No notifications yet.</p>}
        {notifs.map((n) => (
          <button key={n.id} onClick={() => markRead(n.id)}
            className={`w-full text-left rounded-xl px-3.5 py-3.5 flex gap-3 items-start ${n.read ? "bg-white border border-slate-100" : "bg-blue-50 border border-electric/20"}`}>
            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.read ? "bg-slate-300" : "bg-electric"}`} />
            <div>
              <p className="text-[13px] font-semibold text-midnight">{n.title}</p>
              {n.body && <p className="text-[11.5px] text-slate-400 mt-0.5">{n.body}</p>}
              <p className="text-[10.5px] text-slate-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Security & Privacy ──────────────────────────────────────────────────── */
function SecurityPage() {
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  async function changePassword() {
    if (newPw.length < 8) { setMsg({ type: "error", text: "Password must be at least 8 characters." }); return; }
    if (newPw !== confirm) { setMsg({ type: "error", text: "Passwords don't match." }); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setSaving(false);
    if (error) { setMsg({ type: "error", text: error.message }); return; }
    setMsg({ type: "success", text: "Password updated successfully." });
    setCurrent(""); setNewPw(""); setConfirm("");
  }

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-2.5">
        <AlertTriangle size={15} className="text-warning shrink-0 mt-0.5" />
        <p className="text-[12px] text-slate-600">Use a strong password with uppercase, lowercase, numbers and symbols.</p>
      </div>
      <FormField label="New Password">
        <div className="relative">
          <input type={showPw ? "text" : "password"} value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Min. 8 characters"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13.5px] outline-none focus:border-electric pr-10" />
          <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </FormField>
      <FormField label="Confirm New Password">
        <FormInput type="password" value={confirm} onChange={setConfirm} placeholder="Repeat password" />
      </FormField>
      {msg && (
        <div className={`flex items-start gap-2 px-3.5 py-2.5 rounded-xl text-[12.5px] ${msg.type === "error" ? "bg-red-50 text-danger" : "bg-green-50 text-success"}`}>
          {msg.type === "error" ? <X size={14} className="shrink-0 mt-0.5" /> : <Check size={14} className="shrink-0 mt-0.5" />}
          {msg.text}
        </div>
      )}
      <button onClick={changePassword} disabled={saving}
        className="tap w-full py-3.5 rounded-xl bg-electric text-white font-semibold text-[13.5px] flex items-center justify-center gap-2 disabled:opacity-60">
        {saving && <Loader2 size={14} className="animate-spin" />}
        {saving ? "Updating…" : "Update Password"}
      </button>
    </div>
  );
}

/* ── Payment Methods ─────────────────────────────────────────────────────── */
function PaymentPage() {
  return (
    <div className="flex flex-col items-center text-center py-10 gap-3">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
        <CreditCard size={26} className="text-slate-400" />
      </div>
      <p className="font-bold text-midnight text-[15px]">Payment Methods</p>
      <p className="text-slate-400 text-[13px] max-w-xs leading-relaxed">
        Card and bank account management is coming soon. For now, payments are processed by your import advisor via bank transfer.
      </p>
    </div>
  );
}

/* ── Referral Program ────────────────────────────────────────────────────── */
function ReferralPage({ profile }) {
  const code = "ALLVEX-" + (profile?.id?.slice(0, 6) || "XXXXX").toUpperCase();
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-5">
      <div className="bg-midnight rounded-2xl p-5 text-center">
        <p className="text-slate-400 text-[12px] mb-1">Your referral code</p>
        <p className="text-white font-black text-[22px] tracking-widest">{code}</p>
        <button onClick={copy} className="tap mt-4 flex items-center gap-2 bg-white/10 hover:bg-white/20 transition text-white px-4 py-2 rounded-xl text-[12.5px] font-semibold mx-auto">
          {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy Code</>}
        </button>
      </div>

      <div className="space-y-3">
        {[
          { step: "1", text: "Share your code with a friend who wants to import a vehicle." },
          { step: "2", text: "They sign up using your referral code when placing their first order." },
          { step: "3", text: "When their first vehicle is delivered, you both receive a reward." },
        ].map((r) => (
          <div key={r.step} className="flex items-start gap-3 bg-white rounded-xl shadow-card px-4 py-3.5">
            <div className="w-6 h-6 rounded-full bg-electric text-white text-[12px] font-bold flex items-center justify-center shrink-0">{r.step}</div>
            <p className="text-[13px] text-slate-600 leading-snug">{r.text}</p>
          </div>
        ))}
      </div>

      <div className="bg-success/10 border border-success/20 rounded-xl px-4 py-3.5 flex gap-2.5 items-center">
        <Gift size={16} className="text-success shrink-0" />
        <p className="text-[12.5px] text-slate-600">You have <strong>0 active referrals</strong>. Share your code to start earning rewards.</p>
      </div>
    </div>
  );
}

/* ── Customer Support ────────────────────────────────────────────────────── */
function SupportPage({ profile }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("low");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [view, setView] = useState("new"); // "new" | "history"

  useEffect(() => {
    supabase.from("support_tickets").select("*, ticket_messages(count)").eq("customer_id", profile.id).order("created_at", { ascending: false })
      .then(({ data }) => { setTickets(data || []); setTicketsLoading(false); });
  }, [profile.id, sent]);

  async function submit() {
    if (!subject.trim() || !message.trim()) return;
    setSending(true);
    const num = "TCK-" + Date.now().toString().slice(-6);
    const { data: ticket } = await supabase.from("support_tickets").insert({
      ticket_number: num, customer_id: profile.id, subject: subject.trim(), priority, status: "open"
    }).select().single();
    if (ticket) {
      await supabase.from("ticket_messages").insert({ ticket_id: ticket.id, sender_role: "customer", sender_id: profile.id, message: message.trim() });
    }
    setSending(false);
    setSent(true);
    setSubject(""); setMessage(""); setPriority("low");
    setTimeout(() => setSent(false), 3000);
  }

  const statusColor = (s) => s === "resolved" ? "text-success" : s === "in_progress" ? "text-electric" : "text-warning";

  return (
    <div>
      <div className="flex gap-2 mb-5">
        <button onClick={() => setView("new")} className={`tap flex-1 py-2.5 rounded-xl text-[12.5px] font-semibold ${view === "new" ? "bg-midnight text-white" : "bg-slate-100 text-slate-500"}`}>New Ticket</button>
        <button onClick={() => setView("history")} className={`tap flex-1 py-2.5 rounded-xl text-[12.5px] font-semibold ${view === "history" ? "bg-midnight text-white" : "bg-slate-100 text-slate-500"}`}>My Tickets</button>
      </div>

      {view === "new" && (
        <div className="space-y-3.5">
          {sent && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3.5 py-3 text-[12.5px] text-success font-semibold">
              <Check size={14} /> Ticket submitted. Our team will get back to you shortly.
            </div>
          )}
          <FormField label="Subject"><FormInput value={subject} onChange={setSubject} placeholder="e.g. Issue with my import order" /></FormField>
          <FormField label="Priority">
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13.5px] outline-none">
              <option value="low">Low — General question</option>
              <option value="medium">Medium — Need help soon</option>
              <option value="high">High — Urgent issue</option>
            </select>
          </FormField>
          <FormField label="Message">
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Describe your issue in detail..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13.5px] outline-none resize-none focus:border-electric" />
          </FormField>
          <button onClick={submit} disabled={sending || !subject.trim() || !message.trim()}
            className="tap w-full py-3.5 rounded-xl bg-electric text-white font-semibold text-[13.5px] flex items-center justify-center gap-2 disabled:opacity-60">
            {sending ? <><Loader2 size={14} className="animate-spin" />Submitting…</> : <><Send size={14} />Submit Ticket</>}
          </button>
        </div>
      )}

      {view === "history" && (
        <div className="flex flex-col gap-2.5">
          {ticketsLoading && <div className="flex justify-center py-8"><Loader2 size={18} className="animate-spin text-electric" /></div>}
          {!ticketsLoading && tickets.length === 0 && <p className="text-[13px] text-slate-400 text-center py-10">No tickets yet.</p>}
          {tickets.map((t) => (
            <div key={t.id} className="bg-white rounded-xl shadow-card px-4 py-3.5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[13px] font-semibold text-midnight">{t.subject}</p>
                <span className={`text-[10.5px] font-semibold shrink-0 ${statusColor(t.status)}`}>{t.status.replaceAll("_", " ")}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{t.ticket_number} · {new Date(t.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Settings ────────────────────────────────────────────────────────────── */
function SettingsPage() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [saved, setSaved] = useState(false);

  function save() { setSaved(true); setTimeout(() => setSaved(false), 1800); }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wide">Notification Preferences</p>
        </div>
        <ToggleRow label="Push notifications" sub="Import updates, reminders" checked={pushEnabled} onChange={setPushEnabled} />
        <ToggleRow label="Email notifications" sub="Order confirmations and receipts" checked={emailEnabled} onChange={setEmailEnabled} />
        <ToggleRow label="SMS alerts" sub="Critical updates via text message" checked={smsEnabled} onChange={setSmsEnabled} />
      </div>

      <div className="bg-white rounded-xl shadow-card px-4 py-3.5">
        <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wide mb-3">Account</p>
        <div className="space-y-2">
          <button className="w-full text-left text-[13px] text-slate-500 py-1.5 flex items-center justify-between">
            App version <span className="text-[11.5px] font-mono bg-slate-100 px-2 py-0.5 rounded">1.0.0</span>
          </button>
          <button className="w-full text-left text-[13px] text-danger font-medium py-1.5">Delete Account</button>
        </div>
      </div>

      <button onClick={save} className="tap w-full py-3.5 rounded-xl bg-electric text-white font-semibold text-[13.5px] flex items-center justify-center gap-2">
        {saved ? <><Check size={14} /> Saved</> : "Save Settings"}
      </button>
    </div>
  );
}

/* ── Shared helpers ──────────────────────────────────────────────────────── */
function MiniStat({ value, label }) {
  return (
    <div className="bg-white/10 rounded-xl py-2 flex flex-col items-center">
      <p className="text-[13px] font-bold">{value}</p>
      <p className="text-[9px] text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}

function FormField({ label, hint, children }) {
  return (
    <div>
      <label className="text-[12px] font-semibold text-slate-500 block mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

function FormInput({ onChange, ...props }) {
  return (
    <input {...props}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13.5px] outline-none focus:border-electric transition disabled:text-slate-400 ${props.className || ""}`}
    />
  );
}

function ToggleRow({ label, sub, checked, onChange }) {
  return (
    <label className="flex items-center justify-between px-4 py-3 border-b border-slate-50 last:border-0 cursor-pointer">
      <div>
        <p className="text-[13px] font-medium text-midnight">{label}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
      </div>
      <div onClick={() => onChange(!checked)}
        className={`w-10 h-5.5 rounded-full transition-colors relative cursor-pointer flex-shrink-0 ${checked ? "bg-electric" : "bg-slate-200"}`}
        style={{ width: 40, height: 22 }}>
        <div className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-all ${checked ? "left-[18px]" : "left-[2px]"}`}
          style={{ width: 18, height: 18 }} />
      </div>
    </label>
  );
}
