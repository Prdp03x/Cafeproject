import { useState, useEffect } from "react";
import API from "../api/api";
import { useNavigate } from "react-router";
import GoogleLoginButton from "../components/common/GoogleLoginButton";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
} from "react-icons/hi";
import useAuth from "../hooks/useAuth";
import { motion } from "framer-motion";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Login | NexOp";
  }, []);

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      return setError("All fields are required");
    }

    try {
      setLoading(true);
      const res = await API.post("/auth/login", { email, password });
      login(res.data.token, res.data.cafe);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-[42%] flex-col justify-between bg-slate-950 p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-[55%] bg-gradient-to-t from-slate-950 to-transparent" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-[10px] bg-white/10 flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">
              NexOp
            </span>
          </div>
        </div>

        {/* Quote */}
        <div className="relative z-10 space-y-6">
          <p className="text-3xl font-semibold text-white leading-snug tracking-tight">
            Your cafe,
            <br />
            beautifully managed.
          </p>
          <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
            From orders to billing — everything your team needs, in one clean
            dashboard.
          </p>

          <div className="flex gap-2 pt-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all ${i === 0 ? "w-6 bg-white" : "w-2 bg-white/25"}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right: form */}
      <motion.div
        className="flex flex-1 items-center justify-center px-6 py-12"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.45,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <div className="w-full max-w-sm">
          {/* Mobile brand header */}
          <div className="lg:hidden flex items-center justify-center mb-10">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-slate-950 text-white flex items-center justify-center shadow-sm">
                <span className="font-semibold text-sm tracking-wide">N</span>
              </div>

              <div>
                <h1 className="text-[22px] leading-none font-semibold tracking-tight text-slate-950">
                  NexOp
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Business operations simplified
                </p>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-slate-950 tracking-tight">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Sign in to your business workspace
            </p>
          </div>

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email address
              </label>
              <div className="flex items-center rounded-[16px] border border-stone-200 bg-white px-4 py-3.5 focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-900/5 transition">
                <HiOutlineMail
                  className="text-slate-400 mr-3 shrink-0"
                  size={18}
                />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="bg-transparent outline-none w-full text-sm text-slate-800 placeholder-slate-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs text-slate-500 hover:text-slate-800 transition cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="flex items-center rounded-[16px] border border-stone-200 bg-white px-4 py-3.5 focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-900/5 transition">
                <HiOutlineLockClosed
                  className="text-slate-400 mr-3 shrink-0"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="bg-transparent outline-none w-full text-sm text-slate-800 placeholder-slate-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="ml-2 text-slate-400 hover:text-slate-600 transition shrink-0"
                >
                  {showPassword ? (
                    <HiOutlineEyeOff size={18} />
                  ) : (
                    <HiOutlineEye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-[14px] bg-red-50 border border-red-100 px-4 py-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-slate-950 text-white py-3.5 rounded-[16px] text-sm font-semibold hover:bg-slate-800 active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-stone-200" />
              <span className="text-xs text-slate-400">or</span>
              <div className="flex-1 h-px bg-stone-200" />
            </div>

            {/* Google */}
            <GoogleLoginButton />
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="text-slate-900 font-semibold hover:underline cursor-pointer"
            >
              Create one
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
