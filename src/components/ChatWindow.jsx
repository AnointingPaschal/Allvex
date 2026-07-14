import { useEffect, useRef, useState } from "react";
import { Send, Loader2, Check, CheckCheck } from "lucide-react";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * ChatWindow — real-time chat between customer and advisor.
 * Uses Supabase Realtime (postgres_changes) for live message delivery.
 *
 * Props:
 *   chatId      string   the advisor_chats.id to display
 *   role        string   'customer' | 'advisor' — who is the current user
 *   compact     bool     smaller version for sidebar panels
 */
export default function ChatWindow({ chatId, role = "customer", compact = false }) {
  const { profile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const channelRef = useRef(null);

  // ── Load initial messages ────────────────────────────────────────────────
  async function load() {
    const { data } = await supabase
      .from("advisor_chat_messages")
      .select("*, profiles(full_name, avatar_initials)")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });
    setMessages(data || []);
    setLoading(false);

    // Mark incoming messages as read
    const readField = role === "customer" ? "read_by_customer" : "read_by_advisor";
    await supabase
      .from("advisor_chat_messages")
      .update({ [readField]: true })
      .eq("chat_id", chatId)
      .eq(readField, false)
      .neq("sender_role", role);
  }

  // ── Subscribe to new messages via Supabase Realtime ─────────────────────
  useEffect(() => {
    if (!chatId) return;
    load();

    // Clean up any previous subscription
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`chat:${chatId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "advisor_chat_messages",
        filter: `chat_id=eq.${chatId}`,
      }, async (payload) => {
        // Fetch the full row with join so we have profile info
        const { data } = await supabase
          .from("advisor_chat_messages")
          .select("*, profiles(full_name, avatar_initials)")
          .eq("id", payload.new.id)
          .single();
        if (data) {
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.find((m) => m.id === data.id)) return prev;
            return [...prev, data];
          });
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  // ── Auto-scroll to bottom on new messages ──────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send a message ───────────────────────────────────────────────────────
  async function send() {
    if (!text.trim() || !profile || sending) return;
    const content = text.trim();
    setText("");
    setSending(true);

    await supabase.from("advisor_chat_messages").insert({
      chat_id: chatId,
      sender_id: profile.id,
      sender_role: role,
      message: content,
      read_by_customer: role === "customer",
      read_by_advisor: role === "advisor",
    });

    // Update last_message_at on the chat
    await supabase
      .from("advisor_chats")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", chatId);

    setSending(false);
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const h = compact ? "h-[320px]" : "flex-1 min-h-0";

  return (
    <div className={`flex flex-col bg-white ${compact ? "rounded-xl shadow-card overflow-hidden" : "h-full"}`}>
      {/* Messages */}
      <div className={`${h} overflow-y-auto px-4 py-4 space-y-3`}>
        {loading && (
          <div className="flex justify-center py-6">
            <Loader2 size={18} className="animate-spin text-electric" />
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-electric/10 flex items-center justify-center mb-2.5">
              <Send size={18} className="text-electric" />
            </div>
            <p className="text-[13px] font-semibold text-midnight">Start the conversation</p>
            <p className="text-[11.5px] text-slate-400 mt-1 max-w-[220px]">
              Send a message and an Allvex advisor will reply, usually within a few hours.
            </p>
          </div>
        )}

        {messages.map((m) => {
          const isMine = m.sender_role === role;
          return (
            <div key={m.id} className={`flex gap-2 ${isMine ? "justify-end" : "justify-start"}`}>
              {!isMine && (
                <div className="w-7 h-7 rounded-full bg-electric flex items-center justify-center shrink-0 mt-auto">
                  <span className="text-white text-[10px] font-bold">
                    {m.profiles?.avatar_initials || "A"}
                  </span>
                </div>
              )}
              <div className={`max-w-[78%] ${isMine ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                {!isMine && (
                  <p className="text-[10px] font-semibold text-slate-400 px-1">
                    {m.profiles?.full_name || "Allvex Advisor"}
                  </p>
                )}
                <div className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                  isMine
                    ? "bg-electric text-white rounded-br-sm"
                    : "bg-slate-100 text-midnight rounded-bl-sm"
                }`}>
                  {m.message}
                </div>
                <div className={`flex items-center gap-1 px-1 ${isMine ? "justify-end" : "justify-start"}`}>
                  <span className="text-[9.5px] text-slate-400">
                    {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {isMine && (
                    m.sender_role === "customer"
                      ? m.read_by_advisor
                        ? <CheckCheck size={11} className="text-electric" />
                        : <Check size={11} className="text-slate-400" />
                      : m.read_by_customer
                        ? <CheckCheck size={11} className="text-electric" />
                        : <Check size={11} className="text-slate-400" />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3.5 py-3 border-t border-slate-100 flex items-end gap-2.5">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type a message…"
          rows={1}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] outline-none focus:border-electric resize-none max-h-24 overflow-y-auto transition"
          style={{ minHeight: 42 }}
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 96) + "px";
          }}
        />
        <button
          onClick={send}
          disabled={!text.trim() || sending}
          className="tap w-10 h-10 rounded-xl bg-electric flex items-center justify-center shrink-0 disabled:opacity-50 self-end"
        >
          {sending ? <Loader2 size={15} className="text-white animate-spin" /> : <Send size={15} className="text-white" />}
        </button>
      </div>
    </div>
  );
}
