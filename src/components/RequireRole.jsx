import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Loader2, ShieldAlert } from "lucide-react";

export default function RequireRole({ role, children }) {
  const { isAuthenticated, loading, profile } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 size={22} className="animate-spin text-electric" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!profile || profile.role !== role) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center gap-3">
        <ShieldAlert size={28} className="text-danger" />
        <p className="font-semibold text-midnight text-[15px]">You don't have access to this portal</p>
        <p className="text-slate-400 text-[13px] max-w-xs">
          This account is signed in as {profile?.role || "a customer"}. Ask an administrator if you believe this is a mistake.
        </p>
      </div>
    );
  }

  return children;
}
