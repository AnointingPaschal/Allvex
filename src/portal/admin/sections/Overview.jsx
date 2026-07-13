import { useEffect, useState } from "react";
import { Users, PackageCheck, Car, TriangleAlert, Ticket, TrendingUp, ClipboardCheck, ShoppingBag } from "lucide-react";
import { StatCard, Spinner, Chip } from "../components/ui.jsx";
import { supabase } from "../../../lib/supabase.js";

export default function Overview({ toast }) {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
    // Refresh every 30s
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  async function load() {
    const [
      customers, activeOrders, allVehicles, pendingInsp,
      openTickets, accessories, quotes, recentOrders
    ] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
      supabase.from("import_orders").select("id", { count: "exact", head: true }).not("stage", "in", "(delivered,cancelled)"),
      supabase.from("vehicles").select("id", { count: "exact", head: true }),
      supabase.from("inspections").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("support_tickets").select("id", { count: "exact", head: true }).eq("status", "open"),
      supabase.from("accessories").select("id", { count: "exact", head: true }),
      supabase.from("quote_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("import_orders")
        .select("*, profiles(full_name)")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

    setStats({
      customers: customers.count || 0,
      activeOrders: activeOrders.count || 0,
      vehicles: allVehicles.count || 0,
      pendingInsp: pendingInsp.count || 0,
      openTickets: openTickets.count || 0,
      accessories: accessories.count || 0,
      pendingQuotes: quotes.count || 0,
    });
    setActivity(recentOrders.data || []);
    setLoading(false);
  }

  const stageTone = (s) => {
    if (["delivered"].includes(s)) return "success";
    if (["customs_clearance", "arrived_port"].includes(s)) return "warning";
    if (["cancelled"].includes(s)) return "danger";
    return "info";
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Customers" value={stats.customers} icon={Users} tone="electric" />
        <StatCard label="Active Imports" value={stats.activeOrders} icon={PackageCheck} tone="success" />
        <StatCard label="Marketplace Vehicles" value={stats.vehicles} icon={Car} tone="electric" />
        <StatCard label="Pending Inspections" value={stats.pendingInsp} icon={ClipboardCheck} tone="warning" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Open Tickets" value={stats.openTickets} icon={Ticket} tone="danger" />
        <StatCard label="Pending Quotes" value={stats.pendingQuotes} icon={TrendingUp} tone="warning" />
        <StatCard label="Accessories" value={stats.accessories} icon={ShoppingBag} tone="electric" />
      </div>

      {/* Attention items */}
      {(stats.pendingInsp > 0 || stats.pendingQuotes > 0 || stats.openTickets > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-[13px] font-semibold text-warning mb-2.5">Items needing attention</p>
          <div className="flex flex-wrap gap-2">
            {stats.pendingInsp > 0 && <Chip tone="warning">{stats.pendingInsp} pending inspection{stats.pendingInsp > 1 ? "s" : ""}</Chip>}
            {stats.pendingQuotes > 0 && <Chip tone="warning">{stats.pendingQuotes} unanswered quote{stats.pendingQuotes > 1 ? "s" : ""}</Chip>}
            {stats.openTickets > 0 && <Chip tone="danger">{stats.openTickets} open support ticket{stats.openTickets > 1 ? "s" : ""}</Chip>}
          </div>
        </div>
      )}

      {/* Recent orders */}
      <div className="bg-white rounded-2xl shadow-card">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-[14px] font-bold text-midnight">Recent Import Activity</h3>
          <button onClick={load} className="text-[12px] text-electric font-medium">Refresh</button>
        </div>
        <div className="divide-y divide-slate-50">
          {activity.length === 0 && (
            <p className="px-6 py-6 text-[13px] text-slate-400">No orders yet.</p>
          )}
          {activity.map((o) => (
            <div key={o.id} className="flex items-center justify-between px-6 py-3.5 gap-4">
              <div className="min-w-0">
                <p className="text-[12.5px] font-semibold text-midnight truncate">{o.vehicle_label}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{o.profiles?.full_name || "—"} · {o.order_number}</p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="hidden sm:flex items-center gap-1.5 w-28">
                  <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-electric rounded-full" style={{ width: `${o.progress}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-400">{o.progress}%</span>
                </div>
                <Chip tone={stageTone(o.stage)}>{o.stage.replaceAll("_", " ")}</Chip>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
