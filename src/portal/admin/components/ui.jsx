import { useEffect, useState, useRef } from "react";
import { X, Loader2, AlertTriangle, Check, Info } from "lucide-react";

// ─── Toast ─────────────────────────────────────────────────────────────────
const toastStyles = {
  success: "bg-success text-white",
  error: "bg-danger text-white",
  info: "bg-electric text-white",
};
const ToastIcon = { success: Check, error: AlertTriangle, info: Info };

export function Toast({ toasts, remove }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => {
        const Icon = ToastIcon[t.type] || Info;
        return (
          <div key={t.id} className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-lg text-[12.5px] font-medium pointer-events-auto max-w-xs ${toastStyles[t.type]}`}>
            <Icon size={14} strokeWidth={2.5} />
            <span>{t.message}</span>
            <button onClick={() => remove(t.id)} className="ml-1 opacity-70 hover:opacity-100"><X size={13} /></button>
          </div>
        );
      })}
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState([]);
  function add(message, type = "success") {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }
  function remove(id) { setToasts((t) => t.filter((x) => x.id !== id)); }
  return { toasts, remove, success: (m) => add(m, "success"), error: (m) => add(m, "error"), info: (m) => add(m, "info") };
}

// ─── Modal ─────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, width = "max-w-lg" }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className={`bg-white rounded-2xl w-full ${width} max-h-[90vh] overflow-y-auto shadow-2xl`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h3 className="text-[15px] font-bold text-midnight">{title}</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
            <X size={15} className="text-slate-500" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ─── Confirm Dialog ─────────────────────────────────────────────────────────
export function Confirm({ title, message, onConfirm, onCancel, confirmLabel = "Confirm", danger = false }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${danger ? "bg-red-50" : "bg-amber-50"}`}>
            <AlertTriangle size={18} className={danger ? "text-danger" : "text-warning"} />
          </div>
          <div>
            <p className="font-bold text-midnight text-[14px]">{title}</p>
            <p className="text-slate-400 text-[12.5px] mt-1 leading-snug">{message}</p>
          </div>
        </div>
        <div className="flex gap-2.5">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-midnight text-[12.5px] font-semibold">Cancel</button>
          <button onClick={onConfirm} className={`flex-1 py-2.5 rounded-xl text-white text-[12.5px] font-semibold ${danger ? "bg-danger" : "bg-electric"}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Form field ─────────────────────────────────────────────────────────────
export function Field({ label, children, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11.5px] font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

export function Input({ ...props }) {
  return <input {...props} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] outline-none focus:border-electric focus:ring-2 focus:ring-electric/10 transition" />;
}

export function Select({ children, ...props }) {
  return (
    <select {...props} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] outline-none focus:border-electric transition">
      {children}
    </select>
  );
}

export function Textarea({ ...props }) {
  return <textarea {...props} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] outline-none focus:border-electric transition resize-none" />;
}

export function SaveBtn({ saving, label = "Save", onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={saving || disabled} className="w-full py-2.5 rounded-xl bg-electric text-white font-semibold text-[13px] flex items-center justify-center gap-2 disabled:opacity-60">
      {saving && <Loader2 size={14} className="animate-spin" />}
      {saving ? "Saving..." : label}
    </button>
  );
}

// ─── Search bar ─────────────────────────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder = "Search...", children }) {
  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 min-w-[200px]">
        <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="bg-transparent outline-none text-[12.5px] w-full placeholder:text-slate-400" />
      </div>
      {children}
    </div>
  );
}

// ─── Spinner / Empty ────────────────────────────────────────────────────────
export function Spinner() {
  return <div className="flex justify-center py-12"><Loader2 size={22} className="animate-spin text-electric" /></div>;
}

export function EmptyState({ text = "No records found." }) {
  return <div className="py-12 text-center text-[13px] text-slate-400">{text}</div>;
}

// ─── Status chip ────────────────────────────────────────────────────────────
const chipStyles = {
  success: "bg-green-50 text-success", warning: "bg-amber-50 text-warning",
  danger: "bg-red-50 text-danger", info: "bg-blue-50 text-electric", neutral: "bg-slate-100 text-slate-500",
};
export function Chip({ tone = "neutral", children }) {
  return <span className={`text-[10.5px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${chipStyles[tone]}`}>{children}</span>;
}

// ─── Stats card ─────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, icon: Icon, tone = "electric" }) {
  const colors = { electric: "bg-electric/10 text-electric", success: "bg-success/10 text-success", warning: "bg-warning/10 text-warning", danger: "bg-danger/10 text-danger" };
  return (
    <div className="bg-white rounded-2xl shadow-card p-5 flex items-start justify-between">
      <div>
        <p className="text-[11.5px] text-slate-400 font-medium">{label}</p>
        <p className="text-[26px] font-bold text-midnight mt-1 leading-none">{value}</p>
        {sub && <p className="text-[11px] text-success font-medium mt-1.5">{sub}</p>}
      </div>
      {Icon && <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[tone]}`}><Icon size={18} /></div>}
    </div>
  );
}

// ─── Table shell ────────────────────────────────────────────────────────────
export function DataTable({ columns, children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-100">
            {columns.map((c) => <th key={c} className="px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{c}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">{children}</tbody>
      </table>
    </div>
  );
}

export function TR({ children }) { return <tr className="hover:bg-slate-50 transition-colors">{children}</tr>; }
export function TD({ children, bold, className = "" }) {
  return <td className={`px-5 py-3.5 text-[12.5px] whitespace-nowrap ${bold ? "font-semibold text-midnight" : "text-slate-500"} ${className}`}>{children}</td>;
}

// ─── Action button ───────────────────────────────────────────────────────────
const btnStyles = {
  primary: "bg-electric text-white hover:bg-blue-700",
  dark: "bg-midnight text-white hover:bg-slate-800",
  ghost: "bg-slate-100 text-midnight hover:bg-slate-200",
  danger: "bg-red-50 text-danger hover:bg-red-100",
  success: "bg-green-50 text-success hover:bg-green-100",
};
export function Btn({ variant = "ghost", children, className = "", ...rest }) {
  return (
    <button {...rest} className={`tap px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition ${btnStyles[variant]} disabled:opacity-50 ${className}`}>
      {children}
    </button>
  );
}

// ─── Section panel ───────────────────────────────────────────────────────────
export function SectionPanel({ title, action, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-card">
      {(title || action) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-[14px] font-bold text-midnight">{title}</h3>
          <div className="flex gap-2">{action}</div>
        </div>
      )}
      {children}
    </div>
  );
}
