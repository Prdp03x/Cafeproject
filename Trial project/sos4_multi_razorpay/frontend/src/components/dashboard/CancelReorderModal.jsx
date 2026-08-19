// ─── Shared Cancel & Reorder Modal ───────────────────────────────────────────
// Used by both Dashboard (Orders queue) and BillingSection.
// Props:
//   orderId    — string  — shown in the heading (last 6 chars)
//   onConfirm  — fn({ reason, note }) — called when staff confirms
//   onClose    — fn()   — called when staff dismisses
//   cancelling — bool   — disables buttons while API call is in flight

import { useState } from "react";
import { CANCEL_REASON_LABELS, CANCEL_REASONS } from "../../constants/cancelReasons";

const CancelReorderModal = ({ orderId, onConfirm, onClose, cancelling }) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [note, setNote]                     = useState("");

  const showNote   = selectedReason === "other" || selectedReason === "entry_error";
  const noteRequired = selectedReason === "other";
  const canSubmit  =
    selectedReason !== "" &&
    !cancelling &&
    (!noteRequired || note.trim() !== "");

  const shortId = orderId ? `#${orderId.slice(-6).toUpperCase()}` : "";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[28px] border border-white/70 bg-white shadow-[0_32px_100px_rgba(15,23,42,0.22)] overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-500">
                Cancel &amp; Reorder
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">
                Cancel order {shortId}?
              </h2>
            </div>
            <button
              onClick={onClose}
              disabled={cancelling}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-slate-500 transition hover:bg-stone-100 disabled:opacity-40"
            >
              ✕
            </button>
          </div>

          {/* Info strip */}
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-xs font-semibold text-amber-800">What happens after cancelling?</p>
            <ul className="mt-1.5 space-y-1 text-xs text-amber-700 leading-5">
              <li>• This bill is permanently marked as <strong>Cancelled</strong> in history</li>
              <li>• The original amounts are preserved for your audit trail</li>
              <li>• The customer will need to place a fresh order</li>
            </ul>
          </div>
        </div>

        {/* Reason selector */}
        <div className="px-6 pb-2">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Reason for cancellation <span className="text-rose-500">*</span>
          </p>
          <div className="space-y-2">
            {CANCEL_REASONS.map((reason) => (
              <button
                key={reason.value}
                type="button"
                onClick={() => setSelectedReason(reason.value)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                  selectedReason === reason.value
                    ? "border-rose-300 bg-rose-50"
                    : "border-stone-200 bg-stone-50 hover:bg-stone-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center ${
                    selectedReason === reason.value
                      ? "border-rose-500 bg-rose-500"
                      : "border-stone-300"
                  }`}>
                    {selectedReason === reason.value && (
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${
                      selectedReason === reason.value ? "text-rose-800" : "text-slate-800"
                    }`}>
                      {reason.label}
                    </p>
                    <p className="text-xs text-slate-500">{reason.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Optional / required note */}
          {showNote && (
            <div className="mt-3">
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Note{" "}
                {noteRequired
                  ? <span className="text-rose-500">*</span>
                  : <span className="text-slate-400">(optional)</span>}
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={200}
                rows={2}
                placeholder={
                  selectedReason === "other"
                    ? "Describe the reason..."
                    : "What was entered incorrectly?"
                }
                className="w-full resize-none rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100"
              />
              <p className="mt-1 text-right text-[11px] text-slate-400">{note.length}/200</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 border-t border-stone-100 px-6 py-4">
          <button
            onClick={onClose}
            disabled={cancelling}
            className="flex-1 rounded-2xl border border-stone-200 bg-stone-50 py-3 text-sm font-semibold text-slate-700 transition hover:bg-stone-100 disabled:opacity-40"
          >
            Go back
          </button>
          <button
            onClick={() => onConfirm({ reason: selectedReason, note })}
            disabled={!canSubmit}
            className="flex-1 rounded-2xl bg-rose-600 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-40"
          >
            {cancelling ? "Cancelling..." : "Confirm cancel"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelReorderModal;
