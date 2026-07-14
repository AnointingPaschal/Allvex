import { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles, Car, ChevronDown, X, Search, AlertTriangle, Wrench } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";
import { obdCodes, severityConfig, systemLabels, findCode } from "../data/obdCodes.js";

const SUGGESTIONS = [
  "What does P0420 mean?",
  "Compare BYD Seal vs GAC GS8",
  "How much to import from China to Lagos?",
  "P0300 misfire — what should I check first?",
  "My car shakes at idle — what's wrong?",
  "Why is my check engine light flashing?",
];

const QUICK_MODES = [
  { key: "diagnose", label: "Diagnose a Code", icon: AlertTriangle, prompt: "I have an OBD code: " },
  { key: "maintenance", label: "Maintenance", icon: Wrench, prompt: "I need maintenance advice: " },
  { key: "compare", label: "Compare Vehicles", icon: Car, prompt: "Compare " },
];

// ── Table component that makes markdown tables scrollable ──────────────────
function SafeTable({ children, ...props }) {
  return (
    <div className="overflow-x-auto my-2 rounded-xl border border-slate-100">
      <table className="text-[12px] w-full" {...props}>{children}</table>
    </div>
  );
}

export default function Assistant() {
  const { profile } = useAuth();
  const [garageVehicles, setGarageVehicles] = useState([]);
  const [vehicle, setVehicle] = useState(null);
  const [showVehicleMenu, setShowVehicleMenu] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("chat"); // "chat" | "codes"
  const [codeQuery, setCodeQuery] = useState("");
  const [selectedCode, setSelectedCode] = useState(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  // Load greeting and garage vehicles
  useEffect(() => {
    if (!profile) return;
    const name = profile.full_name?.split(" ")[0] || "there";
    setMessages([{
      from: "ai",
      text: `Hi ${name}! I'm your Allvex assistant. I can diagnose check-engine codes, answer maintenance questions, compare vehicles, or help with your import. What do you need?`,
    }]);
    supabase.from("garage_vehicles").select("id, nickname, brand, model, year, mileage")
      .eq("owner_id", profile.id)
      .then(({ data }) => setGarageVehicles(data || []));
  }, [profile]);

  // Auto-scroll to latest message
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function vehicleContextLine() {
    if (!vehicle) return "";
    return `User's vehicle: ${vehicle.nickname} — ${vehicle.brand} ${vehicle.model} (${vehicle.year}), ${vehicle.mileage?.toLocaleString()} km.`;
  }

  // ── Streaming send ─────────────────────────────────────────────────────────
  async function send(overrideText) {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;
    setInput("");
    setLoading(true);

    const userMsg = { from: "user", text };
    const history = [
      ...messages.filter((m) => m.from !== "typing"),
      userMsg,
    ].map((m) => ({ role: m.from === "user" ? "user" : "assistant", content: m.text }));

    setMessages((prev) => [...prev.filter((m) => m.from !== "typing"), userMsg, { from: "ai", text: "", streaming: true }]);

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          messages: history.slice(-12), // keep last 12 turns for context
          vehicleContext: vehicleContextLine(),
        }),
      });

      if (!res.ok) throw new Error("API error");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let content = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? ""; // keep incomplete last line in buffer

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;
          const data = trimmed.slice(6);
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            const token = parsed.choices?.[0]?.delta?.content ?? "";
            if (token) {
              content += token;
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.streaming) updated[updated.length - 1] = { ...last, text: content };
                return updated;
              });
            }
          } catch {
            // skip malformed SSE lines
          }
        }
      }

      // Finalise — remove streaming flag
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last?.streaming) updated[updated.length - 1] = { from: "ai", text: content || "Sorry, I couldn't generate a response. Please try again." };
        return updated;
      });
    } catch (e) {
      if (e.name !== "AbortError") {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.streaming) updated[updated.length - 1] = { from: "ai", text: "Connection error. Please check your internet and try again." };
          return updated;
        });
      }
    }

    setLoading(false);
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  // ── OBD code browser ──────────────────────────────────────────────────────
  const filteredCodes = codeQuery.length >= 2
    ? findCode(codeQuery)
    : obdCodes.filter((_, i) => i < 20);

  function askAboutCode(code) {
    setSelectedCode(null);
    setTab("chat");
    send(`Explain OBD code ${code.code} — ${code.name}. What symptoms will I notice and what should I do first?`);
  }

  return (
    <div className="flex flex-col h-full min-h-0" style={{ height: "calc(100vh - 62px)" }}>
      {/* ── Header ── */}
      <div className="px-4 sm:px-6 py-3 bg-midnight text-white border-b border-white/10 shrink-0">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-electric flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-[14px] leading-tight">Allvex Assistant</p>
              <p className="text-slate-400 text-[10px]">Diagnostics & maintenance, powered by AI</p>
            </div>
          </div>
          {/* Tab toggle */}
          <div className="flex gap-1 bg-white/10 p-0.5 rounded-lg">
            <button onClick={() => setTab("chat")} className={`px-2.5 py-1 rounded-md text-[10.5px] font-semibold transition ${tab === "chat" ? "bg-white text-midnight" : "text-white"}`}>Chat</button>
            <button onClick={() => setTab("codes")} className={`px-2.5 py-1 rounded-md text-[10.5px] font-semibold transition ${tab === "codes" ? "bg-white text-midnight" : "text-white"}`}>OBD Codes</button>
          </div>
        </div>

        {/* Vehicle selector */}
        {tab === "chat" && (
          <div className="relative">
            <button
              onClick={() => setShowVehicleMenu((s) => !s)}
              className="tap w-full flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 text-left"
            >
              <Car size={13} className="text-slate-300 shrink-0" />
              <span className="text-[12px] text-slate-300 flex-1 truncate">
                {vehicle ? `${vehicle.nickname} — ${vehicle.brand} ${vehicle.model}` : "Select a vehicle for context"}
              </span>
              <ChevronDown size={13} className={`text-slate-400 shrink-0 transition-transform ${showVehicleMenu ? "rotate-180" : ""}`} />
            </button>

            {showVehicleMenu && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl z-20 overflow-hidden">
                <button onClick={() => { setVehicle(null); setShowVehicleMenu(false); }}
                  className="tap w-full px-3.5 py-2.5 text-left text-[12px] text-slate-400 border-b border-slate-50">
                  No vehicle context
                </button>
                {garageVehicles.map((v) => (
                  <button key={v.id} onClick={() => { setVehicle(v); setShowVehicleMenu(false); }}
                    className={`tap w-full px-3.5 py-2.5 text-left text-[12.5px] font-medium text-midnight hover:bg-slate-50 ${vehicle?.id === v.id ? "bg-blue-50 text-electric" : ""}`}>
                    {v.nickname} — {v.brand} {v.model} ({v.year})
                  </button>
                ))}
                {garageVehicles.length === 0 && (
                  <p className="px-3.5 py-3 text-[12px] text-slate-400">No vehicles in your garage yet.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── CHAT TAB ── */}
      {tab === "chat" && (
        <>
          {/* Quick mode chips */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 sm:px-6 py-2.5 border-b border-slate-100 shrink-0">
            {QUICK_MODES.map((m) => (
              <button key={m.key} onClick={() => { setInput(m.prompt); inputRef.current?.focus(); }}
                className="tap flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-pill px-3 py-1.5 text-[11.5px] font-semibold text-midnight whitespace-nowrap shrink-0 hover:border-electric hover:text-electric transition">
                <m.icon size={11} /> {m.label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
            {/* Welcome suggestions */}
            {messages.length <= 1 && (
              <div className="space-y-2 mt-1">
                <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5"><Sparkles size={11} /> Try asking</p>
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)}
                    className="tap w-full text-left px-3.5 py-2.5 rounded-xl bg-white border border-slate-100 text-[12.5px] text-midnight hover:border-electric hover:bg-blue-50 transition">
                    {s}
                  </button>
                ))}
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2.5 ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                {m.from !== "user" && (
                  <div className="w-7 h-7 rounded-full bg-electric flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={13} className="text-white" />
                  </div>
                )}
                <div className={`max-w-[85%] sm:max-w-[75%] ${m.from === "user" ? "items-end" : "items-start"} flex flex-col`}>
                  <div className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                    m.from === "user"
                      ? "bg-electric text-white rounded-br-sm"
                      : "bg-white border border-slate-100 text-midnight rounded-bl-sm shadow-sm"
                  }`}>
                    {m.from === "user" ? (
                      <span>{m.text}</span>
                    ) : (
                      <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{ table: SafeTable }}
                        >
                          {m.text}
                        </ReactMarkdown>
                        {m.streaming && <span className="inline-block w-1.5 h-3.5 bg-electric rounded-sm ml-0.5 animate-pulse" />}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="shrink-0 px-3.5 py-3 border-t border-slate-100 bg-white">
            <div className="flex items-end gap-2.5 max-w-2xl mx-auto">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
                }}
                onKeyDown={handleKey}
                placeholder="Ask Allvex AI…"
                rows={1}
                disabled={loading}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] outline-none focus:border-electric transition resize-none max-h-24 disabled:opacity-60"
                style={{ minHeight: 42 }}
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="tap w-10 h-10 rounded-xl bg-electric flex items-center justify-center shrink-0 self-end disabled:opacity-40 transition"
              >
                <Send size={15} className="text-white" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── OBD CODE BROWSER TAB ── */}
      {tab === "codes" && (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="px-4 sm:px-6 py-3 border-b border-slate-100 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input value={codeQuery} onChange={(e) => setCodeQuery(e.target.value)}
                placeholder="Search code (e.g. P0420) or keyword (e.g. misfire)…"
                className="bg-transparent outline-none text-[12.5px] w-full placeholder:text-slate-400" />
              {codeQuery && <button onClick={() => setCodeQuery("")}><X size={13} className="text-slate-400" /></button>}
            </div>
            <p className="text-[10.5px] text-slate-400 mt-1.5">{filteredCodes.length} code{filteredCodes.length !== 1 ? "s" : ""} {codeQuery.length >= 2 ? "found" : "— type to search all 80+"}</p>
          </div>

          <div className="px-4 sm:px-6 pb-4 space-y-2 pt-2">
            {filteredCodes.map((c) => {
              const sev = severityConfig[c.severity];
              return (
                <button key={c.code} onClick={() => setSelectedCode(c)}
                  className="tap w-full text-left bg-white rounded-xl border border-slate-100 shadow-sm p-3.5 hover:border-electric transition">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-[13.5px] text-midnight font-mono">{c.code}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-pill ${sev.bg} ${sev.color}`}>{sev.label}</span>
                      </div>
                      <p className="text-[12px] font-semibold text-midnight mt-0.5">{c.name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{c.symptoms}</p>
                    </div>
                    <span className="text-[10px] text-slate-300 shrink-0 mt-0.5">{c.subsystem}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Code detail drawer ── */}
      {selectedCode && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50" onClick={() => setSelectedCode(null)}>
          <div onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-[28px] w-full max-h-[80vh] overflow-y-auto">
            <div className="w-10 h-1 bg-slate-200 rounded-pill mx-auto mt-3 mb-4" />

            {(() => {
              const c = selectedCode;
              const sev = severityConfig[c.severity];
              return (
                <div className="px-5 pb-8 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-[20px] text-midnight font-mono">{c.code}</p>
                      <p className="text-[14px] font-semibold text-midnight mt-0.5">{c.name}</p>
                    </div>
                    <span className={`text-[10.5px] font-bold px-2.5 py-1 rounded-xl shrink-0 mt-1 ${sev.bg} ${sev.color} border ${sev.border}`}>{sev.label}</span>
                  </div>

                  {c.severity === "critical" && (
                    <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-3.5 py-3">
                      <AlertTriangle size={16} className="text-red-600 shrink-0" />
                      <p className="text-[12px] font-semibold text-red-700">Stop driving until this is resolved.</p>
                    </div>
                  )}

                  <Section title="🩺 Symptoms you'll notice" text={c.symptoms} />
                  <Section title="🔍 Likely causes" text={c.causes} />
                  <Section title="🔧 How to fix it" text={c.fixes} />

                  <div className="flex gap-2.5 pt-1">
                    <button onClick={() => askAboutCode(c)}
                      className="tap flex-1 py-3 rounded-xl bg-electric text-white font-bold text-[13px]">
                      Ask AI about {c.code}
                    </button>
                    <button onClick={() => setSelectedCode(null)}
                      className="tap px-4 py-3 rounded-xl bg-slate-100 text-midnight font-semibold text-[13px]">
                      Close
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, text }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{title}</p>
      <p className="text-[13px] text-slate-700 leading-relaxed">{text}</p>
    </div>
  );
}
