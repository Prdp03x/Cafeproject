import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
} from "react-icons/hi";
import { resetPassword } from "../api/api";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    document.title = "Reset Password | NexOp";
  }, []);

  // If no token, redirect back
  useEffect(() => {
    if (!token) {
      navigate("/forgot-password", { replace: true });
    }
  }, [token, navigate]);

  const handleReset = async () => {
    setError("");

    if (!newPassword || !confirmPassword)
      return setError("All fields are required");
    if (newPassword.length < 6)
      return setError("Password must be at least 6 characters");
    if (newPassword !== confirmPassword)
      return setError("Passwords do not match");

    try {
      setLoading(true);
      await resetPassword({ token, newPassword, confirmPassword });
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to reset password. The link may have expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ──
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 px-6">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="mx-auto h-14 w-14 rounded-full bg-green-50 border border-green-100 flex items-center justify-center">
            <HiOutlineCheckCircle className="text-green-500" size={28} />
          </div>
          <h1 className="text-2xl font-semibold text-slate-950 tracking-tight">
            Password reset!
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Your password has been updated successfully. You can now sign in
            with your new password.
          </p>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="mt-4 w-full bg-slate-950 text-white py-3.5 rounded-[16px] text-sm font-semibold hover:bg-slate-800 active:scale-[0.98] transition"
          >
            Go to sign in
          </button>
        </div>
      </div>
    );
  }

  // ── No token guard ──
  if (!token) return null;

  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-[42%] flex-col justify-between bg-slate-950 p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-[55%] bg-gradient-to-t from-slate-950 to-transparent" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-[10px] bg-white/10 flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">
              NexOp
            </span>
          </div>
        </div>

        <div className="relative z-10 space-y-4">
          <p className="text-3xl font-semibold text-white leading-snug tracking-tight">
            Choose a<br />
            new password.
          </p>
          <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
            Pick something strong. Your new password will take effect
            immediately.
          </p>

          <div className="rounded-[20px] bg-white/5 border border-white/10 p-5 space-y-3">
            {[
              "At least 6 characters",
              "Different from your old password",
              "Something you'll remember",
            ].map((tip, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <svg
                    className="h-3 w-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-sm text-slate-300">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
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
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-slate-950 tracking-tight">
              Set new password
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Enter and confirm your new password below.
            </p>
          </div>

          <div className="space-y-4">
            {/* New password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                New password
              </label>
              <div className="flex items-center rounded-[16px] border border-stone-200 bg-white px-4 py-3.5 focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-900/5 transition">
                <HiOutlineLockClosed
                  className="text-slate-400 mr-3 shrink-0"
                  size={18}
                />
                <input
                  type={showNew ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  className="bg-transparent outline-none w-full text-sm text-slate-800 placeholder-slate-400"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError("");
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="ml-2 text-slate-400 hover:text-slate-600 transition shrink-0"
                >
                  {showNew ? (
                    <HiOutlineEyeOff size={18} />
                  ) : (
                    <HiOutlineEye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm new password
              </label>
              <div className="flex items-center rounded-[16px] border border-stone-200 bg-white px-4 py-3.5 focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-900/5 transition">
                <HiOutlineLockClosed
                  className="text-slate-400 mr-3 shrink-0"
                  size={18}
                />
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  className="bg-transparent outline-none w-full text-sm text-slate-800 placeholder-slate-400"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleReset()}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="ml-2 text-slate-400 hover:text-slate-600 transition shrink-0"
                >
                  {showConfirm ? (
                    <HiOutlineEyeOff size={18} />
                  ) : (
                    <HiOutlineEye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Password strength hint */}
            {newPassword && (
              <div className="flex items-center gap-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      newPassword.length >= [6, 8, 10, 12][i]
                        ? newPassword.length >= 12
                          ? "bg-green-500"
                          : newPassword.length >= 8
                            ? "bg-yellow-400"
                            : "bg-red-400"
                        : "bg-stone-200"
                    }`}
                  />
                ))}
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  {newPassword.length < 6
                    ? "Too short"
                    : newPassword.length < 8
                      ? "Weak"
                      : newPassword.length < 12
                        ? "Good"
                        : "Strong"}
                </span>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2.5 rounded-[14px] bg-red-50 border border-red-100 px-4 py-3">
                <HiOutlineExclamationCircle
                  className="text-red-500 shrink-0 mt-0.5"
                  size={16}
                />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="w-full bg-slate-950 text-white py-3.5 rounded-[16px] text-sm font-semibold hover:bg-slate-800 active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Resetting..." : "Reset password"}
            </button>

            <p className="text-center text-sm text-slate-500">
              Remember it now?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-slate-900 font-semibold hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
