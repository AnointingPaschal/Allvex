import { useEffect, useState } from "react";
import { MessageCircle, Loader2, ChevronLeft, Car, Check } from "lucide-react";
import { SectionPanel, Spinner, Chip, Btn, EmptyState } from "../components/ui.jsx";
import ChatWindow from "../../../components/ChatWindow.jsx";
import { supabase } from "../../../lib/supabase.js";

export default function LiveChat({ toast }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [filter, setFilter] = useState("open");

  useEffect(() => {
    load();

    const channel = supabase
      .channel("admin-chat-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "advisor_chats" }, () => load())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "advisor_chat_messages" }, () => loadUnread())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("advisor_chats")
      .select("*, profiles!advisor_chats_customer_id_fkey(full_name, email, avatar_initials)")
      .order("last_message_at", { ascending: false });
    setChats(data || []);
    setLoading(false);
    await loadUnread(data);
  }

  async function loadUnread(chatList = chats) {
    if (!chatList?.length) return;
    const { data } = await supabase
      .from("advisor_chat_messages")
      .select("chat_id")
      .in("chat_id", chatList.map((c) => c.id))
      .eq("read_by_advisor", false)
      .eq("sender_role", "customer");
    const counts = {};
    (data || []).forEach((r) => { counts[r.chat_id] = (counts[r.chat_id] || 0) + 1; });
    setUnreadCounts(counts);
  }

  async function resolveChat(chat) {
    await supabase.from("advisor_chats").update({ status: "resolved" }).eq("id", chat.id);
    toast.success("Chat resolved.");
    setActiveChat(null);
    load();
  }

  function timeAgo(ts) {
    const d = new Date(ts);
    const mins = Math.round((new Date() - d) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return d.toLocaleDateString();
  }

  const filtered = chats.filter((c) => filter === "all" || c.status === filter);
  const totalUnread = Object.values(unreadCounts).reduce((s, n) => s + n, 0);

  // Active chat view
  if (activeChat) {
    const c = activeChat;
    return (
      <div className="flex flex-col h-full" style={{ minHeight: 600 }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => { setActiveChat(null); load(); }}
              className="tap w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
              <ChevronLeft size={16} className="text-midnight" />
            </button>
            <div>
              <p className="text-[14px] font-bold text-midnight">{c.subject}</p>
              <p className="text-[12px] text-slate-400">
                {c.profiles?.full_name} · {c.profiles?.email}
                {c.vehicle_label && ` · ${c.vehicle_label}`}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {c.status === "open" && (
              <Btn variant="success" onClick={() => resolveChat(c)}>
                <Check size={12} className="inline mr-1" />Resolve
              </Btn>
            )}
            <Chip tone={c.status === "open" ? "success" : "neutral"}>{c.status}</Chip>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card flex-1 flex flex-col overflow-hidden" style={{ minHeight: 520 }}>
          <ChatWindow chatId={c.id} role="advisor" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {["open", "resolved", "all"].map((f) => (
            <Btn key={f} variant={filter === f ? "dark" : "ghost"} onClick={() => setFilter(f)}>
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              {f === "open" && totalUnread > 0 && (
                <span className="ml-1.5 w-4 h-4 rounded-full bg-danger text-white text-[9px] font-bold inline-flex items-center justify-center">
                  {totalUnread}
                </span>
              )}
            </Btn>
          ))}
        </div>
        <p className="text-[12px] text-slate-400">{filtered.length} conversations</p>
      </div>

      <SectionPanel title="Conversations">
        {loading ? <Spinner /> : (
          <>
            <div className="divide-y divide-slate-50">
              {filtered.map((c) => (
                <button key={c.id} onClick={() => setActiveChat(c)}
                  className="tap w-full text-left flex items-start gap-3 px-5 py-4 hover:bg-slate-50 transition">
                  <div className="w-9 h-9 rounded-full bg-electric flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-white text-[11px] font-bold">
                      {c.profiles?.avatar_initials || "?"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[13px] font-semibold text-midnight truncate">{c.profiles?.full_name || "Unknown"}</p>
                      <span className="text-[10px] text-slate-400 shrink-0">{timeAgo(c.last_message_at)}</span>
                    </div>
                    <p className="text-[12px] text-slate-500 mt-0.5 truncate">{c.subject}</p>
                    {c.vehicle_label && (
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Car size={10} /> {c.vehicle_label}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <Chip tone={c.status === "open" ? "success" : "neutral"}>{c.status}</Chip>
                    {unreadCounts[c.id] > 0 && (
                      <span className="w-5 h-5 rounded-full bg-electric text-white text-[10px] font-bold flex items-center justify-center">
                        {unreadCounts[c.id]}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            {filtered.length === 0 && <EmptyState text={`No ${filter === "all" ? "" : filter} conversations.`} />}
          </>
        )}
      </SectionPanel>
    </div>
  );
}
