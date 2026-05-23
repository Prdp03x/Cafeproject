// import { useState, useEffect, useCallback } from "react";
// import API from "../../api/api";
// import { toast } from "react-toastify";
// import useAuth from "../../hooks/useAuth";

// // ─── GST constants ────────────────────────────────────────────────────────────
// const SGST_RATE = 0.025;
// const CGST_RATE = 0.025;
// const GST_RATE  = SGST_RATE + CGST_RATE;

// const calcGST = (baseTotal) => {
//   const base  = baseTotal || 0;
//   const sgst  = Math.round(base * SGST_RATE * 100) / 100;
//   const cgst  = Math.round(base * CGST_RATE * 100) / 100;
//   const grand = Math.round(base + sgst + cgst);
//   return { base, sgst, cgst, grand };
// };

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// const formatCurrency = (value) =>
//   new Intl.NumberFormat("en-IN", {
//     style: "currency", currency: "INR",
//     minimumFractionDigits: 2, maximumFractionDigits: 2,
//   }).format(value || 0);

// const formatCurrencyInt = (value) =>
//   new Intl.NumberFormat("en-IN", {
//     style: "currency", currency: "INR", maximumFractionDigits: 0,
//   }).format(value || 0);

// const formatTime = (iso) => {
//   if (!iso) return "—";
//   return new Date(iso).toLocaleTimeString("en-IN", {
//     hour: "2-digit", minute: "2-digit", hour12: true,
//   });
// };

// const formatDate = (iso) => {
//   if (!iso) return "—";
//   return new Date(iso).toLocaleDateString("en-IN", {
//     day: "2-digit", month: "short", year: "numeric",
//   });
// };

// const todayISO = () => {
//   const d = new Date();
//   return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
// };

// // ─── Cancel reason config — shared with Dashboard ────────────────────────────
// import CancelReorderModal, { CANCEL_REASON_LABELS } from "./CancelReorderModal";

// // ─── Status pill ──────────────────────────────────────────────────────────────
// const STATUS_STYLES = {
//   pending:   { pill: "bg-amber-100 text-amber-700 border-amber-200",       dot: "bg-amber-400",   label: "Pending" },
//   preparing: { pill: "bg-blue-100 text-blue-700 border-blue-200",          dot: "bg-blue-400",    label: "Preparing" },
//   completed: { pill: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", label: "Completed" },
//   cancelled: { pill: "bg-rose-100 text-rose-700 border-rose-200",          dot: "bg-rose-500",    label: "Cancelled" },
// };

// const StatusPill = ({ status }) => {
//   const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
//   return (
//     <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${s.pill}`}>
//       <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
//       {s.label}
//     </span>
//   );
// };

// // ─── Bill Detail Modal ────────────────────────────────────────────────────────
// const BillDetailModal = ({ bill, cafe, onClose, onRequestCancel, cancelling }) => {
//   if (!bill) return null;

//   const isActive = bill.status !== "completed" && bill.status !== "cancelled";
//   const { base, sgst, cgst, grand } = calcGST(bill.total);

//   const cafeAddress = [cafe?.address, cafe?.city, cafe?.state, cafe?.postalCode]
//     .filter(Boolean).join(", ");

