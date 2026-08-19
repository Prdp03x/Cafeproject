import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import FormField from "../../common/FormField";
import API from "../../../api/api";

const STATUS_COPY = {
  not_connected: {
    label: "Not connected",
    badge: "border-slate-200 bg-slate-50 text-slate-600",
    description: "Connect a bank account so online orders settle directly to you.",
  },
  pending: {
    label: "Pending review",
    badge: "border-amber-200 bg-amber-50 text-amber-800",
    description: "Razorpay is reviewing your details. This usually takes a few business days.",
  },
  activated: {
    label: "Active",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
    description: "Online payments are live — your share settles directly to this account.",
  },
  rejected: {
    label: "Needs attention",
    badge: "border-rose-200 bg-rose-50 text-rose-800",
    description: "Razorpay flagged an issue with these details. Contact support to resolve it.",
  },
};

const defaultBankForm = {
  beneficiaryName: "",
  accountNumber: "",
  ifsc: "",
  businessType: "",
};

const BUSINESS_TYPE_OPTIONS = [
  { value: "individual", label: "Individual" },
  { value: "proprietorship", label: "Proprietorship" },
  { value: "partnership", label: "Partnership" },
  { value: "private_limited", label: "Private Limited" },
  { value: "public_limited", label: "Public Limited" },
  { value: "llp", label: "LLP" },
  { value: "trust", label: "Trust" },
  { value: "society", label: "Society" },
  { value: "ngo", label: "NGO" },
];

const PaymentsTab = () => {
  const [status, setStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [bankForm, setBankForm] = useState(defaultBankForm);
  const [submitting, setSubmitting] = useState(false);

  const loadStatus = async () => {
    try {
      const res = await API.get("/cafes/payments/status");
      setStatus(res.data);
    } catch {
      toast.error("Failed to load payment status");
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    void loadStatus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBankForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleConnect = async () => {
    if (!bankForm.beneficiaryName || !bankForm.accountNumber || !bankForm.ifsc || !bankForm.businessType) {
      toast.error("Fill in all fields, including business type");
      return;
    }

    try {
      setSubmitting(true);
      const res = await API.post("/cafes/payments/onboard", bankForm);
      toast.success(res.data.message);
      setBankForm(defaultBankForm);
      await loadStatus();
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not connect payments");
    } finally {
      setSubmitting(false);
    }
  };

  const accountStatus = status?.accountStatus || "not_connected";
  const copy = STATUS_COPY[accountStatus] || STATUS_COPY.not_connected;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
          Payments
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          Online payments
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Customers pay online at checkout via Razorpay. Your share of every order
          settles directly to the bank account you connect here.
        </p>
      </div>

      <div className="rounded-[28px] border border-stone-200 bg-stone-50 p-5">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-slate-950">Account status</h3>
          {!loadingStatus && (
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${copy.badge}`}>
              {copy.label}
            </span>
          )}
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-500">{copy.description}</p>

        {accountStatus === "activated" && status?.bankAccountLast4 && (
          <p className="mt-3 text-sm text-slate-600">
            Settling to account ending in <span className="font-semibold">{status.bankAccountLast4}</span>
            {typeof status.commissionPercent === "number" && (
              <> · platform fee {status.commissionPercent}% per order</>
            )}
          </p>
        )}
      </div>

      {accountStatus === "not_connected" && (
        <div className="rounded-[28px] border border-stone-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-slate-950">Connect a bank account</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Make sure your Business tab (legal name, GST, address) is filled in first —
            it's used for Razorpay's verification.
          </p>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <FormField
              label="Account holder name" type="text" name="beneficiaryName"
              placeholder="As per bank records" value={bankForm.beneficiaryName}
              onChange={handleChange} required
            />
            <FormField
              label="IFSC code" type="text" name="ifsc"
              placeholder="e.g. HDFC0001234" value={bankForm.ifsc}
              onChange={handleChange} required
            />
            <div>
              <label className="text-sm font-medium text-slate-700">Business type</label>
              <select
                name="businessType"
                value={bankForm.businessType}
                onChange={handleChange}
                required
                className="mt-2.5 w-full rounded-[20px] border border-stone-200 bg-stone-50 px-4 py-3.5 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
              >
                <option value="" disabled>Select how this cafe is registered</option>
                {BUSINESS_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <FormField
              label="Account number" type="text" name="accountNumber"
              placeholder="Bank account number" value={bankForm.accountNumber}
              onChange={handleChange} required
            />
          </div>

          <button
            onClick={handleConnect}
            disabled={submitting}
            className="theme-primary theme-primary-hover mt-5 rounded-2xl px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Connect payments"}
          </button>
        </div>
      )}

      {accountStatus === "pending" && (
        <button
          onClick={() => void loadStatus()}
          className="rounded-2xl border border-stone-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-stone-50"
        >
          Refresh status
        </button>
      )}
    </div>
  );
};

export default PaymentsTab;
