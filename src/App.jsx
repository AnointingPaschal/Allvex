import { Routes, Route, useLocation } from "react-router-dom";
import BottomNav from "./components/BottomNav.jsx";
import RequireAuth from "./components/RequireAuth.jsx";
import RequireRole from "./components/RequireRole.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Home from "./pages/Home.jsx";
import Marketplace from "./pages/Marketplace.jsx";
import VehicleDetails from "./pages/VehicleDetails.jsx";
import AccessoryDetail from "./pages/AccessoryDetail.jsx";
import ImportTracking from "./pages/ImportTracking.jsx";
import ImportRequest from "./pages/ImportRequest.jsx";
import Garage from "./pages/Garage.jsx";
import GarageVehicle from "./pages/GarageVehicle.jsx";
import Assistant from "./pages/Assistant.jsx";
import Profile from "./pages/Profile.jsx";
import Checkout from "./pages/Checkout.jsx";
import PortalHub from "./portal/PortalHub.jsx";
import AdminPortal from "./portal/admin/AdminPortal.jsx";
import SupplierPortal from "./portal/supplier/SupplierPortal.jsx";
import InspectorPortal from "./portal/inspector/InspectorPortal.jsx";
import SupportPortal from "./portal/support/SupportPortal.jsx";

const PORTAL_PREFIXES = ["/portals", "/admin", "/supplier", "/inspector", "/support"];

// Pages that render full-screen (no bottom nav)
const NO_NAV = ["/onboarding", "/login", "/signup", "/checkout", "/import/request"];

export default function App() {
  const location = useLocation();
  const isPortal = PORTAL_PREFIXES.some((p) => location.pathname.startsWith(p));
  const noNav = NO_NAV.some((p) => location.pathname.startsWith(p));

  if (isPortal) {
    return (
      <Routes>
        <Route path="/portals"   element={<RequireAuth><PortalHub /></RequireAuth>} />
        <Route path="/admin"     element={<RequireRole role="admin"><AdminPortal /></RequireRole>} />
        <Route path="/supplier"  element={<RequireRole role="supplier"><SupplierPortal /></RequireRole>} />
        <Route path="/inspector" element={<RequireRole role="inspector"><InspectorPortal /></RequireRole>} />
        <Route path="/support"   element={<RequireRole role="support"><SupportPortal /></RequireRole>} />
      </Routes>
    );
  }

  return (
    <div className="app-shell">
      <div className={`page flex-1 flex flex-col w-full min-h-0 ${!noNav ? "nav-offset" : ""}`}>
        <Routes>
          <Route path="/onboarding"      element={<Onboarding />} />
          <Route path="/login"           element={<Login />} />
          <Route path="/signup"          element={<Signup />} />
          <Route path="/"                element={<RequireAuth><Home /></RequireAuth>} />
          <Route path="/marketplace"     element={<RequireAuth><Marketplace /></RequireAuth>} />
          <Route path="/marketplace/:id" element={<RequireAuth><VehicleDetails /></RequireAuth>} />
          <Route path="/accessories/:id" element={<RequireAuth><AccessoryDetail /></RequireAuth>} />
          <Route path="/import"          element={<RequireAuth><ImportTracking /></RequireAuth>} />
          <Route path="/import/request"  element={<RequireAuth><ImportRequest /></RequireAuth>} />
          <Route path="/garage"          element={<RequireAuth><Garage /></RequireAuth>} />
          <Route path="/garage/:id"      element={<RequireAuth><GarageVehicle /></RequireAuth>} />
          <Route path="/assistant"       element={<RequireAuth><Assistant /></RequireAuth>} />
          <Route path="/profile"         element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/checkout"        element={<RequireAuth><Checkout /></RequireAuth>} />
        </Routes>
      </div>
      {!noNav && <BottomNav />}
    </div>
  );
}