//   const handlePrint = () => {
//     const printContent = `
//       <html>
//       <head>
//         <title>Bill #${bill._id.slice(-6).toUpperCase()}</title>
//         <style>
//           * { margin: 0; padding: 0; box-sizing: border-box; }
//           body { font-family: 'Courier New', monospace; font-size: 12px; color: #000; padding: 16px; max-width: 320px; margin: 0 auto; }
//           .center { text-align: center; }
//           .bold { font-weight: bold; }
//           .divider { border-top: 1px dashed #000; margin: 8px 0; }
//           .row { display: flex; justify-content: space-between; margin: 3px 0; }
//           .header { margin-bottom: 10px; }
//           .cafe-name { font-size: 16px; font-weight: bold; letter-spacing: 1px; }
//           .cafe-meta { font-size: 10px; color: #444; margin-top: 2px; }
//           .receipt-title { font-size: 13px; font-weight: bold; letter-spacing: 2px; margin: 8px 0 4px; }
//           .item-name { flex: 1; }
//           .item-price { text-align: right; white-space: nowrap; margin-left: 8px; }
//           .extras { font-size: 10px; color: #666; padding-left: 12px; margin-bottom: 2px; }
//           .gst-row { font-size: 11px; }
//           .total-row { font-size: 14px; font-weight: bold; }
//           .status { display: inline-block; padding: 2px 8px; border: 1px solid #000; border-radius: 3px; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }
//           .footer { margin-top: 14px; font-size: 10px; color: #666; }
//           .gst-label { font-size: 10px; color: #555; }
//           .cancel-reason { margin-top: 8px; font-size: 10px; color: #c00; border: 1px dashed #c00; padding: 4px 8px; border-radius: 3px; }
//         </style>
//       </head>
//       <body>
//         <div class="center header">
//           <div class="cafe-name">${cafe?.name || "CAFE"}</div>
//           ${cafeAddress ? `<div class="cafe-meta">${cafeAddress}</div>` : ""}
//           ${cafe?.phone ? `<div class="cafe-meta">Ph: ${cafe.phone}</div>` : ""}
//           ${cafe?.gstNumber ? `<div class="cafe-meta">GSTIN: ${cafe.gstNumber}</div>` : ""}
//           ${cafe?.fssaiNumber ? `<div class="cafe-meta">FSSAI: ${cafe.fssaiNumber}</div>` : ""}
//           <div class="receipt-title">TAX INVOICE</div>
//           <div class="cafe-meta">Order #${bill._id.slice(-6).toUpperCase()} &nbsp;|&nbsp; Table ${bill.tableNumber}</div>
//           <div class="cafe-meta">${new Date(bill.createdAt).toLocaleString("en-IN")}</div>
//           <div style="margin-top:5px"><span class="status">${bill.status}</span></div>
//           ${bill.status === "cancelled" && bill.cancelReason
//             ? `<div class="cancel-reason">Cancelled: ${CANCEL_REASON_LABELS[bill.cancelReason] || bill.cancelReason}${bill.cancelNote ? " — " + bill.cancelNote : ""}</div>`
//             : ""}
//         </div>
//         <div class="divider"></div>
//         <div class="row bold gst-label"><span>Item</span><span>Amount</span></div>
//         <div style="margin:3px 0"></div>
//         ${bill.items.map(item => {
//           const extras = item.selectedOptions?.reduce((s, o) => s + o.price, 0) || 0;
//           const lineTotal = item.qty * (item.price + extras);
//           return `
//             <div class="row">
//               <span class="item-name bold">${item.qty}x ${item.name}</span>
//               <span class="item-price">₹${lineTotal.toFixed(2)}</span>
//             </div>
//             ${item.selectedOptions?.length ? `<div class="extras">+ ${item.selectedOptions.map(o => o.name).join(", ")}</div>` : ""}
//           `;
//         }).join("")}
//         <div class="divider"></div>
//         <div class="row gst-row"><span>Subtotal (excl. GST)</span><span>₹${base.toFixed(2)}</span></div>
//         <div class="row gst-row"><span>SGST @ 2.5%</span><span>₹${sgst.toFixed(2)}</span></div>
//         <div class="row gst-row"><span>CGST @ 2.5%</span><span>₹${cgst.toFixed(2)}</span></div>
//         <div class="divider"></div>
//         <div class="row gst-row"><span>Exact amount</span><span>₹${grand.toFixed(2)}</span></div>
//         <div class="row total-row"><span>TOTAL (incl. GST)</span><span>₹${Math.round(grand)}</span></div>
//         <div class="divider"></div>
//         ${cafe?.gstNumber ? `<div class="center gst-label" style="margin-top:4px">GSTIN: ${cafe.gstNumber}</div>` : ""}
//         <div class="center footer">Thank you for dining with us!</div>
//       </body>
//       </html>
//     `;
//     const win = window.open("", "_blank", "width=400,height=700");
//     win.document.write(printContent);
//     win.document.close();
//     win.focus();
//     win.print();
//     win.close();
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
//       <div className="w-full max-w-md rounded-[28px] border border-white/70 bg-white shadow-[0_32px_100px_rgba(15,23,42,0.18)] overflow-hidden max-h-[90vh] flex flex-col">

