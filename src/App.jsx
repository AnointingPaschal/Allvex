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

export default function App() {
  const location = useLocation();
  const noNav = ["/onboarding", "/login", "/signup"].includes(location.pathname);

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
