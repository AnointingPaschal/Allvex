import { useEffect, useState } from "react";
import { MessageCircle, ChevronLeft, Plus, Car, Loader2, Circle } from "lucide-react";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import { useNavigate } from "react-router-dom";

export default function Chat() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});

  useEffect(() => {
    if (!profile) return;
    load();

    // Re-subscribe to chat list updates
    const channel = supabase
      .channel("chat-list-updates")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "advisor_chats",
        filter: `customer_id=eq.${profile.id}`,
      }, () => load())
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "advisor_chat_messages",
      }, () => loadUnread())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [profile]);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("advisor_chats")
      .select("*")
      .eq("customer_id", profile.id)
      .order("last_message_at", { ascending: false });
    setChats(data || []);
    setLoading(false);
    await loadUnread(data);
  }

  async function loadUnread(chatList = chats) {
    if (!chatList.length) return;
    const { data } = await supabase
      .from("advisor_chat_messages")
      .select("chat_id")
      .in("chat_id", chatList.map((c) => c.id))
      .eq("read_by_customer", false)
      .eq("sender_role", "advisor");

    const counts = {};
    (data || []).forEach((r) => { counts[r.chat_id] = (counts[r.chat_id] || 0) + 1; });
    setUnreadCounts(counts);
  }

  async function startNewChat() {
    const { data } = await supabase.from("advisor_chats").insert({
      customer_id: profile.id,
      subject: "General enquiry",
      status: "open",
    }).select().single();
    if (data) { setChats((c) => [data, ...c]); setActiveChat(data); }
  }

  function timeAgo(ts) {
    const d = new Date(ts);
    const now = new Date();
    const mins = Math.round((now - d) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return d.toLocaleDateString();
  }

  // ── Active chat view ──────────────────────────────────────────────────────
  if (activeChat) {
    return (
      <div className="flex flex-col" style={{ height: "calc(100vh - 76px)" }}>
        {/* Header */}
        <div className="flex items-center gap-3 px-4 sm:px-6 py-3.5 bg-white border-b border-slate-100 sticky top-0 z-20">
          <button onClick={() => { setActiveChat(null); load(); }}
            className="tap w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
            <ChevronLeft size={17} className="text-midnight" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-bold text-midnight truncate">{activeChat.subject}</p>
            {activeChat.vehicle_label && (
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                <Car size={10} /> {activeChat.vehicle_label}
              </p>
            )}
          </div>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-pill ${
            activeChat.status === "open" ? "bg-success/10 text-success" : "bg-slate-100 text-slate-400"
          }`}>
            {activeChat.status === "open" ? "Active" : "Resolved"}
          </span>
        </div>

        <div className="flex-1 min-h-0 flex flex-col px-0">
          <ChatWindow chatId={activeChat.id} role="customer" />
        </div>
      </div>
    );
  }

  // ── Chat list view ────────────────────────────────────────────────────────
  return (
    <div>
      <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-3.5 bg-white sticky top-0 z-30 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h1 className="text-[17px] font-bold text-midnight">My Conversations</h1>
          <p className="text-[11px] text-slate-400 mt-0.5">Chat directly with Allvex advisors</p>
        </div>
        <button onClick={startNewChat}
          className="tap flex items-center gap-1.5 bg-electric text-white px-3.5 py-2 rounded-xl text-[12.5px] font-semibold">
          <Plus size={14} /> New Chat
        </button>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 mt-3 max-w-xl">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 size={22} className="animate-spin text-electric" /></div>
        ) : chats.length === 0 ? (
          <div className="flex flex-col items-center text-center py-12 space-y-3">
            <div className="w-14 h-14 rounded-full bg-electric/10 flex items-center justify-center">
              <MessageCircle size={24} className="text-electric" />
            </div>
            <p className="text-[14px] font-bold text-midnight">No conversations yet</p>
            <p className="text-[12.5px] text-slate-400 max-w-[240px] leading-relaxed">
              Chat with an Allvex advisor about a vehicle, your import, or anything else.
            </p>
            <button onClick={startNewChat}
              className="tap mt-2 px-5 py-2.5 rounded-xl bg-electric text-white font-semibold text-[13px]">
              Start a Conversation
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {chats.map((c) => (
              <button key={c.id} onClick={() => setActiveChat(c)}
                className="tap w-full text-left bg-white rounded-xl shadow-card px-4 py-3.5 flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-electric flex items-center justify-center shrink-0 mt-0.5">
                  <MessageCircle size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-semibold text-midnight truncate">{c.subject}</p>
                    <span className="text-[10px] text-slate-400 shrink-0">{timeAgo(c.last_message_at)}</span>
                  </div>
                  {c.vehicle_label && (
                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <Car size={10} /> {c.vehicle_label}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-1.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-pill ${
                      c.status === "open" ? "bg-success/10 text-success" : "bg-slate-100 text-slate-400"
                    }`}>{c.status}</span>
                    {unreadCounts[c.id] > 0 && (
                      <span className="w-5 h-5 rounded-full bg-electric text-white text-[10px] font-bold flex items-center justify-center">
                        {unreadCounts[c.id]}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
        <div className="h-4" />
      </div>
    </div>
  );
}
