import { useState } from "react";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatTimeAgo = (value) => {
  if (!value) return "Now";

  const created = new Date(value);
  const now = new Date();

  const diffMinutes = Math.floor(
    (now.getTime() - created.getTime()) / 60000
  );

  if (diffMinutes < 1) return "Just now";

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const hours = Math.floor(diffMinutes / 60);

  return `${hours} hr ago`;
};

const statusStyles = {
  pending: {
    badge:
      "bg-amber-100 text-amber-700 border-amber-200",
    border: "border-amber-200",
    accent: "bg-amber-500",
    label: "Pending",
  },

  preparing: {
    badge:
      "bg-blue-100 text-blue-700 border-blue-200",
    border: "border-blue-200",
    accent: "bg-blue-500",
    label: "Preparing",
  },

  completed: {
    badge:
      "bg-emerald-100 text-emerald-700 border-emerald-200",
    border: "border-emerald-200",
    accent: "bg-emerald-500",
    label: "Completed",
  },

  cancelled: {
    badge:
      "bg-rose-100 text-rose-700 border-rose-200",
    border: "border-rose-200",
    accent: "bg-rose-500",
    label: "Cancelled",
  },
};

const OrderCard = ({
  order,
  isNew,
  updateStatus,
  deleteOrder,
  loadingActions,
}) => {
  const [expanded, setExpanded] = useState(false);

  const currentStatus =
    statusStyles[order.status] || statusStyles.pending;

  const isPreparingLoading = Boolean(
    loadingActions[`${order._id}:preparing`]
  );

  const isCompletedLoading = Boolean(
    loadingActions[`${order._id}:completed`]
  );

  const isDeleteLoading = Boolean(
    loadingActions[`${order._id}:delete`]
  );

  const isAnyActionLoading =
    isPreparingLoading ||
    isCompletedLoading ||
    isDeleteLoading;

  const canStartPreparing = order.status === "pending";

  const canComplete = order.status !== "completed";

  const canDelete =
    order.status === "completed" ||
    order.status === "cancelled";

  const MAX_VISIBLE_ITEMS = 5;

  const visibleItems = expanded
    ? order.items
    : order.items.slice(0, MAX_VISIBLE_ITEMS);

  const remainingItems =
    order.items.length - MAX_VISIBLE_ITEMS;

  const orderMinutes = Math.floor(
    (new Date() - new Date(order.createdAt)) /
      60000
  );

  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
        isNew
          ? "ring-2 ring-emerald-300"
          : "hover:-translate-y-0.5 hover:shadow-md"
      } ${currentStatus.border}`}
    >
      {/* Top Accent */}
      <div className={`h-1 w-full ${currentStatus.accent}`} />

      <div className="flex h-full flex-col p-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Table {order.tableNumber}
              </p>

              {isNew ? (
                <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                  New
                </span>
              ) : null}
            </div>

            <h3 className="mt-1 text-sm font-semibold text-slate-900">
              #{order._id.slice(-6).toUpperCase()}
            </h3>

            <p
              className={`mt-1 text-[11px] ${
                orderMinutes >= 15
                  ? "font-semibold text-rose-600"
                  : "text-slate-500"
              }`}
            >
              {orderMinutes >= 15 ? "⚠ " : ""}
              {formatTimeAgo(order.createdAt)}
            </p>
          </div>

          <span
            className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${currentStatus.badge}`}
          >
            {currentStatus.label}
          </span>
        </div>

        {/* Items */}
        <div className="mt-3 space-y-2">
          {visibleItems.map((item, index) => {
            const extras =
              item.selectedOptions?.map(
                (opt) => opt.name
              ) || [];

            return (
              <div key={index}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      <span className="font-bold">
                        {item.qty} x
                      </span>{" "}
                      {item.name}
                    </p>

                    {extras.length ? (
                      <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500">
                        + {extras.join(", ")}
                      </p>
                    ) : null}
                  </div>

                  <span className="shrink-0 text-sm font-semibold text-slate-900">
                    {formatCurrency(
                      item.qty *
                        (item.price +
                          (item.selectedOptions?.reduce(
                            (sum, opt) =>
                              sum + opt.price,
                            0
                          ) || 0))
                    )}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Expand */}
          {remainingItems > 0 ? (
            <button
              onClick={() =>
                setExpanded(!expanded)
              }
              className="text-xs font-medium text-slate-500 transition hover:text-slate-800"
            >
              {expanded
                ? "Show less"
                : `View ${remainingItems} more item${
                    remainingItems === 1
                      ? ""
                      : "s"
                  }`}
            </button>
          ) : null}
        </div>

        {/* Footer */}
        <div className="mt-auto border-t border-stone-200 pt-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Total
              </p>

              <p className="mt-0.5 text-base font-bold text-slate-950">
                {formatCurrency(order.total)}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {canStartPreparing ? (
                <button
                  onClick={() =>
                    updateStatus(
                      order._id,
                      "preparing"
                    )
                  }
                  disabled={isAnyActionLoading}
                  className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:opacity-60"
                >
                  {isPreparingLoading
                    ? "..."
                    : "Preparing"}
                </button>
              ) : null}

              {canComplete ? (
                <button
                  onClick={() =>
                    updateStatus(
                      order._id,
                      "completed"
                    )
                  }
                  disabled={isAnyActionLoading}
                  className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                >
                  {isCompletedLoading
                    ? "..."
                    : "Complete"}
                </button>
              ) : null}

              {canDelete ? (
                <button
                  onClick={() =>
                    deleteOrder(order._id)
                  }
                  disabled={isAnyActionLoading}
                  className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                >
                  {isDeleteLoading
                    ? "..."
                    : "Remove"}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;