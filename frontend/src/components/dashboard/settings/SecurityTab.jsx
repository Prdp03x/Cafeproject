import { useState } from "react";
import FormField from "../../common/FormField";
import API from "../../../api/api";
import { toast } from "react-toastify";

// ── Google user view ────────────────────────────────────────────────────────

const GoogleSecurityInfo = ({ email }) => (
  <div className="space-y-5">
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
        Security
      </p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
        Protect admin access
      </h2>
    </div>

    <div className="flex items-start gap-4 rounded-[28px] border border-blue-100 bg-blue-50 p-6">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
        <svg viewBox="0 0 24 24" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">Signed in with Google</p>
        <p className="mt-1.5 text-sm leading-6 text-slate-500">
          Your account authenticates through Google. Password management is
          handled entirely by Google — update it from your{" "}
          <a
            href="https://myaccount.google.com/security"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
          >
            Google Account security page
          </a>
          .
        </p>

        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-blue-100 bg-white px-4 py-3">
          <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
            {email?.charAt(0)?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Signed in as</p>
            <p className="truncate text-sm font-medium text-slate-800">{email}</p>
          </div>
        </div>
      </div>
    </div>

    <div className="grid gap-4 md:grid-cols-3">
      {[
        { title: "Session security", body: "Google manages active session tokens and revocation." },
        { title: "Two-factor auth", body: "Enable 2FA from your Google Account for extra protection." },
        { title: "Account recovery", body: "Recovery options are configured in your Google Account." },
      ].map((card) => (
        <div key={card.title} className="rounded-[24px] border border-stone-200 bg-stone-50 p-4">
          <p className="text-sm font-semibold text-slate-900">{card.title}</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">{card.body}</p>
        </div>
      ))}
    </div>
  </div>
);

// ── Email/password user view ────────────────────────────────────────────────

const PasswordForm = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
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

  const inputType = showPasswords ? "text" : "password";

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

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: "Length",     body: "Use at least 6 characters." },
          { title: "Uniqueness", body: "Avoid obvious or reused passwords." },
          { title: "Access",     body: "Keep credentials private to admins only." },
        ].map((card) => (
          <div key={card.title} className="rounded-[24px] border border-stone-200 bg-stone-50 p-4">
            <p className="text-sm font-semibold text-slate-900">{card.title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">{card.body}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <FormField
          label="Current password" type={inputType}
          placeholder="Current password" value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <FormField
          label="New password" type={inputType}
          placeholder="New password" value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <div className="md:col-span-2">
          <FormField
            label="Confirm password" type={inputType}
            placeholder="Confirm password" value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <button
          onClick={handleChangePassword}
          disabled={loading}
          className="theme-primary theme-primary-hover rounded-2xl px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Updating..." : "Update password"}
        </button>
        <button
          onClick={() => setShowPasswords((p) => !p)}
          className="rounded-2xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-stone-50"
        >
          {showPasswords ? "Hide" : "Show"} passwords
        </button>
      </div>
    </div>
  );
};

// ── Export ──────────────────────────────────────────────────────────────────

const SecurityTab = ({ isGoogleUser, email }) =>
  isGoogleUser ? <GoogleSecurityInfo email={email} /> : <PasswordForm />;

export default SecurityTab;
