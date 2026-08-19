import {
  calcGST,
  formatCurrency,
  formatCurrencyInt,
  formatTime,
  formatDate
} from "./billingUtils.js";
import { StatusPill } from "./StatusPill";
import { CANCEL_REASON_LABELS } from "../../../constants/cancelReasons";

const FILTER_OPTIONS = [
  "all",
  "pending",
  "preparing",
  "completed",
  "cancelled",
];

const BillingTable = ({
  orders,
  filteredOrders,
  statusFilter,
  onFilterChange,
  loading,
  onView,
  onCancel,
  cancelling,
}) => {
 // Aggregates for the summary row — sum each order's already-correct
   // base/SGST/CGST/grand (from calcGST) rather than summing raw totals
   // and re-applying GST on top of them.
   const filteredTotals = filteredOrders.reduce(
     (acc, o) => {
       const { base, sgst, cgst, grand } = calcGST(o.total);
       acc.base += base;
       acc.sgst += sgst;
       acc.cgst += cgst;
       acc.grand += grand;
       return acc;
     },
     { base: 0, sgst: 0, cgst: 0, grand: 0 },
   );
   const filteredBase = Math.round(filteredTotals.base * 100) / 100;
   const filteredSGST = Math.round(filteredTotals.sgst * 100) / 100;
   const filteredCGST = Math.round(filteredTotals.cgst * 100) / 100;
   const filteredGrand = Math.round(filteredTotals.grand * 100) / 100;

  return (
    <section className="rounded-[32px] border border-white/70 bg-white/85 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.07)] md:p-6">
      {/* Table header row */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-slate-950">
            All bills
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {filteredOrders.length} bill{filteredOrders.length !== 1 ? "s" : ""}{" "}
            shown
            {statusFilter !== "all" ? ` · filtered by ${statusFilter}` : ""}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => onFilterChange(s)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize transition ${
                statusFilter === s
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-stone-200 bg-stone-50 text-slate-600 hover:bg-stone-100"
              }`}
            >
              {s === "all"
                ? `All (${orders.length})`
                : `${s.charAt(0).toUpperCase() + s.slice(1)} (${orders.filter((o) => o.status === s).length})`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-stone-300 bg-stone-50 px-6 py-20 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
            🧾
          </div>
          <h3 className="mt-5 text-xl font-semibold text-slate-800">
            No bills found
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            {statusFilter !== "all"
              ? `No ${statusFilter} bills for this date.`
              : "No orders were placed on this date."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* Table */}
          <table className="w-full text-left text-sm">
            <thead>
              {/* Column header row */}
              <tr className="border-b-2 border-stone-200">
                {[
                  "Order ID",
                  "Date & Time",
                  "Table",
                  "Items",
                  "Excl. GST",
                  "SGST 2.5%",
                  "CGST 2.5%",
                  "Total (w/ GST)",
                  "Status",
                  "Reason",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap pb-3 pr-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-700 last:pr-0"
                  >
                    {h}
                  </th>
                ))}
              </tr>

              {/* Totals row */}
              <tr className="border-b-2 border-stone-200 bg-slate-50">
                <td
                  colSpan={2}
                  className="py-2 pr-4 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 whitespace-nowrap"
                >
                  Totals
                </td>
                {/* Items */}
                <td className="py-2 pr-4 whitespace-nowrap">
                  <span className="text-sm font-extrabold text-slate-900">
                    {filteredOrders.length}
                  </span>
                </td>
                {/* Items */}
                <td className="py-2 pr-4 whitespace-nowrap">
                  <span className="text-sm font-extrabold text-slate-900">
                    {filteredOrders.reduce((s, o) => s + o.items.reduce((si, i) => si + i.qty, 0),0,)}
                  </span>
                </td>
                {/* Excl. GST */}
                <td className="py-2 pr-4 whitespace-nowrap">
                  <span className="text-sm font-extrabold text-slate-700">{formatCurrencyInt(filteredBase)}</span>
                </td>
                {/* SGST */}
                <td className="py-2 pr-4 whitespace-nowrap">
                  <span className="text-sm font-extrabold text-blue-600">{formatCurrencyInt(filteredSGST)}</span>
                </td>
                {/* CGST */}
                <td className="py-2 pr-4 whitespace-nowrap">
                  <span className="text-sm font-extrabold text-blue-600">{formatCurrencyInt(filteredCGST)}</span>
                </td>
                {/* Grand total */}
                <td className="py-2 pr-4 whitespace-nowrap">
                  <span className="text-[15px] font-black text-emerald-600">{formatCurrencyInt(filteredGrand)}</span>
                </td>
                {/* Status / Reason / Action — empty */}
                <td colSpan={3} />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredOrders.map((bill) => {
                const isActive =
                  bill.status !== "completed" && bill.status !== "cancelled";
                const { base, sgst, cgst, grand } = calcGST(bill.total);
                return (
                  <tr
                    key={bill._id}
                    className={`group transition hover:bg-stone-50 ${bill.status === "cancelled" ? "opacity-70" : ""}`}
                  >
                    <td className="py-3.5 pr-4">
                      <span className="font-mono text-xs font-bold text-slate-700">
                        #{bill._id.slice(-6).toUpperCase()}
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-3.5 pr-4 text-slate-600">
                      {formatDate(bill.createdAt)} {formatTime(bill.createdAt)}
                    </td>
                    <td className="py-3.5 pr-4 text-slate-600">
                      T-{bill.tableNumber}
                    </td>
                    <td className="py-3.5 pr-4 text-slate-600">
                      {bill.items.reduce((s, i) => s + i.qty, 0)}
                    </td>
                    <td className="whitespace-nowrap py-3.5 pr-4 text-slate-700">
                      {formatCurrency(base)}
                    </td>
                    <td className="whitespace-nowrap py-3.5 pr-4 text-xs text-blue-600">
                      {formatCurrency(sgst)}
                    </td>
                    <td className="whitespace-nowrap py-3.5 pr-4 text-xs text-blue-600">
                      {formatCurrency(cgst)}
                    </td>
                    <td className="whitespace-nowrap py-3.5 pr-4 font-bold text-slate-900">
                      {formatCurrencyInt(grand)}
                    </td>
                    <td className="py-3.5 pr-4">
                      <StatusPill status={bill.status} />
                    </td>
                    <td className="py-3.5 pr-4">
                      {bill.status === "cancelled" && bill.cancelReason ? (
                        <span className="inline-block whitespace-nowrap rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-700">
                          {CANCEL_REASON_LABELS[bill.cancelReason] ||
                            bill.cancelReason}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onView(bill)}
                          className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-stone-100"
                        >
                          View
                        </button>
                        {isActive && (
                          <button
                            onClick={() => onCancel(bill)}
                            disabled={cancelling}
                            className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default BillingTable;
