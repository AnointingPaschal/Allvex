import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Signup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!firstName.trim() || !lastName.trim()) return setError("Enter your first and last name.");
    if (!email.trim()) return setError("Enter your email address.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirmPassword) return setError("Passwords don't match.");
    if (!agreed) return setError("You must agree to the Terms and Privacy Policy.");

    setLoading(true);
    const { error } = await signUp({
      email: email.trim(),
      password,
      fullName: `${firstName.trim()} ${lastName.trim()}`,
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="flex flex-col min-h-screen sm:min-h-0 bg-white sm:my-10 sm:rounded-2xl sm:shadow-card px-5 pt-10 sm:pt-8 pb-6 max-w-sm mx-auto w-full items-center justify-center text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
          <Mail size={22} className="text-success" />
        </div>
        <p className="font-bold text-midnight text-[16px]">Check your email</p>
        <p className="text-[13px] text-slate-400 max-w-xs">
          We've sent a confirmation link to <span className="font-semibold text-midnight">{email}</span>. Confirm it, then log in.
        </p>
        <button onClick={() => navigate("/login")} className="tap mt-3 px-6 py-3 rounded-allvex bg-electric text-white font-semibold text-[13.5px]">
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen sm:min-h-0 bg-white sm:my-10 sm:rounded-2xl sm:shadow-card px-5 pt-10 sm:pt-8 pb-6 max-w-sm mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-[19px] font-bold text-midnight mb-1">Create your account</h1>
        <p className="text-slate-400 text-[12.5px]">Takes less than 2 minutes.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div className="grid grid-cols-2 gap-3">
          <Field icon={User} placeholder="First name" value={firstName} onChange={setFirstName} />
          <Field icon={User} placeholder="Last name" value={lastName} onChange={setLastName} />
        </div>
        <Field icon={Mail} placeholder="Email address" type="email" value={email} onChange={setEmail} />
        <Field icon={Lock} placeholder="Password (min 8 characters)" type="password" value={password} onChange={setPassword} />
        <Field icon={Lock} placeholder="Confirm password" type="password" value={confirmPassword} onChange={setConfirmPassword} />

        <label className="flex items-start gap-2.5 mt-1">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 accent-electric w-4 h-4" />
          <span className="text-[12.5px] text-slate-400 leading-snug">
            I agree to the Terms of Service and Privacy Policy.
          </span>
        </label>

        {error && <p className="text-[12px] text-danger">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="tap w-full py-3.5 rounded-allvex bg-electric text-white font-semibold text-[15px] mt-2 flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="text-center text-[13.5px] text-slate-400 mt-auto pt-8">
        Already have an account?{" "}
        <button onClick={() => navigate("/login")} className="text-electric font-semibold">Log in</button>
      </p>
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