//         {/* Header */}
//         <div className="flex items-start justify-between p-6 pb-4 shrink-0">
//           <div>
//             <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Tax Invoice</p>
//             <h2 className="mt-1 text-xl font-semibold text-slate-900">
//               #{bill._id.slice(-6).toUpperCase()}
//             </h2>
//             <div className="mt-2 flex items-center gap-3">
//               <StatusPill status={bill.status} />
//               <span className="text-xs text-slate-400">Table {bill.tableNumber}</span>
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-slate-500 transition hover:bg-stone-100"
//           >
//             ✕
//           </button>
//         </div>

//         {/* Cafe info strip */}
//         {(cafe?.name || cafe?.gstNumber || cafe?.phone || cafeAddress) && (
//           <div className="mx-6 mb-3 rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3 shrink-0">
//             {cafe?.name && <p className="text-sm font-bold text-slate-900">{cafe.name}</p>}
//             {cafeAddress && <p className="mt-0.5 text-[11px] text-slate-500">{cafeAddress}</p>}
//             <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
//               {cafe?.phone && <p className="text-[11px] text-slate-500">📞 {cafe.phone}</p>}
//               {cafe?.gstNumber && <p className="text-[11px] font-mono font-semibold text-slate-600">GSTIN: {cafe.gstNumber}</p>}
//               {cafe?.fssaiNumber && <p className="text-[11px] text-slate-500">FSSAI: {cafe.fssaiNumber}</p>}
//             </div>
//           </div>
//         )}

//         {/* Cancel reason strip — shown if already cancelled */}
//         {bill.status === "cancelled" && bill.cancelReason && (
//           <div className="mx-6 mb-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 shrink-0">
//             <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-600">
//               Cancellation record
//             </p>
//             <p className="mt-1 text-sm font-semibold text-rose-800">
//               {CANCEL_REASON_LABELS[bill.cancelReason] || bill.cancelReason}
//             </p>
//             {bill.cancelNote && (
//               <p className="mt-0.5 text-xs text-rose-700 italic">"{bill.cancelNote}"</p>
//             )}
//             {bill.cancelledAt && (
//               <p className="mt-1 text-[11px] text-rose-500">
//                 Cancelled at {formatTime(bill.cancelledAt)} · {formatDate(bill.cancelledAt)}
//               </p>
//             )}
//           </div>
//         )}

//         {/* Scrollable body */}
//         <div className="overflow-y-auto flex-1 px-6 pb-2">
//           {/* Meta */}
//           <div className="mb-4 grid grid-cols-2 gap-3">
//             <div className="rounded-2xl border border-stone-100 bg-stone-50 px-3 py-3">
//               <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Order time</p>
//               <p className="mt-1 text-sm font-semibold text-slate-900">{formatTime(bill.createdAt)}</p>
//               <p className="text-[11px] text-slate-400">{formatDate(bill.createdAt)}</p>
//             </div>
//             <div className="rounded-2xl border border-stone-100 bg-stone-50 px-3 py-3">
//               <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Grand total</p>
//               <p className="mt-1 text-lg font-bold text-slate-900">{formatCurrencyInt(Math.round(grand))}</p>
//               <p className="text-[11px] text-slate-400">incl. GST</p>
//             </div>
//           </div>

