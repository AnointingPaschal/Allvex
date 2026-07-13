import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col min-h-screen sm:min-h-0 bg-white sm:my-10 sm:rounded-2xl sm:shadow-card px-5 pt-10 sm:pt-8 pb-6 max-w-sm mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-[19px] font-bold text-midnight mb-1">Create your account</h1>
        <p className="text-slate-400 text-[12.5px]">Takes less than 2 minutes.</p>
      </div>

      <div className="flex flex-col gap-3.5">
        <div className="grid grid-cols-2 gap-3">
          <Field icon={User} placeholder="First name" />
          <Field icon={User} placeholder="Last name" />
        </div>
        <Field icon={Mail} placeholder="Email address" />
        <Field icon={Phone} placeholder="Phone number" />
        <Field icon={Lock} placeholder="Password" type="password" />
        <Field icon={Lock} placeholder="Confirm password" type="password" />

        <label className="flex items-start gap-2.5 mt-1">
          <input type="checkbox" className="mt-0.5 accent-electric w-4 h-4" />
          <span className="text-[12.5px] text-slate-400 leading-snug">
            I agree to the Terms of Service and Privacy Policy.
          </span>
        </label>

        <button
          onClick={() => navigate("/")}
          className="tap w-full py-3.5 rounded-allvex bg-electric text-white font-semibold text-[15px] mt-2"
        >
          Create Account
        </button>
      </div>

      <p className="text-center text-[13.5px] text-slate-400 mt-auto pt-8">
        Already have an account?{" "}
        <button onClick={() => navigate("/login")} className="text-electric font-semibold">Log in</button>
      </p>
    </div>
  );
}

function Field({ icon: Icon, ...props }) {
  return (
    <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-allvex px-4 py-3.5">
      <Icon size={18} className="text-slate-400 shrink-0" />
      <input {...props} className="bg-transparent outline-none text-[12.5px] w-full placeholder:text-slate-400" />
    </div>
  );
}
