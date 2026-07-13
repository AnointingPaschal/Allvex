import { useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";

const suggestions = [
  "Where is my car?",
  "Compare BYD vs GAC",
  "Find SUV under ₦20m",
  "Why is my health score dropping?",
];

const initialMessages = [
  { from: "ai", text: "Hi Alex. I'm your Allvex assistant. Ask me about your imports, your garage, or any vehicle." },
];

export default function Assistant() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");

  function send(text) {
    if (!text.trim()) return;
    setMessages((m) => [...m, { from: "user", text }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [...m, { from: "ai", text: reply(text) }]);
    }, 500);
  }

  function reply(text) {
    const t = text.toLowerCase();
    if (t.includes("where") && t.includes("car")) return "Your BYD Seal Premium is currently at sea and expected to arrive in 18 days.";
    if (t.includes("compare")) return "The BYD Seal offers longer range and lower running cost. The GAC GS8 offers more interior space and 7 seats.";
    if (t.includes("suv")) return "Here are SUVs under ₦20m: Chery Tiggo 8 Pro (₦19.8m). Want me to show more options?";
    if (t.includes("health")) return "Your health score dropped because your brake inspection is overdue by 3 days. I'd recommend booking one this week.";
    return "Got it — let me look into that for you.";
  }

  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 76px)" }}>
      <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-3.5 bg-midnight text-white flex items-center gap-2.5 rounded-b-[24px]">
        <div className="w-9 h-9 rounded-full bg-electric flex items-center justify-center shrink-0">
          <Bot size={16} />
        </div>
        <div>
          <p className="font-semibold text-[13px]">Allvex Assistant</p>
          <p className="text-[10px] text-slate-400">Always available</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-2.5 max-w-2xl w-full mx-auto">
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[80%] px-3.5 py-2 rounded-xl text-[12.5px] leading-snug ${
            m.from === "ai" ? "bg-white shadow-card text-midnight self-start" : "bg-electric text-white self-end"
          }`}>
            {m.text}
          </div>
        ))}

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

      <div className="px-4 sm:px-6 lg:px-8 pb-4 pt-1.5 max-w-2xl w-full mx-auto">
        <div className="flex items-center gap-2 bg-white shadow-card rounded-xl px-3.5 py-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="Ask Allvex AI..."
            className="flex-1 bg-transparent outline-none text-[12.5px] placeholder:text-slate-400"
          />
          <button onClick={() => send(input)} className="tap w-7 h-7 rounded-full bg-electric flex items-center justify-center shrink-0">
            <Send size={12} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
