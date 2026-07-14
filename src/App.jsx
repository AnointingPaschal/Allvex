import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
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
import Chat from "./pages/Chat.jsx";
import PortalHub from "./portal/PortalHub.jsx";
import AdminPortal from "./portal/admin/AdminPortal.jsx";
import SupplierPortal from "./portal/supplier/SupplierPortal.jsx";
import InspectorPortal from "./portal/inspector/InspectorPortal.jsx";
import SupportPortal from "./portal/support/SupportPortal.jsx";

const PORTAL_PREFIXES = ["/portals", "/admin", "/supplier", "/inspector", "/support"];
const NO_NAV  = ["/onboarding", "/login", "/signup", "/checkout", "/import/request"];
const NO_FAB  = ["/onboarding", "/login", "/signup", "/checkout", "/import/request", "/assistant"];

function AIFab() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate("/assistant")}
      className="tap fixed z-50 flex items-center justify-center shadow-lg"
      style={{ bottom: "calc(72px + env(safe-area-inset-bottom) + 12px)", right: 16, width: 46, height: 46, borderRadius: 23, background: "linear-gradient(135deg,#1E40AF 0%,#3B82F6 100%)" }}
      title="Ask AI"
    >
      {/* Sparkle AI icon */}
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z"
          fill="white" opacity="0.95"/>
        <circle cx="19" cy="5" r="1.5" fill="white" opacity="0.7"/>
        <circle cx="5" cy="19" r="1" fill="white" opacity="0.5"/>
      </svg>
    </button>
  );
}

export default function App() {
  const location = useLocation();
  const isPortal = PORTAL_PREFIXES.some((p) => location.pathname.startsWith(p));
  const noNav = NO_NAV.some((p) => location.pathname.startsWith(p));
  const noFab = NO_FAB.some((p) => location.pathname.startsWith(p));

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
          <Route path="/chat"            element={<RequireAuth><Chat /></RequireAuth>} />
        </Routes>
      </div>
      {!noNav && <BottomNav />}
      {!noNav && !noFab && <AIFab />}
    </div>
  );
}
