import { Routes, Route, useLocation } from "react-router-dom";
import BottomNav from "./components/BottomNav.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Home from "./pages/Home.jsx";
import Marketplace from "./pages/Marketplace.jsx";
import VehicleDetails from "./pages/VehicleDetails.jsx";
import ImportTracking from "./pages/ImportTracking.jsx";
import Garage from "./pages/Garage.jsx";
import GarageVehicle from "./pages/GarageVehicle.jsx";
import Assistant from "./pages/Assistant.jsx";
import Profile from "./pages/Profile.jsx";
import PortalHub from "./portal/PortalHub.jsx";
import AdminPortal from "./portal/admin/AdminPortal.jsx";
import SupplierPortal from "./portal/supplier/SupplierPortal.jsx";
import InspectorPortal from "./portal/inspector/InspectorPortal.jsx";
import SupportPortal from "./portal/support/SupportPortal.jsx";

const PORTAL_PREFIXES = ["/portals", "/admin", "/supplier", "/inspector", "/support"];

export default function App() {
  const location = useLocation();
  const isPortal = PORTAL_PREFIXES.some((p) => location.pathname.startsWith(p));
  const noNav = ["/onboarding", "/login", "/signup"].includes(location.pathname);

  if (isPortal) {
    return (
      <Routes>
        <Route path="/portals" element={<PortalHub />} />
        <Route path="/admin" element={<AdminPortal />} />
        <Route path="/supplier" element={<SupplierPortal />} />
        <Route path="/inspector" element={<InspectorPortal />} />
        <Route path="/support" element={<SupportPortal />} />
      </Routes>
    );
  }

  return (
    <div className="app-shell">
      <div className="flex-1 flex flex-col">
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/:id" element={<VehicleDetails />} />
          <Route path="/import" element={<ImportTracking />} />
          <Route path="/garage" element={<Garage />} />
          <Route path="/garage/:id" element={<GarageVehicle />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
      {!noNav && <BottomNav />}
    </div>
  );
}