//           {/* Items */}
//           <div className="mb-4 rounded-2xl border border-stone-100 overflow-hidden">
//             <div className="bg-stone-50 px-4 py-2.5">
//               <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Items ordered</p>
//             </div>
//             <div className="divide-y divide-stone-100">
//               {bill.items.map((item, i) => {
//                 const extras = item.selectedOptions?.reduce((s, o) => s + o.price, 0) || 0;
//                 const lineTotal = item.qty * (item.price + extras);
//                 return (
//                   <div key={i} className="flex items-start justify-between gap-3 px-4 py-3">
//                     <div className="min-w-0 flex-1">
//                       <p className="text-sm font-medium text-slate-900">
//                         <span className="font-bold">{item.qty}×</span> {item.name}
//                       </p>
//                       {item.selectedOptions?.length > 0 && (
//                         <p className="mt-0.5 text-[11px] text-slate-400">
//                           + {item.selectedOptions.map((o) => o.name).join(", ")}
//                         </p>
//                       )}
//                     </div>
//                     <span className="shrink-0 text-sm font-semibold text-slate-800">
//                       {formatCurrency(lineTotal)}
//                     </span>
//                   </div>
//                 );
//               })}
//             </div>

//             {/* GST breakdown */}
//             <div className="border-t border-stone-200 divide-y divide-stone-100 bg-stone-50">
//               <div className="flex items-center justify-between px-4 py-2.5">
//                 <p className="text-xs text-slate-500">Subtotal (excl. GST)</p>
//                 <p className="text-xs font-semibold text-slate-700">{formatCurrency(base)}</p>
//               </div>
//               <div className="flex items-center justify-between px-4 py-2.5">
//                 <p className="text-xs text-slate-500">SGST @ 2.5%</p>
//                 <p className="text-xs font-semibold text-slate-600">{formatCurrency(sgst)}</p>
//               </div>
//               <div className="flex items-center justify-between px-4 py-2.5">
//                 <p className="text-xs text-slate-500">CGST @ 2.5%</p>
//                 <p className="text-xs font-semibold text-slate-600">{formatCurrency(cgst)}</p>
//               </div>
//               <div className="flex items-center justify-between px-4 py-3">
//                 <div>
//                   <p className="text-sm font-bold text-slate-900">Total (incl. GST)</p>
//                   <p className="text-[11px] text-slate-400">Exact: {formatCurrency(grand)}</p>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-base font-bold text-slate-900">{formatCurrencyInt(Math.round(grand))}</p>
//                   <p className="text-[11px] text-slate-400">rounded</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Actions */}
//         <div className="flex gap-3 border-t border-stone-100 px-6 py-4 shrink-0">
//           <button
//             onClick={onClose}
//             className="flex-1 rounded-2xl border border-stone-200 bg-stone-50 py-3 text-sm font-semibold text-slate-700 transition hover:bg-stone-100"
//           >
//             Close
//           </button>
//           <button
//             onClick={handlePrint}
//             className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:bg-stone-50"
//           >
//             🖨 Print
//           </button>
//           {isActive && (
//             <button
//               onClick={() => onRequestCancel(bill)}
//               disabled={cancelling}
//               className="flex-1 rounded-2xl bg-rose-600 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
//             >
//               {cancelling ? "Cancelling..." : "Cancel & Reorder"}
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─── Summary stat card ────────────────────────────────────────────────────────
// const SummaryCard = ({ label, value, sub, cardClass, labelClass, valueClass }) => (
//   <div className={`rounded-[24px] border px-5 py-4 shadow-sm ${cardClass}`}>
//     <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${labelClass}`}>{label}</p>
//     <p className={`mt-2 text-3xl font-semibold ${valueClass}`}>{value}</p>
//     {sub && <p className={`mt-1 text-xs ${labelClass} opacity-70`}>{sub}</p>}
//   </div>
// );

// // ─── Main component ───────────────────────────────────────────────────────────
// const BillingSection = () => {
//   const { cafe } = useAuth();
//   const [date, setDate]                   = useState(todayISO());
//   const [orders, setOrders]               = useState([]);
//   const [summary, setSummary]             = useState(null);
//   const [loading, setLoading]             = useState(false);
//   const [selectedBill, setSelectedBill]   = useState(null);
//   const [cancelTarget, setCancelTarget]   = useState(null); // bill pending cancel confirm
//   const [cancelling, setCancelling]       = useState(false);
//   const [statusFilter, setStatusFilter]   = useState("all");

