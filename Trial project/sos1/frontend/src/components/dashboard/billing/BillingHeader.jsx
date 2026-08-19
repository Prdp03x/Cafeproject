import { calcGST, formatCurrencyInt, formatDate, todayISO } from "./billingUtils.js";
import { StatusPill } from "./StatusPill";

const BillingHeader = ({ date, onDateChange, orders, summary }) => {
  const isToday = date === todayISO();

  const completedGrand = orders
    .filter((o) => o.status === "completed")
    .reduce((s, o) => s + calcGST(o.total).grand, 0);

  const completedBase = orders
    .filter((o) => o.status === "completed")
    .reduce((s, o) => s + (o.total || 0), 0);

  const totalGST = Math.round(completedBase * 0.05 * 100) / 100;

  const topStats = summary
    ? [
        { label: "Total bills",      value: summary.total },
        { label: "Completed",        value: summary.completed },
        { label: "GST collected",    value: formatCurrencyInt(totalGST) },
        { label: "Revenue (w/ GST)", value: formatCurrencyInt(completedGrand) },
      ]
    : [];

  return (
    <section className="overflow-hidden rounded-[32px] border border-white/70 bg-[linear-gradient(135deg,#17212e_0%,#1e3048_50%,#243347_100%)] p-6 text-white shadow-[0_28px_90px_rgba(15,23,42,0.16)] md:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">
            Billing analytics
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-[34px]">
            {isToday ? "Today's revenue" : `Bills for ${formatDate(date + "T00:00:00")}`}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
            View all bills for any day, track revenue, and manage cancellations.
            GST @ 5% (SGST 2.5% + CGST 2.5%).
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
            Select date
          </label>
          <input
            type="date"
            value={date}
            max={todayISO()}
            onChange={(e) => onDateChange(e.target.value)}
            className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          {!isToday && (
            <button
              onClick={() => onDateChange(todayISO())}
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/20"
            >
              Back to today
            </button>
          )}
        </div>
      </div>

      {topStats.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {topStats.map((stat) => (
            <div key={stat.label} className="rounded-[24px] border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/60">{stat.label}</p>
              <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default BillingHeader;
