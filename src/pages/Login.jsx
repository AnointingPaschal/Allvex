import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Loader2, Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const features = [
  "Import vehicles directly from trusted suppliers",
  "Track your shipment at every stage, in real time",
  "Manage your garage, documents and maintenance",
  "AI-powered diagnostics and vehicle advice",
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, configured } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) { setError("Enter your email and password."); return; }
    setLoading(true);
    const { error } = await signIn({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      setError(error.message === "Invalid login credentials" ? "Incorrect email or password. Please try again." : error.message);
      return;
    }
    navigate(location.state?.from || "/", { replace: true });
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel (brand) ── */}
      <div className="hidden lg:flex lg:w-[52%] bg-midnight flex-col justify-between px-14 py-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-electric/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-electric/5 blur-3xl" />
          <div className="absolute top-1/2 -translate-y-1/2 right-0 w-px h-[60%] bg-gradient-to-b from-transparent via-white/10 to-transparent" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-electric flex items-center justify-center">
            <span className="text-white font-black text-[16px]">A</span>
          </div>
          <div>
            <p className="text-white font-bold text-[17px] leading-none">Allvex</p>
            <p className="text-slate-400 text-[11px] mt-0.5">Automotive Operating System</p>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative z-10">
          <p className="text-[11px] font-semibold text-electric uppercase tracking-widest mb-4">Africa's Most Trusted Auto Platform</p>
          <h1 className="text-white text-[36px] font-black leading-tight mb-6">
            Import Smarter.<br />
            Own Better.<br />
            <span className="text-electric">Drive the Future.</span>
          </h1>
          <div className="flex flex-col gap-3">
            {features.map((f) => (
              <div key={f} className="flex items-start gap-2.5">
                <CheckCircle size={15} className="text-electric shrink-0 mt-0.5" />
                <p className="text-slate-300 text-[13.5px]">{f}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10 border-t border-white/10 pt-5">
          <p className="text-slate-400 text-[12px] italic">"Allvex changed how I import cars completely — total transparency, zero stress."</p>
          <p className="text-slate-500 text-[11px] mt-2">— Alex J., BYD Seal owner, Lagos</p>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex flex-col min-h-screen bg-[#F6F8FB]">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-2.5 px-6 py-5 bg-midnight">
          <div className="w-8 h-8 rounded-xl bg-electric flex items-center justify-center">
            <span className="text-white font-black text-[13px]">A</span>
          </div>
          <p className="text-white font-bold text-[15px]">Allvex</p>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-[420px]">
            <div className="mb-8">
              <h2 className="text-[26px] font-black text-midnight leading-tight">Welcome back</h2>
              <p className="text-slate-400 text-[14px] mt-1.5">Sign in to your Allvex account to continue.</p>
            </div>

            {!configured && (
              <div className="mb-5 flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5">
                <div className="w-5 h-5 rounded-full bg-warning/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-warning text-[11px] font-black">!</span>
                </div>
                <p className="text-[12px] text-slate-600">
                  Supabase isn't configured. Add <span className="font-mono font-semibold">VITE_SUPABASE_URL</span> and{" "}
                  <span className="font-mono font-semibold">VITE_SUPABASE_ANON_KEY</span> in Vercel and redeploy.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              {/* Email */}
              <div>
                <label className="text-[12px] font-semibold text-slate-500 block mb-1.5">Email address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3.5 text-[14px] outline-none focus:border-electric focus:ring-4 focus:ring-electric/10 transition placeholder:text-slate-300"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[12px] font-semibold text-slate-500">Password</label>
                  <button type="button" className="text-[12px] text-electric font-semibold hover:underline">Forgot password?</button>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-11 py-3.5 text-[14px] outline-none focus:border-electric focus:ring-4 focus:ring-electric/10 transition placeholder:text-slate-300"
                    autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">
                  <span className="text-danger text-[11px] font-bold mt-0.5">!</span>
                  <p className="text-[12.5px] text-danger">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="tap w-full bg-electric text-white rounded-xl py-3.5 text-[14.5px] font-bold flex items-center justify-center gap-2 mt-1 disabled:opacity-60 hover:bg-blue-700 transition"
              >
                {loading ? <Loader2 size={17} className="animate-spin" /> : null}
                {loading ? "Signing in…" : "Sign In"}
                {!loading && <ArrowRight size={17} />}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-slate-400 text-[12px]">or</span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="tap flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-slate-200 text-[13px] font-medium text-midnight hover:bg-slate-50 transition">
                <GoogleIcon /> Google
              </button>
              <button className="tap flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-slate-200 text-[13px] font-medium text-midnight hover:bg-slate-50 transition">
                <AppleIcon /> Apple
              </button>
            </div>

            <p className="text-center text-[13.5px] text-slate-400 mt-7">
              Don't have an account?{" "}
              <button onClick={() => navigate("/signup")} className="text-electric font-bold hover:underline">Create account</button>
            </p>

            <p className="text-center text-[11.5px] text-slate-300 mt-3">
              <button onClick={() => navigate("/portals")} className="hover:text-slate-400 transition">Staff login →</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}