//   const fetchBilling = useCallback(async (selectedDate) => {
//     setLoading(true);
//     try {
//       const res = await API.get(`/orders/billing?date=${selectedDate}`);
//       setOrders(res.data.orders || []);
//       setSummary(res.data.summary || null);
//     } catch (error) {
//       console.error("Billing fetch failed:", error);
//       toast.error(error?.response?.data?.error || "Failed to load billing data");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => { fetchBilling(date); }, [date, fetchBilling]);

//   // Called from the table row "Cancel" button — skip the detail modal, go straight to confirm
//   const handleRequestCancel = useCallback((bill) => {
//     setCancelTarget(bill);
//   }, []);

//   // Called from BillDetailModal "Cancel & Reorder" button
//   const handleRequestCancelFromModal = useCallback((bill) => {
//     setCancelTarget(bill);
//   }, []);

//   // Called when staff confirms cancel reason in CancelReorderModal
//   const handleConfirmCancel = async ({ reason, note }) => {
//     if (!cancelTarget) return;
//     setCancelling(true);
//     try {
//       await API.put(`/orders/${cancelTarget._id}`, {
//         status: "cancelled",
//         cancelReason: reason,
//         cancelNote: note || null,
//       });
//       toast.success("Order cancelled successfully");
//       setCancelTarget(null);
//       // If the bill detail modal was open for this bill, update it
//       setSelectedBill((prev) =>
//         prev?._id === cancelTarget._id
//           ? { ...prev, status: "cancelled", cancelReason: reason, cancelNote: note || null, cancelledAt: new Date().toISOString() }
//           : prev
//       );
//       // Re-fetch from server — single source of truth
//       await fetchBilling(date);
//     } catch (error) {
//       console.error("Cancel failed:", error);
//       toast.error(error?.response?.data?.error || "Failed to cancel order");
//     } finally {
//       setCancelling(false);
//     }
//   };

//   const filteredOrders = statusFilter === "all"
//     ? orders
//     : orders.filter((o) => o.status === statusFilter);

//   // GST aggregates
//   const completedBase  = orders.filter(o => o.status === "completed").reduce((s, o) => s + (o.total || 0), 0);
//   const completedGrand = orders.filter(o => o.status === "completed").reduce((s, o) => s + calcGST(o.total).grand, 0);
//   const totalGSTOnCompleted = Math.round(completedBase * GST_RATE * 100) / 100;

//   const cancelledBase  = orders.filter(o => o.status === "cancelled").reduce((s, o) => s + (o.total || 0), 0);

//   const filteredBase  = filteredOrders.reduce((s, o) => s + (o.total || 0), 0);
//   const filteredSGST  = Math.round(filteredBase * SGST_RATE * 100) / 100;
//   const filteredCGST  = Math.round(filteredBase * CGST_RATE * 100) / 100;
//   const filteredGrand = filteredOrders.reduce((s, o) => s + calcGST(o.total).grand, 0);

//   const isToday = date === todayISO();

//   return (
//     <div className="space-y-6">

//       {/* Page header + date picker */}
//       <section className="overflow-hidden rounded-[32px] border border-white/70 bg-[linear-gradient(135deg,#17212e_0%,#1e3048_50%,#243347_100%)] p-6 text-white shadow-[0_28px_90px_rgba(15,23,42,0.16)] md:p-7">
//         <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
//           <div>
//             <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">
//               Billing analytics
//             </p>
//             <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-[34px]">
//               {isToday ? "Today's revenue" : `Bills for ${formatDate(date + "T00:00:00")}`}
//             </h2>
//             <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
//               View all bills for any day, track revenue, and manage cancellations. GST @ 5% (SGST 2.5% + CGST 2.5%).
//             </p>
//           </div>

