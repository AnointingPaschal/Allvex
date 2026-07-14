import { NavLink, useLocation } from "react-router-dom";
import { Home, Car, Wrench, MessageCircle, User } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";

const items = [
  { to: "/",            icon: Home,          label: "Home" },
  { to: "/marketplace", icon: Car,           label: "Shop" },
  { to: "/garage",      icon: Wrench,        label: "Garage" },
  { to: "/chat",        icon: MessageCircle, label: "Chat" },
  { to: "/profile",     icon: User,          label: "Profile" },
];

export default function BottomNav() {
  const { count: cartCount } = useCart();
  const { profile } = useAuth();
  const [chatUnread, setChatUnread] = useState(0);
  const location = useLocation();

  useEffect(() => {
    if (!profile) return;
    loadUnread();

    const channel = supabase
      .channel("nav-chat-badge")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "advisor_chat_messages",
      }, () => loadUnread())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [profile, location.pathname]);

  async function loadUnread() {
    if (!profile) return;
    // Get IDs of this customer's chats
    const { data: chatRows } = await supabase
      .from("advisor_chats")
      .select("id")
      .eq("customer_id", profile.id);
    if (!chatRows?.length) return;

    const { count } = await supabase
      .from("advisor_chat_messages")
      .select("id", { count: "exact", head: true })
      .in("chat_id", chatRows.map((c) => c.id))
      .eq("read_by_customer", false)
      .eq("sender_role", "advisor");

    setChatUnread(count || 0);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-slate-100">
      <div className="page flex justify-between sm:justify-center sm:gap-1 px-2 sm:px-4 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `tap flex-1 sm:flex-none sm:w-20 flex flex-col items-center gap-0.5 py-1.5 rounded-xl mx-0.5 transition-colors relative ${
                isActive ? "text-electric" : "text-slate-400"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon size={19} strokeWidth={isActive ? 2.4 : 2} />
                  {to === "/marketplace" && cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-electric text-white text-[8px] font-bold flex items-center justify-center">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                  {to === "/chat" && chatUnread > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-danger text-white text-[8px] font-bold flex items-center justify-center">
                      {chatUnread > 9 ? "9+" : chatUnread}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] ${isActive ? "font-semibold" : "font-medium"}`}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
