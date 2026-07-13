import { useNavigate } from "react-router-dom";
import { Fingerprint, Mail, Lock } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col min-h-screen bg-white px-6 pt-16 pb-8">
      <div className="mb-10">
        <div className="w-12 h-12 rounded-2xl bg-midnight flex items-center justify-center mb-6">
          <span className="text-white font-extrabold text-lg">A</span>
        </div>
        <h1 className="text-2xl font-bold text-midnight mb-1">Welcome back</h1>
        <p className="text-slate-400 text-[14.5px]">Log in to continue to your Allvex account.</p>
      </div>

      <div className="flex flex-col gap-3.5">
        <Field icon={Mail} placeholder="Email or phone number" type="text" />
        <Field icon={Lock} placeholder="Password" type="password" />

        <button className="tap text-right text-electric text-[13px] font-medium -mt-1">Forgot password?</button>

        <button
          onClick={() => navigate("/")}
          className="tap w-full py-3.5 rounded-allvex bg-electric text-white font-semibold text-[15px] mt-2"
        >
          Log In
        </button>

        <button
          onClick={() => navigate("/")}
          className="tap w-full py-3.5 rounded-allvex bg-slate-100 text-midnight font-medium text-[14px] flex items-center justify-center gap-2"
        >
          <Fingerprint size={18} /> Use biometric login
        </button>
      </div>

      <div className="flex items-center gap-3 my-7">
        <div className="h-px bg-slate-100 flex-1" />
        <span className="text-slate-400 text-[12px]">or continue with</span>
        <div className="h-px bg-slate-100 flex-1" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button className="tap py-3 rounded-allvex border border-slate-200 font-medium text-[13.5px] text-midnight">Google</button>
        <button className="tap py-3 rounded-allvex border border-slate-200 font-medium text-[13.5px] text-midnight">Apple</button>
      </div>

      <p className="text-center text-[13.5px] text-slate-400 mt-auto pt-8">
        Don't have an account?{" "}
        <button onClick={() => navigate("/signup")} className="text-electric font-semibold">Sign up</button>
      </p>
    </div>
  );
}

function Field({ icon: Icon, ...props }) {
  return (
    <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-allvex px-4 py-3.5">
      <Icon size={18} className="text-slate-400 shrink-0" />
      <input {...props} className="bg-transparent outline-none text-[14.5px] w-full placeholder:text-slate-400" />
    </div>
  );
}