//           <div className="flex flex-col gap-2">
//             <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
//               Select date
//             </label>
//             <input
//               type="date"
//               value={date}
//               max={todayISO()}
//               onChange={(e) => setDate(e.target.value)}
//               className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
//             />
//             {!isToday && (
//               <button
//                 onClick={() => setDate(todayISO())}
//                 className="rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/20"
//               >
//                 Back to today
//               </button>
//             )}
//           </div>
//         </div>

//         {summary && (
//           <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
//             {[
//               { label: "Total bills",      value: summary.total },
//               { label: "Completed",        value: summary.completed },
//               { label: "GST collected",    value: formatCurrencyInt(totalGSTOnCompleted) },
//               { label: "Revenue (w/ GST)", value: formatCurrencyInt(completedGrand) },
//             ].map((stat) => (
//               <div key={stat.label} className="rounded-[24px] border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
//                 <p className="text-[11px] uppercase tracking-[0.18em] text-white/60">{stat.label}</p>
//                 <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
//               </div>
//             ))}
//           </div>
//         )}
//       </section>

//       {/* Detailed stat cards */}
//       {summary && (
//         <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
//           <SummaryCard
//             label="Total bills" value={summary.total}
//             sub={`${summary.completed} completed · ${summary.cancelled} cancelled`}
//             cardClass="border-white/70 bg-white/82" labelClass="text-slate-400" valueClass="text-slate-900"
//           />
//           <SummaryCard
//             label="Revenue excl. GST" value={formatCurrencyInt(completedBase)}
//             sub="Completed orders, base amount"
//             cardClass="border-emerald-200 bg-emerald-50/90" labelClass="text-emerald-700" valueClass="text-emerald-900"
//           />
//           <SummaryCard
//             label="GST collected" value={formatCurrencyInt(totalGSTOnCompleted)}
//             sub={`SGST ${formatCurrencyInt(totalGSTOnCompleted / 2)} · CGST ${formatCurrencyInt(totalGSTOnCompleted / 2)}`}
//             cardClass="border-blue-200 bg-blue-50/90" labelClass="text-blue-700" valueClass="text-blue-900"
//           />
//           <SummaryCard
//             label="Revenue incl. GST" value={formatCurrencyInt(completedGrand)}
//             sub="Completed orders, grand total"
//             cardClass="border-violet-200 bg-violet-50/90" labelClass="text-violet-700" valueClass="text-violet-900"
//           />
//         </div>
//       )}

//       {/* Bills table */}
//       <section className="rounded-[32px] border border-white/70 bg-white/85 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.07)] md:p-6">
//         <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             <h3 className="text-xl font-semibold tracking-tight text-slate-950">All bills</h3>
//             <p className="mt-1 text-sm text-slate-500">
//               {filteredOrders.length} bill{filteredOrders.length !== 1 ? "s" : ""} shown
//               {statusFilter !== "all" ? ` · filtered by ${statusFilter}` : ""}
//             </p>
//           </div>

//           {/* Status filter tabs */}
//           <div className="flex flex-wrap gap-2">
//             {["all", "pending", "preparing", "completed", "cancelled"].map((s) => (
//               <button
//                 key={s}
//                 onClick={() => setStatusFilter(s)}
//                 className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize transition ${
//                   statusFilter === s
//                     ? "border-slate-900 bg-slate-900 text-white"
//                     : "border-stone-200 bg-stone-50 text-slate-600 hover:bg-stone-100"
//                 }`}
//               >
//                 {s === "all"
//                   ? `All (${orders.length})`
//                   : `${s.charAt(0).toUpperCase() + s.slice(1)} (${orders.filter(o => o.status === s).length})`}
//               </button>
//             ))}
//           </div>
//         </div>

