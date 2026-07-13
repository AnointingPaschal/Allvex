import { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles, Car, ChevronDown, X, Wrench, MessageCircle, AlertTriangle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { garageVehicles } from "../data/mock.js";

const mdComponents = {
  p: ({ node, ...props }) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
  strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
  em: ({ node, ...props }) => <em className="italic" {...props} />,
  ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 last:mb-0 space-y-1" {...props} />,
  ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 last:mb-0 space-y-1" {...props} />,
  li: ({ node, ...props }) => <li className="leading-snug" {...props} />,
  h1: ({ node, ...props }) => <p className="font-bold text-[13.5px] mb-1.5" {...props} />,
  h2: ({ node, ...props }) => <p className="font-bold text-[13px] mb-1.5" {...props} />,
  h3: ({ node, ...props }) => <p className="font-semibold text-[12.5px] mb-1" {...props} />,
  code: ({ node, ...props }) => <code className="bg-black/5 px-1 py-0.5 rounded text-[11.5px] font-mono" {...props} />,
  a: ({ node, ...props }) => <a className="underline font-medium" target="_blank" rel="noreferrer" {...props} />,
};

const suggestions = [
  "Where is my car?",
  "Compare BYD vs GAC",
  "Find SUV under ₦20m",
  "Why is my health score dropping?",
];

const SYSTEM_PROMPT = `You are the Allvex Assistant, the in-app automotive AI for the Allvex platform (vehicle import, ownership, and maintenance for African customers).

You help with:
- Diagnosing OBD-II / check-engine error codes (e.g. P0301, P0420): explain what the code means, likely causes ranked by probability, whether it's safe to keep driving, and recommended next steps.
- General car maintenance questions and schedules (oil changes, brake service, tyres, battery, etc).
- Vehicle comparisons, import tracking questions, and general Allvex platform questions.

Style rules:
- Keep answers concise and scannable — this is a mobile chat UI. Use short paragraphs or a tight bullet list. Avoid long essays.
- When diagnosing a code, structure the answer as: what it means, likely causes (ranked), urgency/safety, recommended action.
- Always recommend a certified inspection for anything safety-critical (brakes, steering, airbags, structural) rather than DIY instructions for those systems.
- Don't invent vehicle-specific data (mileage, service history) beyond what's given in the conversation context.
- Be direct and practical, not overly cautious or repetitive with disclaimers.`;

export default function Assistant() {
  const [messages, setMessages] = useState([
    { from: "ai", text: "Hi Alex. I'm your Allvex assistant. I can diagnose check-engine codes, answer maintenance questions, or help with imports. Pick a vehicle below to get started." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [vehicle, setVehicle] = useState(null); // { label, brand, model, year, mileage }
  const [showVehiclePicker, setShowVehiclePicker] = useState(false);
  const [showDiagnose, setShowDiagnose] = useState(false);
  const [customVehicle, setCustomVehicle] = useState({ brand: "", model: "", year: "" });
  const [code, setCode] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  function vehicleContextLine() {
    if (!vehicle) return "";
    return `Vehicle context: ${vehicle.brand} ${vehicle.model} (${vehicle.year})${vehicle.mileage ? `, ${vehicle.mileage.toLocaleString()} km` : ""}.`;
  }

  async function callAssistant(history, userText) {
    setLoading(true);
    const apiMessages = [
      { role: "system", content: SYSTEM_PROMPT + (vehicle ? `\n\n${vehicleContextLine()}` : "") },
      ...history.map((m) => ({ role: m.from === "ai" ? "assistant" : "user", content: m.text })),
      { role: "user", content: userText },
    ];

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });
      const data = await res.json();

      if (!res.ok) {
        const friendly =
          data.error === "missing_api_key"
            ? "AI isn't connected yet — the site owner needs to add an OPENROUTER_API_KEY in Vercel project settings."
            : "I couldn't reach the AI service just now. Please try again in a moment.";
        setMessages((m) => [...m, { from: "ai", text: friendly, isError: true }]);
        return;
      }

      setMessages((m) => [...m, { from: "ai", text: data.reply }]);
    } catch {
      setMessages((m) => [...m, { from: "ai", text: "Connection error — please check your internet and try again.", isError: true }]);
    } finally {
      setLoading(false);
    }
  }

  function send(text) {
    if (!text.trim() || loading) return;
    const next = [...messages, { from: "user", text }];
    setMessages(next);
    setInput("");
    callAssistant(messages, text);
  }

  function submitDiagnosis() {
    if (!code.trim()) return;
    const text = `Diagnose error code ${code.trim().toUpperCase()}.${symptoms.trim() ? ` Symptoms: ${symptoms.trim()}.` : ""}`;
    setShowDiagnose(false);
    setCode("");
    setSymptoms("");
    send(text);
  }

  function pickVehicle(v) {
    setVehicle(v);
    setShowVehiclePicker(false);
  }

  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 76px)" }}>
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-3.5 bg-midnight text-white rounded-b-[24px]">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-full bg-electric flex items-center justify-center shrink-0">
            <Bot size={16} />
          </div>
          <div>
            <p className="font-semibold text-[13px]">Allvex Assistant</p>
            <p className="text-[10px] text-slate-400">Diagnostics & maintenance, powered by AI</p>
          </div>
        </div>

        {/* Vehicle context selector */}
        <button
          onClick={() => setShowVehiclePicker(true)}
          className="tap w-full flex items-center justify-between gap-2 bg-white/10 rounded-xl px-3.5 py-2.5"
        >
          <span className="flex items-center gap-2 text-[12px] text-slate-200 truncate">
            <Car size={13} className="shrink-0" />
            {vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.year})` : "Select a vehicle for context"}
          </span>
          <ChevronDown size={14} className="text-slate-400 shrink-0" />
        </button>
      </div>

      {/* Quick action bar */}
      <div className="px-4 sm:px-6 lg:px-8 pt-3 flex gap-2 max-w-2xl w-full mx-auto">
        <button
          onClick={() => setShowDiagnose(true)}
          className="tap flex-1 flex items-center justify-center gap-1.5 bg-white shadow-card rounded-xl py-2.5 text-[11.5px] font-semibold text-midnight"
        >
          <AlertTriangle size={13} className="text-warning" /> Diagnose a code
        </button>
        <button
          onClick={() => send("Give me a quick maintenance checklist for my vehicle.")}
          className="tap flex-1 flex items-center justify-center gap-1.5 bg-white shadow-card rounded-xl py-2.5 text-[11.5px] font-semibold text-midnight"
        >
          <Wrench size={13} className="text-electric" /> Maintenance
        </button>
        <button
          onClick={() => setInput("")}
          className="tap flex-1 flex items-center justify-center gap-1.5 bg-white shadow-card rounded-xl py-2.5 text-[11.5px] font-semibold text-midnight"
        >
          <MessageCircle size={13} className="text-electric" /> Ask anything
        </button>
      </div>

      {/* Chat */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-2.5 max-w-2xl w-full mx-auto">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`msg-in max-w-[85%] px-3.5 py-2.5 rounded-xl text-[12.5px] ${
              m.from === "ai"
                ? m.isError
                  ? "bg-red-50 text-danger self-start"
                  : "bg-white shadow-card text-midnight self-start"
                : "bg-electric text-white self-end whitespace-pre-wrap leading-relaxed"
            }`}
          >
            {m.from === "ai" ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                {m.text}
              </ReactMarkdown>
            ) : (
              m.text
            )}
          </div>
        ))}

        {loading && (
          <div className="msg-in max-w-[85%] px-3.5 py-2.5 rounded-xl bg-white shadow-card self-start flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" />
          </div>
        )}

        {messages.length === 1 && (
          <div className="mt-1.5">
            <p className="text-[10.5px] text-slate-400 mb-2 flex items-center gap-1.5"><Sparkles size={11} /> Try asking</p>
            <div className="flex flex-col gap-1.5">
              {suggestions.map((s) => (
                <button key={s} onClick={() => send(s)} className="tap text-left bg-white shadow-card rounded-xl px-3.5 py-2.5 text-[12px] text-midnight font-medium">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 sm:px-6 lg:px-8 pb-4 pt-1.5 max-w-2xl w-full mx-auto">
        <div className="flex items-center gap-2 bg-white shadow-card rounded-xl px-3.5 py-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="Ask Allvex AI..."
            className="flex-1 bg-transparent outline-none text-[12.5px] placeholder:text-slate-400"
          />
          <button onClick={() => send(input)} disabled={loading} className="tap w-7 h-7 rounded-full bg-electric flex items-center justify-center shrink-0 disabled:opacity-50">
            <Send size={12} className="text-white" />
          </button>
        </div>
      </div>

      {/* Vehicle picker sheet */}
      {showVehiclePicker && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50" onClick={() => setShowVehiclePicker(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white w-full sm:w-[420px] sm:rounded-xl rounded-t-[24px] p-5 pb-7 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14.5px] font-bold text-midnight">Select a vehicle</h3>
              <button onClick={() => setShowVehiclePicker(false)}><X size={18} className="text-slate-400" /></button>
            </div>

            <p className="text-[11px] font-semibold text-slate-400 mb-2">Your Garage</p>
            <div className="flex flex-col gap-2 mb-4">
              {garageVehicles.map((v) => (
                <button
                  key={v.id}
                  onClick={() => pickVehicle({ label: v.nickname, brand: v.brand, model: v.model, year: v.year, mileage: v.mileage })}
                  className="tap flex items-center justify-between bg-slate-50 rounded-xl px-3.5 py-3 text-left"
                >
                  <div>
                    <p className="text-[12.5px] font-semibold text-midnight">{v.nickname}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{v.brand} {v.model} · {v.year} · {v.mileage.toLocaleString()} km</p>
                  </div>
                  <Car size={15} className="text-electric shrink-0" />
                </button>
              ))}
            </div>

            <p className="text-[11px] font-semibold text-slate-400 mb-2">Other vehicle</p>
            <div className="flex flex-col gap-2.5">
              <div className="grid grid-cols-2 gap-2.5">
                <input
                  placeholder="Brand (e.g. Honda)"
                  value={customVehicle.brand}
                  onChange={(e) => setCustomVehicle((c) => ({ ...c, brand: e.target.value }))}
                  className="bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 text-[12.5px] outline-none"
                />
                <input
                  placeholder="Model"
                  value={customVehicle.model}
                  onChange={(e) => setCustomVehicle((c) => ({ ...c, model: e.target.value }))}
                  className="bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 text-[12.5px] outline-none"
                />
              </div>
              <input
                placeholder="Year"
                value={customVehicle.year}
                onChange={(e) => setCustomVehicle((c) => ({ ...c, year: e.target.value }))}
                className="bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 text-[12.5px] outline-none"
              />
              <button
                onClick={() => {
                  if (!customVehicle.brand.trim() || !customVehicle.model.trim()) return;
                  pickVehicle({ label: `${customVehicle.brand} ${customVehicle.model}`, brand: customVehicle.brand, model: customVehicle.model, year: customVehicle.year || "—" });
                  setCustomVehicle({ brand: "", model: "", year: "" });
                }}
                className="tap w-full py-3 rounded-xl bg-electric text-white font-semibold text-[13px]"
              >
                Use this vehicle
              </button>
              {vehicle && (
                <button onClick={() => { setVehicle(null); setShowVehiclePicker(false); }} className="tap w-full py-2.5 text-[12px] font-medium text-slate-400">
                  Clear selection
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Diagnose code sheet */}
      {showDiagnose && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50" onClick={() => setShowDiagnose(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white w-full sm:w-[420px] sm:rounded-xl rounded-t-[24px] p-5 pb-7">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[14.5px] font-bold text-midnight">Diagnose a Code</h3>
              <button onClick={() => setShowDiagnose(false)}><X size={18} className="text-slate-400" /></button>
            </div>
            <p className="text-[11px] text-slate-400 mb-4">
              {vehicle ? `For your ${vehicle.brand} ${vehicle.model}` : "Select a vehicle first for a more accurate diagnosis"}
            </p>
            <div className="flex flex-col gap-2.5">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Error code (e.g. P0301)"
                className="bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 text-[12.5px] outline-none uppercase"
              />
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={3}
                placeholder="Symptoms (optional) — rough idle, warning light, unusual noise..."
                className="bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 text-[12.5px] outline-none resize-none"
              />
              <button onClick={submitDiagnosis} className="tap w-full py-3 rounded-xl bg-electric text-white font-semibold text-[13px] mt-1">
                Get Diagnosis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
