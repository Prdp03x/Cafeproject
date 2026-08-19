export const StatusPill = ({ status }) => {
  const STATUS_STYLES = {
    pending:   { pill: "bg-amber-100 text-amber-700 border-amber-200",       dot: "bg-amber-400",   label: "Pending" },
    preparing: { pill: "bg-blue-100 text-blue-700 border-blue-200",          dot: "bg-blue-400",    label: "Preparing" },
    completed: { pill: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", label: "Completed" },
    cancelled: { pill: "bg-rose-100 text-rose-700 border-rose-200",          dot: "bg-rose-500",    label: "Cancelled" },
  };
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${s.pill}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};