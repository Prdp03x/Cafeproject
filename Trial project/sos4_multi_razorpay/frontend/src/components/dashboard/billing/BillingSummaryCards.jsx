import { calcGST, formatCurrencyInt } from "./billingUtils.js";

const SummaryCard = ({ label, value, sub, cardClass, labelClass, valueClass }) => (
  <div className={`rounded-[24px] border px-5 py-4 shadow-sm ${cardClass}`}>
    <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${labelClass}`}>{label}</p>
    <p className={`mt-2 text-3xl font-semibold ${valueClass}`}>{value}</p>
    {sub && <p className={`mt-1 text-xs ${labelClass} opacity-70`}>{sub}</p>}
  </div>
);

const BillingSummaryCards = ({ orders, summary }) => {
  const completedOrders = orders.filter((o) => o.status === "completed");
  const completedTotals = completedOrders.reduce(
    (acc, o) => {
      const { base, sgst, cgst, grand } = calcGST(o.total);
      acc.base += base;
      acc.gst += sgst + cgst;
      acc.grand += grand;
      return acc;
    },
    { base: 0, gst: 0, grand: 0 },
  );
  const completedBase  = Math.round(completedTotals.base * 100) / 100;
  const totalGST       = Math.round(completedTotals.gst * 100) / 100;
  const completedGrand = Math.round(completedTotals.grand * 100) / 100;

  const cards = [
    {
      label: "Total bills",
      value: summary.total,
      sub: `${summary.completed} completed · ${summary.cancelled} cancelled`,
      cardClass: "border-white/70 bg-white/82", labelClass: "text-slate-400", valueClass: "text-slate-900",
    },
    {
      label: "Revenue excl. GST",
      value: formatCurrencyInt(completedBase),
      sub: "Completed orders, base amount",
      cardClass: "border-emerald-200 bg-emerald-50/90", labelClass: "text-emerald-700", valueClass: "text-emerald-900",
    },
    {
      label: "GST collected",
      value: formatCurrencyInt(totalGST),
      sub: `SGST ${formatCurrencyInt(totalGST / 2)} · CGST ${formatCurrencyInt(totalGST / 2)}`,
      cardClass: "border-blue-200 bg-blue-50/90", labelClass: "text-blue-700", valueClass: "text-blue-900",
    },
    {
      label: "Revenue incl. GST",
      value: formatCurrencyInt(completedGrand),
      sub: "Completed orders, grand total",
      cardClass: "border-violet-200 bg-violet-50/90", labelClass: "text-violet-700", valueClass: "text-violet-900",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {cards.map((c) => <SummaryCard key={c.label} {...c} />)}
    </div>
  );
};

export default BillingSummaryCards;
