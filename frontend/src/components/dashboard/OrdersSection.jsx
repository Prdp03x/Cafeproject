import OrderCard from "./OrderCard";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const OrdersSection = ({
  orders,
  newOrderIds,
  updateStatus,
  deleteOrder,
  loadingActions,
}) => {
  const pendingCount = orders.filter((order) => order.status === "pending").length;
  const preparingCount = orders.filter(
    (order) => order.status === "preparing",
  ).length;
  const completedCount = orders.filter(
    (order) => order.status === "completed",
  ).length;
  const revenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const averageTicket = orders.length ? Math.round(revenue / orders.length) : 0;
  const sortedOrders = [...orders].sort((firstOrder, secondOrder) => {
    const priority = {
      pending: 0,
      preparing: 1,
      completed: 2,
      cancelled: 3,
    };

    const firstPriority = priority[firstOrder.status] ?? 99;
    const secondPriority = priority[secondOrder.status] ?? 99;

    if (firstPriority !== secondPriority) {
      return firstPriority - secondPriority;
    }

    return new Date(secondOrder.createdAt || 0) - new Date(firstOrder.createdAt || 0);
  });

  const stats2 = [
  {
    title: "Total tickets",
    value: orders.length,
    cardClass:
      "border-white/70 bg-white/82",
    titleClass:
      "text-slate-400",
    valueClass:
      "text-slate-900",
  },
  {
    title: "Pending",
    value: pendingCount,
    cardClass:
      "border-amber-200 bg-amber-50/90",
    titleClass:
      "text-amber-700",
    valueClass:
      "text-amber-900",
  },
  {
    title: "Preparing",
    value: preparingCount,
    cardClass:
      "border-blue-200 bg-blue-50/90",
    titleClass:
      "text-blue-700",
    valueClass:
      "text-blue-900",
  },
  {
    title: "Completed",
    value: completedCount,
    cardClass:
      "border-emerald-200 bg-emerald-50/90",
    titleClass:
      "text-emerald-700",
    valueClass:
      "text-emerald-900",
  },
];

const stats = [
  {
    title: "Orders in queue",
    value: orders.length,
  },
  {
    title: "Average ticket",
    value: formatCurrency(averageTicket),
  },
  {
    title: "Visible revenue",
    value: formatCurrency(revenue),
  },
];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-white/70 bg-[linear-gradient(135deg,#17212e_0%,#253244_50%,#34514a_100%)] p-6 text-white shadow-[0_28px_90px_rgba(15,23,42,0.16)] md:p-7">
  <div>
    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">
      Live operations
    </p>

    <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-[34px]">
      Keep every order visible and moving.
    </h2>

    <p className="mt-3 max-w-2xl text-sm leading-6 text-white/72">
      Pending orders stay at the top, kitchen progress remains visible,
      and the dashboard stays readable during peak traffic.
    </p>

    {/* Stats Grid */}
    <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
      {stats.map((item, index) => (
      <div
        key={index}
        className="rounded-[24px] border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/60">
          {item.title}
        </p>
        <p className="mt-2 text-3xl font-semibold">
          {item.value}
        </p>
      </div>
    ))}
    </div>
  </div>
</section>
      <div className="grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-4">
        {stats2.map((item, index) => (
      <div
        key={index}
        className={`flex flex-col justify-between rounded-xl md:rounded-[28px] border p-3 md:px-5 md:py-4 shadow-[0_20px_60px_rgba(15,23,42,0.05)] ${item.cardClass}`} >
        <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${item.titleClass}`} >
          {item.title}
        </p>
        <p className={`mt-2 text-3xl font-semibold ${item.valueClass}`}>
          {item.value}
        </p>
      </div>
    ))}
      </div>

      <section className="rounded-[32px] border border-white/70 bg-white/85 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.07)] md:p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-slate-950">
              Kitchen queue
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Orders are grouped by priority. Pending tickets stay first, then active prep,
              followed by completed records.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-slate-600">
              Auto-updating
            </span>
            <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-slate-600">
              Pending first
            </span>
            <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-slate-600">
              {newOrderIds.length} new highlight{newOrderIds.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-stone-300 bg-stone-50 px-6 py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
              K
            </div>
            <h3 className="mt-5 text-xl font-semibold text-slate-800">
              No active orders right now
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              New orders will appear here automatically. The layout is ready for peak
              service, but the queue is currently clear.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {sortedOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                isNew={newOrderIds.includes(order._id)}
                updateStatus={updateStatus}
                deleteOrder={deleteOrder}
                loadingActions={loadingActions}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default OrdersSection;
