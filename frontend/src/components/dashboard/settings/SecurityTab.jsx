import { useState } from "react";
import FormField from "../../common/FormField";
import API, { updateSecurityQuestion } from "../../../api/api";
import { toast } from "react-toastify";
import { TbLockCog } from "react-icons/tb";
import PasswordField from "../../common/PasswordField";
import { MdLockOutline } from "react-icons/md";

// ── Google user view ────────────────────────────────────────────────────────

const GoogleSecurityInfo = ({ email }) => (
  <div className="space-y-4 sm:space-y-5">
    {/* Header */}
    <div>
      <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
        Security
      </p>

      <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-950">
        Protect admin access
      </h2>
    </div>

    {/* Main Google card */}
    <div className="rounded-[24px] sm:rounded-[28px] border border-blue-100 bg-blue-50 p-4 sm:p-6">
        {/* Header row */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          </div>

          <p className="text-sm font-semibold text-slate-900">
            Signed in with Google
          </p>
        </div>

        {/* Content */}
        <div className="mt-4">
          <p className="text-sm leading-6 text-slate-500">
            Your account authenticates through Google. Password management is
            handled entirely by Google — update it from your{" "}
            <a
              href="https://myaccount.google.com/security"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700">
              Google Account security page
            </a>
            .
          </p>

          {/* Email card */}
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-blue-100 bg-white px-4 py-3 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
              {email?.charAt(0)?.toUpperCase()}
            </div>

            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                Signed in as
              </p>

              <p className="break-all text-sm font-medium text-slate-800">
                {email}
              </p>
            </div>
          </div>
        </div>
      
    </div>

    {/* Security info */}
    <div className="rounded-[24px] sm:rounded-[28px] border border-blue-100 bg-blue-50/70 p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-white text-blue-600">
          <MdLockOutline size={18} />
        </div>

        <p className="text-sm font-semibold text-slate-900"> Google account security </p>
      </div>

      {/* List */}
      <ul className="mt-4 space-y-3">
        {[
          "Google manages active session tokens and device access.",
          "Enable two-factor authentication for additional protection.",
          "Recovery options are configured through your Google Account.",
        ].map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-600 pl-4">
            <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

// ── Email/password user view ────────────────────────────────────────────────

const PasswordForm = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [secretQuestion, setSecretQuestion] = useState("");
  const [secretAnswer, setSecretAnswer] = useState("");
  const [securityLoading, setSecurityLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("password");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    setLoading(true);
    try {
      const res = await API.put("/auth/password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      toast.success(res.data.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSecurityQuestion = async () => {
    if (!currentPassword.trim()) {
      return toast.error("Current password is required");
    }

    if (!secretQuestion) {
      return toast.error("Please select a security question");
    }

    if (!secretAnswer.trim()) {
      return toast.error("Please enter your answer");
    }

    try {
      setSecurityLoading(true);

      const res = await updateSecurityQuestion({
        currentPassword,
        secretQuestion,
        secretAnswer,
      });

      toast.success(res.data.message);
      setCurrentPassword("");
      setSecretQuestion("");
      setSecretAnswer("");
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Failed to update security question",
      );
    } finally {
      setSecurityLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
          Security
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          Protect admin access
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Update your password regularly and avoid sharing access across staff.
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-white p-1 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("password")}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
            activeTab === "password"
              ? "bg-slate-950 text-white"
              : "text-slate-600 hover:bg-stone-100"
          }`}
        >
          Password
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("recovery")}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
            activeTab === "recovery"
              ? "bg-slate-950 text-white"
              : "text-slate-600 hover:bg-stone-100"
          }`}
        >
          Recovery
        </button>
      </div>

      <div className="rounded-[28px] border bg-red-50 border-red-400 px-7 py-5">
        <div className="flex items-start gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-red-900">
              Password security tips
            </p>

            <ul className="mt-3 space-y-2.5">
              {[
                "Use at least 6 characters.",
                "Avoid reused or obvious passwords.",
                "Keep admin credentials private.",
              ].map((tip) => (
                <li
                  key={tip}
                  className="flex items-start gap-2.5 text-sm text-red-400"
                >
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {activeTab === "password" && (
        <div className="grid gap-5 md:grid-cols-2">
          <PasswordField
            label="Current password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            show={showPasswords}
            onToggle={() => setShowPasswords((p) => !p)}
          />
          <PasswordField
            label="New password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            show={showPasswords}
            onToggle={() => setShowPasswords((p) => !p)}
          />
          <div className="md:col-span-2">
            <PasswordField
              label="Confirm password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              show={showPasswords}
              onToggle={() => setShowPasswords((p) => !p)}
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleChangePassword}
              disabled={loading}
              className="theme-primary theme-primary-hover rounded-2xl px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Updating..." : "Update password"}
            </button>
          </div>
        </div>
      )}

      {activeTab === "recovery" && (
        <div className="rounded-[28px] border border-stone-200 bg-white overflow-hidden">
          <div className="border-b border-stone-100 px-6 py-5">
            <p className="text-sm font-semibold text-slate-900">
              Recovery security question
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Used to recover your account if you forget your password.
            </p>
          </div>

          <div className="space-y-5 p-6">
            {/* Current password */}
            <PasswordField
              label="Current password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              show={showPasswords}
              onToggle={() => setShowPasswords((p) => !p)}
            />

            {/* Question */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Security question
              </label>

              <select
                value={secretQuestion}
                onChange={(e) => setSecretQuestion(e.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5"
              >
                <option value="">Choose a question</option>

                <option>What was the name of your first pet?</option>

                <option>What is your mother's maiden name?</option>

                <option>What was the name of your first school?</option>

                <option>What city were you born in?</option>

                <option>What is your favourite childhood movie?</option>
              </select>
            </div>

            {/* Answer */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Security answer
              </label>

              <input
                type="text"
                value={secretAnswer}
                onChange={(e) => setSecretAnswer(e.target.value)}
                placeholder="Enter your answer"
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5"
              />

              <p className="mt-2 text-xs text-slate-400">
                Answer is case-insensitive.
              </p>
            </div>

            <button
              type="button"
              onClick={handleUpdateSecurityQuestion}
              disabled={securityLoading}
              className="rounded-2xl border border-slate-900 bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {securityLoading ? "Updating..." : "Update security question"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Export ──────────────────────────────────────────────────────────────────

const SecurityTab = ({ isGoogleUser, email }) =>
  isGoogleUser ? <GoogleSecurityInfo email={email} /> : <PasswordForm />;

export default SecurityTab;
