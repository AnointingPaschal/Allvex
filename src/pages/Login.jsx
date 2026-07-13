import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, configured } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setLoading(true);
    const { error } = await signIn({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      setError(error.message === "Invalid login credentials" ? "Incorrect email or password." : error.message);
      return;
    }
    navigate(location.state?.from || "/", { replace: true });
  }

  return (
    <div className="flex flex-col min-h-screen sm:min-h-0 bg-white sm:my-10 sm:rounded-2xl sm:shadow-card px-5 pt-10 sm:pt-8 pb-6 max-w-sm mx-auto w-full">
      <div className="mb-8">
        <div className="w-10 h-10 rounded-2xl bg-midnight flex items-center justify-center mb-6">
          <span className="text-white font-extrabold text-[15px]">A</span>
        </div>
        <h1 className="text-[19px] font-bold text-midnight mb-1">Welcome back</h1>
        <p className="text-slate-400 text-[12.5px]">Log in to continue to your Allvex account.</p>
      </div>

      {!configured && (
        <div className="mb-4 flex items-start gap-2 bg-amber-50 rounded-xl px-3.5 py-3">
          <AlertCircle size={15} className="text-warning shrink-0 mt-0.5" />
          <p className="text-[11.5px] text-slate-600">
            Supabase isn't configured yet. Set <span className="font-mono">VITE_SUPABASE_URL</span> and{" "}
            <span className="font-mono">VITE_SUPABASE_ANON_KEY</span> in Vercel, then redeploy.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <Field icon={Mail} placeholder="Email address" type="email" value={email} onChange={setEmail} />
        <Field icon={Lock} placeholder="Password" type="password" value={password} onChange={setPassword} />

        {error && <p className="text-[12px] text-danger -mt-1">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="tap w-full py-3.5 rounded-allvex bg-electric text-white font-semibold text-[15px] mt-2 flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>

      <p className="text-center text-[13.5px] text-slate-400 mt-auto pt-8">
        Don't have an account?{" "}
        <button onClick={() => navigate("/signup")} className="text-electric font-semibold">Sign up</button>
      </p>
      <button onClick={() => navigate("/portals")} className="tap text-center text-[12px] text-slate-300 font-medium mt-3">
        Staff Portals (Admin, Supplier, Inspector, Support)
      </button>
    </div>
  );
}

function Field({ icon: Icon, value, onChange, ...props }) {
  return (
    <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-allvex px-4 py-3.5">
      <Icon size={18} className="text-slate-400 shrink-0" />
      <input
        {...props}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent outline-none text-[14.5px] w-full placeholder:text-slate-400"
      />
    </div>
  );
}