//         {loading ? (
//           <div className="flex items-center justify-center py-20">
//             <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800" />
//           </div>
//         ) : filteredOrders.length === 0 ? (
//           <div className="rounded-[28px] border border-dashed border-stone-300 bg-stone-50 px-6 py-20 text-center">
//             <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl shadow-sm">🧾</div>
//             <h3 className="mt-5 text-xl font-semibold text-slate-800">No bills found</h3>
//             <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
//               {statusFilter !== "all" ? `No ${statusFilter} bills for this date.` : "No orders were placed on this date."}
//             </p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">

//             {/* Totals summary row */}
//             <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
//               <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
//                 Order summary — {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""}
//                 {statusFilter !== "all" ? ` · ${statusFilter}` : ""}
//               </p>
//               <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
//                 <div>
//                   <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Total bills</p>
//                   <p className="mt-0.5 text-xl font-bold text-slate-900">{filteredOrders.length}</p>
//                 </div>
//                 <div>
//                   <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Total items</p>
//                   <p className="mt-0.5 text-xl font-bold text-slate-900">
//                     {filteredOrders.reduce((s, o) => s + o.items.reduce((si, i) => si + i.qty, 0), 0)}
//                   </p>
//                 </div>
//                 <div className="border-l border-stone-200 pl-3 sm:pl-4">
//                   <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">Excl. GST</p>
//                   <p className="mt-0.5 text-xl font-bold text-slate-800">{formatCurrencyInt(filteredBase)}</p>
//                 </div>
//                 <div>
//                   <p className="text-[10px] uppercase tracking-[0.14em] text-blue-500">SGST (2.5%)</p>
//                   <p className="mt-0.5 text-xl font-bold text-blue-700">{formatCurrencyInt(filteredSGST)}</p>
//                 </div>
//                 <div>
//                   <p className="text-[10px] uppercase tracking-[0.14em] text-blue-500">CGST (2.5%)</p>
//                   <p className="mt-0.5 text-xl font-bold text-blue-700">{formatCurrencyInt(filteredCGST)}</p>
//                 </div>
//                 <div className="border-l border-stone-200 pl-3 sm:pl-4">
//                   <p className="text-[10px] uppercase tracking-[0.14em] text-emerald-600">Incl. GST</p>
//                   <p className="mt-0.5 text-xl font-bold text-emerald-700">{formatCurrencyInt(filteredGrand)}</p>
//                 </div>
//               </div>
//             </div>

//             {/* Orders table */}
//             <table className="w-full text-left text-sm">
//               <thead>
//                 <tr className="border-b border-stone-200">
//                   {["Order ID", "Time", "Table", "Items", "Excl. GST", "SGST 2.5%", "CGST 2.5%", "Total (w/ GST)", "Status", "Reason", "Action"].map((h) => (
//                     <th key={h} className="pb-3 pr-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 last:pr-0 whitespace-nowrap">
//                       {h}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-stone-100">
//                 {filteredOrders.map((bill) => {
//                   const isActive = bill.status !== "completed" && bill.status !== "cancelled";
//                   const { base: bBase, sgst: bSgst, cgst: bCgst, grand: bGrand } = calcGST(bill.total);
//                   return (
//                     <tr key={bill._id} className={`group transition hover:bg-stone-50 ${bill.status === "cancelled" ? "opacity-70" : ""}`}>
//                       <td className="py-3.5 pr-4">
//                         <span className="font-mono text-xs font-bold text-slate-700">
//                           #{bill._id.slice(-6).toUpperCase()}
//                         </span>
//                       </td>
//                       <td className="py-3.5 pr-4 text-slate-600 whitespace-nowrap">
//                         {formatTime(bill.createdAt)}
//                       </td>
//                       <td className="py-3.5 pr-4 text-slate-600">T-{bill.tableNumber}</td>
//                       <td className="py-3.5 pr-4 text-slate-600">
//                         {bill.items.reduce((s, i) => s + i.qty, 0)}
//                       </td>
//                       <td className="py-3.5 pr-4 text-slate-700 whitespace-nowrap">
//                         {formatCurrency(bBase)}
//                       </td>
//                       <td className="py-3.5 pr-4 text-blue-600 whitespace-nowrap text-xs">
//                         {formatCurrency(bSgst)}
//                       </td>
//                       <td className="py-3.5 pr-4 text-blue-600 whitespace-nowrap text-xs">
//                         {formatCurrency(bCgst)}
//                       </td>
//                       <td className="py-3.5 pr-4 font-bold text-slate-900 whitespace-nowrap">
//                         {formatCurrencyInt(bGrand)}
//                       </td>
//                       <td className="py-3.5 pr-4">
//                         <StatusPill status={bill.status} />
//                       </td>
//                       {/* Cancel reason column */}
//                       <td className="py-3.5 pr-4">
//                         {bill.status === "cancelled" && bill.cancelReason ? (
//                           <span className="inline-block rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-700 whitespace-nowrap">
//                             {CANCEL_REASON_LABELS[bill.cancelReason] || bill.cancelReason}
//                           </span>
//                         ) : (
//                           <span className="text-slate-300 text-xs">—</span>
//                         )}
//                       </td>
//                       <td className="py-3.5">
//                         <div className="flex items-center gap-2">
//                           <button
//                             onClick={() => setSelectedBill(bill)}
//                             className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-stone-100"
//                           >
//                             View
//                           </button>
//                           {isActive && (
//                             <button
//                               onClick={() => handleRequestCancel(bill)}
//                               disabled={cancelling}
//                               className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
//                             >
//                               Cancel
//                             </button>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </section>

