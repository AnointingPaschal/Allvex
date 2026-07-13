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
import {
  LayoutGrid, Users, PackageCheck, Truck, Car,
  ClipboardCheck, Newspaper, ShoppingBag, Ticket,
  Bell, MessageSquare,
} from "lucide-react";

const sections = [
  { key: "overview",     label: "Overview",     icon: LayoutGrid },
  { key: "customers",    label: "Customers",    icon: Users },
  { key: "orders",       label: "Import Orders", icon: PackageCheck },
  { key: "quotes",       label: "Quotes",       icon: MessageSquare },
  { key: "suppliers",    label: "Suppliers",    icon: Truck },
  { key: "vehicles",     label: "Vehicles",     icon: Car },
  { key: "inspectors",   label: "Inspectors",   icon: ClipboardCheck },
  { key: "accessories",  label: "Accessories",  icon: ShoppingBag },
  { key: "tickets",      label: "Support",      icon: Ticket },
  { key: "content",      label: "Content",      icon: Newspaper },
  { key: "notifications",label: "Notifications",icon: Bell },
];

const subtitles = {
  overview: "Platform overview and key metrics",
  customers: "View, manage and suspend customer accounts",
  orders: "Manage import orders, stages and timelines",
  quotes: "Respond to customer import quote requests",
  suppliers: "Approve, suspend and manage supplier partners",
  vehicles: "Full CRUD — add, edit, verify and delist vehicles",
  inspectors: "Manage inspectors and assign inspection jobs",
  accessories: "Products, stock levels and customer orders",
  tickets: "Customer support queue and ticket resolution",
  content: "Publish and manage articles in the Content Hub",
  notifications: "Send notifications to users",
};

export default function AdminPortal() {
  const [active, setActive] = useState("overview");
  const toast = useToast();

  const Section = {
    overview: Overview,
    customers: Customers,
    orders: Orders,
    quotes: Quotes,
    suppliers: Suppliers,
    vehicles: Vehicles,
    inspectors: Inspectors,
    accessories: Accessories,
    tickets: Tickets,
    content: Content,
    notifications: Notifications,
  }[active];

  return (
    <>
      <Toast toasts={toast.toasts} remove={toast.remove} />
      <DashboardLayout
        roleLabel="Administrator"
        roleColor="bg-electric"
        sections={sections}
        active={active}
        onSelect={setActive}
        title={sections.find((s) => s.key === active)?.label || ""}
        subtitle={subtitles[active]}
      >
        {Section && <Section toast={toast} />}
      </DashboardLayout>
    </>
  );
}
