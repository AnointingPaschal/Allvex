import { NavLink, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";

// Sleek icon components — thin stroke, modern feel
function IconHome({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
      <path d="M9 21V12h6v9"/>
    </svg>
  );
}
function IconShop({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  );
}
function IconGarage({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="1"/>
      <path d="M16 21V7a2 2 0 00-2-2h-4a2 2 0 00-2 2v14"/>
      <path d="M2 7l10-5 10 5"/>
    </svg>
  );
}
function IconChat({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      <line x1="9" y1="10" x2="15" y2="10"/>
      <line x1="9" y1="14" x2="13" y2="14"/>
    </svg>
  );
}
function IconProfile({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  );
}

const items = [
  { to: "/",            Icon: IconHome,    label: "Home" },
  { to: "/marketplace", Icon: IconShop,    label: "Shop" },
  { to: "/garage",      Icon: IconGarage,  label: "Garage" },
  { to: "/chat",        Icon: IconChat,    label: "Chat" },
  { to: "/profile",     Icon: IconProfile, label: "Profile" },
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
      .channel("nav-unread")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "advisor_chat_messages" }, loadUnread)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [profile, location.pathname]);

  async function loadUnread() {
    if (!profile) return;
    const { data: chatRows } = await supabase.from("advisor_chats").select("id").eq("customer_id", profile.id);
    if (!chatRows?.length) return;
    const { count } = await supabase
      .from("advisor_chat_messages").select("id", { count: "exact", head: true })
      .in("chat_id", chatRows.map((c) => c.id))
      .eq("read_by_customer", false).eq("sender_role", "advisor");
    setChatUnread(count || 0);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100"
      style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }}>
      <div className="page flex justify-between sm:justify-center sm:gap-0 px-1 sm:px-4 pt-1">
        {items.map(({ to, Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className="tap flex-1 sm:w-20 sm:flex-none"
          >
            {({ isActive }) => (
              <div className={`flex flex-col items-center gap-0.5 py-1 mx-0.5 rounded-xl transition-colors ${isActive ? "text-electric" : "text-slate-400"}`}>
                {/* Active background pill */}
                <div className={`relative flex items-center justify-center w-10 h-7 rounded-xl transition-all ${isActive ? "bg-electric/10" : ""}`}>
                  <Icon active={isActive} />
                  {/* Cart badge */}
                  {to === "/marketplace" && cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-electric text-white text-[8px] font-bold flex items-center justify-center leading-none">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                  {/* Chat unread badge */}
                  {to === "/chat" && chatUnread > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center leading-none">
                      {chatUnread > 9 ? "9+" : chatUnread}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] leading-none pb-0.5 ${isActive ? "font-semibold text-electric" : "font-normal text-slate-400"}`}>
                  {label}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
