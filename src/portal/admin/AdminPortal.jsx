import { useState } from "react";
import DashboardLayout from "../DashboardLayout.jsx";
import { Toast, useToast } from "./components/ui.jsx";
import Overview from "./sections/Overview.jsx";
import Customers from "./sections/Customers.jsx";
import Orders from "./sections/Orders.jsx";
import Suppliers from "./sections/Suppliers.jsx";
import Vehicles from "./sections/Vehicles.jsx";
import Inspectors from "./sections/Inspectors.jsx";
import Content from "./sections/Content.jsx";
import Accessories from "./sections/Accessories.jsx";
import Tickets from "./sections/Tickets.jsx";
import Notifications from "./sections/Notifications.jsx";
import Quotes from "./sections/Quotes.jsx";
import PaymentSettings from "./sections/PaymentSettings.jsx";
import ImportRequests from "./sections/ImportRequests.jsx";
import LiveChat from "./sections/LiveChat.jsx";
import {
  LayoutGrid, Users, PackageCheck, Truck, Car,
  ClipboardCheck, Newspaper, ShoppingBag, Ticket,
  Bell, MessageSquare, CreditCard, MessageCircle,
} from "lucide-react";

const sections = [
  { key: "overview",        label: "Overview",          icon: LayoutGrid },
  { key: "customers",       label: "Customers",         icon: Users },
  { key: "import_requests", label: "Import Requests",   icon: PackageCheck },
  { key: "orders",          label: "Import Orders",     icon: PackageCheck },
  { key: "quotes",          label: "Quotes",            icon: MessageSquare },
  { key: "suppliers",       label: "Suppliers",         icon: Truck },
  { key: "vehicles",        label: "Vehicles",          icon: Car },
  { key: "inspectors",      label: "Inspectors",        icon: ClipboardCheck },
  { key: "accessories",     label: "Accessories",       icon: ShoppingBag },
  { key: "tickets",         label: "Support",           icon: Ticket },
  { key: "live_chat",       label: "Live Chat",         icon: MessageCircle },
  { key: "content",         label: "Content",           icon: Newspaper },
  { key: "notifications",   label: "Notifications",     icon: Bell },
  { key: "payment",         label: "Payment Settings",  icon: CreditCard },
];

const subtitles = {
  overview: "Platform overview and key metrics",
  customers: "View, manage and suspend customer accounts",
  import_requests: "Customer-submitted import requests — review and convert to orders",
  orders: "Manage import orders, stages and timelines",
  quotes: "Respond to customer import quote requests",
  suppliers: "Approve, suspend and manage supplier partners",
  vehicles: "Full CRUD — add, edit, verify and delist vehicles",
  inspectors: "Manage inspectors and assign inspection jobs",
  accessories: "Products, stock levels and customer orders",
  tickets: "Customer support queue and ticket resolution",
  content: "Publish and manage articles in the Content Hub",
  notifications: "Send notifications to users",
  live_chat: "Reply to customer conversations in real-time",
};

export default function AdminPortal() {
  const [active, setActive] = useState("overview");
  const toast = useToast();

  const Section = {
    overview: Overview, customers: Customers, import_requests: ImportRequests,
    orders: Orders, quotes: Quotes, suppliers: Suppliers, vehicles: Vehicles,
    inspectors: Inspectors, accessories: Accessories, tickets: Tickets,
    live_chat: LiveChat, content: Content, notifications: Notifications, payment: PaymentSettings,
  }[active];

  return (
    <>
      <Toast toasts={toast.toasts} remove={toast.remove} />
      <DashboardLayout
        roleLabel="Administrator" roleColor="bg-electric" sections={sections}
        active={active} onSelect={setActive}
        title={sections.find((s) => s.key === active)?.label || ""}
        subtitle={subtitles[active]}
      >
        {Section && <Section toast={toast} />}
      </DashboardLayout>
    </>
  );
}