//       {/* Bill detail modal */}
//       {selectedBill && (
//         <BillDetailModal
//           bill={selectedBill}
//           cafe={cafe}
//           onClose={() => setSelectedBill(null)}
//           onRequestCancel={handleRequestCancelFromModal}
//           cancelling={cancelling}
//         />
//       )}

//       {/* Cancel & Reorder confirmation modal */}
//       {cancelTarget && (
//         <CancelReorderModal
//           bill={cancelTarget}
//           onConfirm={handleConfirmCancel}
//           onClose={() => { if (!cancelling) setCancelTarget(null); }}
//           cancelling={cancelling}
//         />
//       )}
//     </div>
//   );
// };

// export default BillingSection;

import useAuth from "../../hooks/useAuth";
import useBilling from "./billing/useBilling"
import BillingHeader from "./billing/BillingHeader";
import BillingSummaryCards from "./billing/BillingSummaryCards";
import BillingTable from "./billing/BillingTable";
import BillDetailModal from "./billing/BillDetailModal";
import CancelReorderModal from "./CancelReorderModal";

const BillingSection = () => {
  const { cafe } = useAuth();
  const {
    date, setDate,
    orders, summary,
    loading,
    selectedBill, setSelectedBill,
    cancelTarget, setCancelTarget,
    cancelling,
    statusFilter, setStatusFilter,
    filteredOrders,
    requestCancel,
    confirmCancel,
  } = useBilling();

  return (
    <div className="space-y-6">
      <BillingHeader
        date={date}
        onDateChange={setDate}
        orders={orders}
        summary={summary}
      />

      {summary && (
        <BillingSummaryCards orders={orders} summary={summary} />
      )}

      <BillingTable
        orders={orders}
        filteredOrders={filteredOrders}
        statusFilter={statusFilter}
        onFilterChange={setStatusFilter}
        loading={loading}
        onView={setSelectedBill}
        onCancel={requestCancel}
        cancelling={cancelling}
      />

      {selectedBill && (
        <BillDetailModal
          bill={selectedBill}
          cafe={cafe}
          onClose={() => setSelectedBill(null)}
          onRequestCancel={requestCancel}
          cancelling={cancelling}
        />
      )}

      {cancelTarget && (
        <CancelReorderModal
          orderId={cancelTarget._id}
          onConfirm={confirmCancel}
          onClose={() => { if (!cancelling) setCancelTarget(null); }}
          cancelling={cancelling}
        />
      )}
    </div>
  );
};

export default BillingSection;
