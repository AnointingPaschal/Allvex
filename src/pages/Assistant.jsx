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
    <div className="flex flex-col h-screen">
      <div className="px-5 pt-14 pb-4 bg-midnight text-white flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-electric flex items-center justify-center">
          <Bot size={19} />
        </div>
        <div>
          <p className="font-semibold text-[14.5px]">Allvex Assistant</p>
          <p className="text-[11px] text-slate-400">Always available</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-5 flex flex-col gap-3">
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[80%] px-4 py-2.5 rounded-allvex text-[13.5px] leading-snug ${
            m.from === "ai" ? "bg-white shadow-card text-midnight self-start" : "bg-electric text-white self-end"
          }`}>
            {m.text}
          </div>
        ))}

        {messages.length === 1 && (
          <div className="mt-2">
            <p className="text-[11.5px] text-slate-400 mb-2 flex items-center gap-1.5"><Sparkles size={12} /> Try asking</p>
            <div className="flex flex-col gap-2">
              {suggestions.map((s) => (
                <button key={s} onClick={() => send(s)} className="tap text-left bg-white shadow-card rounded-allvex px-4 py-3 text-[13px] text-midnight font-medium">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-5 pb-5 pt-2 bg-transparent">
        <div className="flex items-center gap-2.5 bg-white shadow-card rounded-allvex px-4 py-2.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="Ask Allvex AI..."
            className="flex-1 bg-transparent outline-none text-[13.5px] placeholder:text-slate-400"
          />
          <button onClick={() => send(input)} className="tap w-8 h-8 rounded-full bg-electric flex items-center justify-center shrink-0">
            <Send size={14} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
