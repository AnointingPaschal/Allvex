export function KpiCard({ label, value, sub, icon: Icon }) {
  return (
    <div className="bg-white rounded-allvex shadow-card p-5 flex items-start justify-between">
      <div>
        <p className="text-[12.5px] text-slate-400 font-medium">{label}</p>
        <p className="text-[24px] font-bold text-midnight mt-1.5">{value}</p>
        {sub && <p className="text-[11.5px] text-success font-medium mt-1">{sub}</p>}
      </div>
      {Icon && (
        <div className="w-10 h-10 rounded-xl bg-electric/10 flex items-center justify-center shrink-0">
          <Icon size={18} className="text-electric" />
        </div>
      )}
    </div>
  );
}

const badgeStyles = {
  success: "bg-green-50 text-success",
  warning: "bg-amber-50 text-warning",
  danger: "bg-red-50 text-danger",
  info: "bg-blue-50 text-electric",
  neutral: "bg-slate-100 text-slate-500",
};

export function Badge({ tone = "neutral", children }) {
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-pill whitespace-nowrap ${badgeStyles[tone]}`}>
      {children}
    </span>
  );
}

export function Panel({ title, action, children, className = "" }) {
  return (
    <div className={`bg-white rounded-allvex shadow-card ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-[14px] font-bold text-midnight">{title}</h3>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function Table({ columns, children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-100">
            {columns.map((c) => (
              <th key={c} className="px-5 py-3 text-[11.5px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  );
}

export function Td({ children, bold = false, className = "", ...rest }) {
  return (
    <td {...rest} className={`px-5 py-3.5 text-[13px] whitespace-nowrap ${bold ? "font-semibold text-midnight" : "text-slate-500"} ${className}`}>
      {children}
    </td>
  );
}

export function Button({ children, variant = "primary", ...props }) {
  const styles = {
    primary: "bg-electric text-white",
    dark: "bg-midnight text-white",
    ghost: "bg-slate-100 text-midnight",
    danger: "bg-red-50 text-danger",
  };
  return (
    <button
      {...props}
      className={`tap px-4 py-2.5 rounded-xl text-[12.5px] font-semibold ${styles[variant]} ${props.className || ""}`}
    >
      {children}
    </button>
  );
}
