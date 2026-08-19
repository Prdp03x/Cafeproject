import { calcGST, formatCurrency, formatCurrencyInt, formatDate, formatTime } from "./billingUtils.js";
import { StatusPill } from "./StatusPill";
import { CANCEL_REASON_LABELS } from "../../../constants/cancelReasons"

const BillDetailModal = ({ bill, cafe, onClose, onRequestCancel, cancelling }) => {
  if (!bill) return null;

  const isActive = bill.status !== "completed" && bill.status !== "cancelled";
  const { base, sgst, cgst, grand } = calcGST(bill.total);

  const cafeAddress = [cafe?.address, cafe?.city, cafe?.state, cafe?.postalCode]
    .filter(Boolean).join(", ");

  const handlePrint = () => {
    const printContent = `
      <html><head>
        <title>Bill #${bill._id.slice(-6).toUpperCase()}</title>
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body { font-family:'Courier New',monospace; font-size:12px; color:#000; padding:16px; max-width:320px; margin:0 auto; }
          .center { text-align:center; }
          .bold { font-weight:bold; }
          .divider { border-top:1px dashed #000; margin:8px 0; }
          .row { display:flex; justify-content:space-between; margin:3px 0; }
          .cafe-name { font-size:16px; font-weight:bold; letter-spacing:1px; }
          .meta { font-size:10px; color:#444; margin-top:2px; }
          .receipt-title { font-size:13px; font-weight:bold; letter-spacing:2px; margin:8px 0 4px; }
          .item-name { flex:1; }
          .item-price { text-align:right; white-space:nowrap; margin-left:8px; }
          .extras { font-size:10px; color:#666; padding-left:12px; margin-bottom:2px; }
          .gst-row { font-size:11px; }
          .total-row { font-size:14px; font-weight:bold; }
          .status { display:inline-block; padding:2px 8px; border:1px solid #000; border-radius:3px; font-size:10px; text-transform:uppercase; letter-spacing:1px; }
          .footer { margin-top:14px; font-size:10px; color:#666; }
          .cancel-reason { margin-top:8px; font-size:10px; color:#c00; border:1px dashed #c00; padding:4px 8px; border-radius:3px; }
        </style>
      </head><body>
        <div class="center">
          <div class="cafe-name">${cafe?.name || "CAFE"}</div>
          ${cafeAddress ? `<div class="meta">${cafeAddress}</div>` : ""}
          ${cafe?.phone ? `<div class="meta">Ph: ${cafe.phone}</div>` : ""}
          ${cafe?.gstNumber ? `<div class="meta">GSTIN: ${cafe.gstNumber}</div>` : ""}
          ${cafe?.fssaiNumber ? `<div class="meta">FSSAI: ${cafe.fssaiNumber}</div>` : ""}
          <div class="receipt-title">TAX INVOICE</div>
          <div class="meta">Order #${bill._id.slice(-6).toUpperCase()} &nbsp;|&nbsp; Table ${bill.tableNumber}</div>
          <div class="meta">${new Date(bill.createdAt).toLocaleString("en-IN")}</div>
          <div style="margin-top:5px"><span class="status">${bill.status}</span></div>
          ${bill.status === "cancelled" && bill.cancelReason
            ? `<div class="cancel-reason">Cancelled: ${CANCEL_REASON_LABELS[bill.cancelReason] || bill.cancelReason}${bill.cancelNote ? " — " + bill.cancelNote : ""}</div>`
            : ""}
        </div>
        <div class="divider"></div>
        <div class="row bold meta"><span>Item</span><span>Amount</span></div>
        <div style="margin:3px 0"></div>
        ${bill.items.map((item) => {
          const extras = item.selectedOptions?.reduce((s, o) => s + o.price, 0) || 0;
          const lineTotal = item.qty * (item.price + extras);
          return `
            <div class="row"><span class="item-name bold">${item.qty}x ${item.name}</span><span class="item-price">₹${lineTotal.toFixed(2)}</span></div>
            ${item.selectedOptions?.length ? `<div class="extras">+ ${item.selectedOptions.map((o) => o.name).join(", ")}</div>` : ""}
          `;
        }).join("")}
        <div class="divider"></div>
        <div class="row gst-row"><span>Subtotal (excl. GST)</span><span>₹${base.toFixed(2)}</span></div>
        <div class="row gst-row"><span>SGST @ 2.5%</span><span>₹${sgst.toFixed(2)}</span></div>
        <div class="row gst-row"><span>CGST @ 2.5%</span><span>₹${cgst.toFixed(2)}</span></div>
        <div class="divider"></div>
        <div class="row gst-row"><span>Exact amount</span><span>₹${grand.toFixed(2)}</span></div>
        <div class="row total-row"><span>TOTAL (incl. GST)</span><span>₹${Math.round(grand)}</span></div>
        <div class="divider"></div>
        ${cafe?.gstNumber ? `<div class="center meta" style="margin-top:4px">GSTIN: ${cafe.gstNumber}</div>` : ""}
        <div class="center footer">Thank you for dining with us!</div>
      </body></html>
    `;
    const win = window.open("", "_blank", "width=400,height=700");
    win.document.write(printContent);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_32px_100px_rgba(15,23,42,0.18)]">

        {/* Header */}
        <div className="shrink-0 flex items-start justify-between p-6 pb-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Tax Invoice</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">#{bill._id.slice(-6).toUpperCase()}</h2>
            <div className="mt-2 flex items-center gap-3">
              <StatusPill status={bill.status} />
              <span className="text-xs text-slate-400">Table {bill.tableNumber}</span>
            </div>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-slate-500 transition hover:bg-stone-100">
            ✕
          </button>
        </div>

        {/* Cafe strip */}
        {(cafe?.name || cafe?.gstNumber || cafe?.phone || cafeAddress) && (
          <div className="mx-6 mb-3 shrink-0 rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3">
            {cafe?.name && <p className="text-sm font-bold text-slate-900">{cafe.name}</p>}
            {cafeAddress && <p className="mt-0.5 text-[11px] text-slate-500">{cafeAddress}</p>}
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
              {cafe?.phone     && <p className="text-[11px] text-slate-500">📞 {cafe.phone}</p>}
              {cafe?.gstNumber && <p className="text-[11px] font-mono font-semibold text-slate-600">GSTIN: {cafe.gstNumber}</p>}
              {cafe?.fssaiNumber && <p className="text-[11px] text-slate-500">FSSAI: {cafe.fssaiNumber}</p>}
            </div>
          </div>
        )}

        {/* Cancellation record */}
        {bill.status === "cancelled" && bill.cancelReason && (
          <div className="mx-6 mb-3 shrink-0 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-600">Cancellation record</p>
            <p className="mt-1 text-sm font-semibold text-rose-800">
              {CANCEL_REASON_LABELS[bill.cancelReason] || bill.cancelReason}
            </p>
            {bill.cancelNote && <p className="mt-0.5 text-xs italic text-rose-700">"{bill.cancelNote}"</p>}
            {bill.cancelledAt && (
              <p className="mt-1 text-[11px] text-rose-500">
                Cancelled at {formatTime(bill.cancelledAt)} · {formatDate(bill.cancelledAt)}
              </p>
            )}
          </div>
        )}

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 pb-2">
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-stone-100 bg-stone-50 px-3 py-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Order time</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{formatTime(bill.createdAt)}</p>
              <p className="text-[11px] text-slate-400">{formatDate(bill.createdAt)}</p>
            </div>
            <div className="rounded-2xl border border-stone-100 bg-stone-50 px-3 py-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Grand total</p>
              <p className="mt-1 text-lg font-bold text-slate-900">{formatCurrencyInt(Math.round(grand))}</p>
              <p className="text-[11px] text-slate-400">incl. GST</p>
            </div>
          </div>

          {/* Items + GST breakdown */}
          <div className="mb-4 overflow-hidden rounded-2xl border border-stone-100">
            <div className="bg-stone-50 px-4 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Items ordered</p>
            </div>
            <div className="divide-y divide-stone-100">
              {bill.items.map((item, i) => {
                const extras    = item.selectedOptions?.reduce((s, o) => s + o.price, 0) || 0;
                const lineTotal = item.qty * (item.price + extras);
                return (
                  <div key={i} className="flex items-start justify-between gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900"><span className="font-bold">{item.qty}×</span> {item.name}</p>
                      {item.selectedOptions?.length > 0 && (
                        <p className="mt-0.5 text-[11px] text-slate-400">+ {item.selectedOptions.map((o) => o.name).join(", ")}</p>
                      )}
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-slate-800">{formatCurrency(lineTotal)}</span>
                  </div>
                );
              })}
            </div>
            <div className="divide-y divide-stone-100 border-t border-stone-200 bg-stone-50">
              {[
                { label: "Subtotal (excl. GST)", value: formatCurrency(base),  cls: "text-slate-500" },
                { label: "SGST @ 2.5%",          value: formatCurrency(sgst),  cls: "text-slate-500" },
                { label: "CGST @ 2.5%",          value: formatCurrency(cgst),  cls: "text-slate-500" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between px-4 py-2.5">
                  <p className={`text-xs ${row.cls}`}>{row.label}</p>
                  <p className="text-xs font-semibold text-slate-700">{row.value}</p>
                </div>
              ))}
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">Total (incl. GST)</p>
                  <p className="text-[11px] text-slate-400">Exact: {formatCurrency(grand)}</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-slate-900">{formatCurrencyInt(Math.round(grand))}</p>
                  <p className="text-[11px] text-slate-400">rounded</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex shrink-0 gap-3 border-t border-stone-100 px-6 py-4">
          <button onClick={onClose} className="flex-1 rounded-2xl border border-stone-200 bg-stone-50 py-3 text-sm font-semibold text-slate-700 transition hover:bg-stone-100">
            Close
          </button>
          <button onClick={handlePrint} className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:bg-stone-50">
            🖨 Print
          </button>
          {isActive && (
            <button onClick={() => onRequestCancel(bill)} disabled={cancelling} className="flex-1 rounded-2xl bg-rose-600 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60">
              {cancelling ? "Cancelling..." : "Cancel & Reorder"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillDetailModal;
