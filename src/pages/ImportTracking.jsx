import { useEffect, useState } from "react";
import TopBar from "../components/TopBar.jsx";
import StageTimeline from "../components/StageTimeline.jsx";
import VehicleArt from "../components/VehicleArt.jsx";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";
import { FileText, MessageSquare, Wallet, Loader2 } from "lucide-react";

export default function ImportTracking() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    if (!profile) return;
    async function load() {
      setLoading(true);
      const { data: orders } = await supabase
        .from("import_orders")
        .select("*")
        .eq("customer_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(1);

      const current = orders?.[0] || null;
      setOrder(current);

      if (current) {
        const { data: events } = await supabase
          .from("order_timeline_events")
          .select("*")
          .eq("order_id", current.id)
          .order("position", { ascending: true });
        setTimeline((events || []).map((e) => ({ label: e.label, done: e.done, current: e.is_current, date: e.event_date })));
      }
      setLoading(false);
    }
    load();
  }, [profile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={22} className="animate-spin text-electric" />
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <TopBar title="Import Tracking" />
        <div className="px-4 sm:px-6 lg:px-8 pt-10 text-center">
          <p className="text-[13px] text-slate-400">You don't have any active imports yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-6">
      <TopBar title="Import Tracking" />
      <div className="px-4 sm:px-6 lg:px-8 pt-2 lg:grid lg:grid-cols-2 lg:gap-6">
        <div>
          <div className="bg-midnight rounded-xl p-3.5 flex gap-3 items-center">
            <VehicleArt category="Electric" className="w-14 h-14 rounded-lg shrink-0" iconSize={22} />
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-[12.5px] truncate">{order.vehicle_label}</p>
              <p className="text-slate-400 text-[10.5px] mt-0.5">Order #{order.order_number}</p>
              <div className="h-1.5 bg-white/10 rounded-pill mt-2 overflow-hidden">
                <div className="h-full bg-electric rounded-pill" style={{ width: `${order.progress}%` }} />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">{order.progress}% · ETA {order.eta_days} days</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3.5">
            <QuickBtn icon={FileText} label="Documents" />
            <QuickBtn icon={MessageSquare} label="Messages" />
            <QuickBtn icon={Wallet} label="Payments" />
          </div>

          <div className="mt-4 bg-amber-50 rounded-xl p-3.5">
            <p className="text-[11.5px] font-semibold text-warning">No delays reported</p>
            <p className="text-[10.5px] text-slate-500 mt-1">Your vehicle is on schedule. We'll notify you the moment its status changes.</p>
          </div>
        </div>

        <div>
          <h2 className="text-[13px] font-bold text-midnight mt-5 lg:mt-0 mb-3">Shipment Timeline</h2>
          <div className="bg-white rounded-xl shadow-card p-4">
            <StageTimeline stages={timeline} />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickBtn({ icon: Icon, label }) {
  return (
    <button className="tap bg-white rounded-xl shadow-card py-3 flex flex-col items-center gap-1">
      <Icon size={15} className="text-electric" />
      <span className="text-[10px] font-semibold text-midnight">{label}</span>
    </button>
  );
}
