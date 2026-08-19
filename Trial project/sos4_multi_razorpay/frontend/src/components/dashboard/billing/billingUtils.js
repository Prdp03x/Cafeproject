export const SGST_RATE = 0.025;
export const CGST_RATE = 0.025;
export const GST_RATE  = SGST_RATE + CGST_RATE;

// bill.total / order.total coming from the API is already GST-inclusive
// (paymentController computes total = subtotal * 1.05 before charging
// Razorpay), so we back-calculate the exclusive base from it instead of
// adding GST on top a second time.
export const calcGST = (inclusiveTotal) => {
  const grand = inclusiveTotal || 0;
  const base  = Math.round((grand / (1 + GST_RATE)) * 100) / 100;
  const sgst  = Math.round(base * SGST_RATE * 100) / 100;
  const cgst  = Math.round(base * CGST_RATE * 100) / 100;
  return { base, sgst, cgst, grand };
};

export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR",
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(value || 0);

export const formatCurrencyInt = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(value || 0);

export const formatTime = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
};

export const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

