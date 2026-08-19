import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import FormField from "../../common/FormField";
import API from "../../../api/api";

const PaymentsTab = () => {
  const [configured, setConfigured] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [form, setForm]             = useState({ keyId: "", keySecret: "" });
  const [showSecret, setShowSecret] = useState(false);
  const [saving, setSaving]         = useState(false);
  const [removing, setRemoving]     = useState(false);

  const loadStatus = async () => {
    try {
      const res = await API.get("/cafes/payments/status");
      setConfigured(res.data.keysConfigured);
    } catch {
      toast.error("Failed to load payment status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadStatus(); }, []);

  const handleSave = async () => {
    if (!form.keyId.trim() || !form.keySecret.trim()) {
      toast.error("Enter both Key ID and Key Secret");
      return;
    }
    try {
      setSaving(true);
      await API.post("/cafes/payments/keys", {
        keyId: form.keyId.trim(),
        keySecret: form.keySecret.trim(),
      });
      toast.success("Razorpay keys saved");
      setForm({ keyId: "", keySecret: "" });
      setConfigured(true);
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not save keys");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!window.confirm("Remove Razorpay keys? Online payments will stop working until you add new ones.")) return;
    try {
      setRemoving(true);
      await API.delete("/cafes/payments/keys");
      toast.success("Keys removed");
      setConfigured(false);
    } catch {
      toast.error("Failed to remove keys");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Payments</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Razorpay keys</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Paste your Razorpay API keys here. Customer payments go directly through your account.
          Keys are encrypted before saving — never stored in plain text.
        </p>
      </div>

      {/* Status card */}
      <div className="rounded-[28px] border border-stone-200 bg-stone-50 p-5">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-slate-950">Status</h3>
          {!loading && (
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              configured
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-slate-200 bg-slate-50 text-slate-600"
            }`}>
              {configured ? "Keys configured" : "No keys set"}
            </span>
          )}
        </div>
        <p className="mt-2 text-sm text-slate-500">
          {configured
            ? "Online payments are active. Replace your keys below if you need to rotate them."
            : "No keys saved yet. Add your Razorpay key_id and key_secret below."}
        </p>
        {configured && (
          <button
            onClick={handleRemove}
            disabled={removing}
            className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
          >
            {removing ? "Removing..." : "Remove keys"}
          </button>
        )}
      </div>

      {/* Key entry form — always shown so keys can be rotated */}
      <div className="rounded-[28px] border border-stone-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-slate-950">
          {configured ? "Replace keys" : "Add keys"}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Find these in your Razorpay Dashboard → Settings → API Keys.
          Use Test keys while testing, Live keys for real payments.
        </p>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <FormField
            label="Key ID" type="text" name="keyId"
            placeholder="rzp_test_xxxxxxxxxxxx or rzp_live_xxxxxxxxxxxx"
            value={form.keyId}
            onChange={(e) => setForm((p) => ({ ...p, keyId: e.target.value }))}
            required
          />
          <div>
            <label className="text-sm font-medium text-slate-700">Key Secret</label>
            <div className="relative mt-2.5">
              <input
                type={showSecret ? "text" : "password"}
                placeholder="Your Razorpay key secret"
                value={form.keySecret}
                onChange={(e) => setForm((p) => ({ ...p, keySecret: e.target.value }))}
                className="w-full rounded-[20px] border border-stone-200 bg-stone-50 px-4 py-3.5 pr-12 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
              />
              <button
                type="button"
                onClick={() => setShowSecret((s) => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                {showSecret ? "Hide" : "Show"}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="theme-primary theme-primary-hover mt-5 rounded-2xl px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Verifying & saving..." : "Save keys"}
        </button>
      </div>
    </div>
  );
};

export default PaymentsTab;