export const SGST_RATE = 0.025;
export const CGST_RATE = 0.025;
export const GST_RATE  = SGST_RATE + CGST_RATE;

export const calcGST = (baseTotal) => {
  const base  = baseTotal || 0;
  const sgst  = Math.round(base * SGST_RATE * 100) / 100;
  const cgst  = Math.round(base * CGST_RATE * 100) / 100;
  const grand = Math.round(base + sgst + cgst);
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

