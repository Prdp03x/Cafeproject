import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  FiArrowLeft,
  FiClock,
  FiRefreshCw,
  FiShoppingBag,
} from "react-icons/fi";
import API from "../api/api";
import socket from "../socket";
import useCafe from "../hooks/useCafe";
import useThemeColor from "../hooks/useThemeColor";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatTime = (value) => {
  if (!value) return "Recently";

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(parsedDate);
};

const formatDateTime = (value) => {
  if (!value) return "Not available";

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsedDate);
};

const statusConfig = {
  pending: {
    label: "Pending",
    badge: "border-amber-200 bg-amber-50 text-amber-800",
    accent: "bg-amber-500",
    progress: "w-1/3",
    summary: "The cafe has received your order.",
  },
  preparing: {
    label: "Preparing",
    badge: "border-sky-200 bg-sky-50 text-sky-800",
    accent: "bg-sky-500",
    progress: "w-2/3",
    summary: "Your order is being prepared now.",
  },
  completed: {
    label: "Completed",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
    accent: "bg-emerald-500",
    progress: "w-full",
    summary: "Your order is ready.",
  },
  cancelled: {
    label: "Cancelled",
    badge: "border-rose-200 bg-rose-50 text-rose-800",
    accent: "bg-rose-500",
    progress: "w-full",
    summary: "This order was cancelled by the cafe.",
  },
};

const OrderStatus = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const [params] = useSearchParams();

  const cafeId = params.get("cafe");
  const tableNumber = params.get("table");
  const { cafe } = useCafe(cafeId);
  useThemeColor(cafe?.themeColor);

  useEffect(() => {
    document.title = "Your Orders | My Cafe";
  }, []);

  const fetchOrders = useCallback(
    async ({ silent = false } = {}) => {
      if (!cafeId || !tableNumber) {
        setOrders([]);
        setError("Missing cafe or table details.");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const res = await API.get("/orders/customer", {
          params: { cafeId, tableNumber },
        });

        const nextOrders = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.orders)
            ? res.data.orders
            : [];

        setOrders(nextOrders);
        setError("");
      } catch (err) {
        console.error("Error fetching orders:", err);
        setOrders([]);
        setError("Unable to load your active orders right now.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [cafeId, tableNumber],
  );

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (!cafeId) return;

    socket.emit("joinCafe", cafeId);

    const handleOrderUpdated = () => {
      void fetchOrders({ silent: true });
    };

    const handleOrderDeleted = (deletedOrderId) => {
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order._id !== deletedOrderId),
      );
    };

    socket.on("newOrder", handleOrderUpdated);
    socket.on("orderUpdated", handleOrderUpdated);
    socket.on("orderDeleted", handleOrderDeleted);

    return () => {
      socket.off("newOrder", handleOrderUpdated);
      socket.off("orderUpdated", handleOrderUpdated);
      socket.off("orderDeleted", handleOrderDeleted);
    };
  }, [cafeId, fetchOrders]);

  const sortedOrders = [...orders].sort(
    (firstOrder, secondOrder) =>
      new Date(secondOrder.createdAt || 0) -
      new Date(firstOrder.createdAt || 0),
  );
  const activeCount = orders.filter(
    (order) => !["completed", "cancelled"].includes(order.status),
  ).length;
  const totalItems = orders.reduce(
    (sum, order) =>
      sum + order.items.reduce((itemSum, item) => itemSum + (item.qty || 0), 0),
    0,
  );
  const totalPayable = orders.reduce(
    (sum, order) => sum + (order.total || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-[#f6f1e8] px-4 py-5 text-slate-900 sm:px-5">
      <div className="mx-auto max-w-2xl space-y-4">
        <section className="rounded-[28px] border border-white/70 bg-white/88 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() =>
                navigate(`/?cafe=${cafeId || ""}&table=${tableNumber || ""}`)
              }
              className="inline-flex items-center gap-2 rounded-2xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-stone-100 cursor-pointer"
            >
              <FiArrowLeft />
              Menu
            </button>

            <button
              onClick={() => void fetchOrders({ silent: true })}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          <div className="mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Table {tableNumber || "--"}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Your orders
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Live updates from the cafe. Refresh if you want to check again.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2.5">
            <div className="rounded-[20px] border border-stone-200 bg-stone-50 px-3 py-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                Active
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {activeCount}
              </p>
            </div>

            <div className="rounded-[20px] border border-stone-200 bg-stone-50 px-3 py-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                Items
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {totalItems}
              </p>
            </div>

            <div className="rounded-[20px] border border-stone-200 bg-stone-50 px-3 py-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                Total
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {formatCurrency(totalPayable)}
              </p>
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="flex min-h-[260px] items-center justify-center rounded-[28px] border border-white/70 bg-white/85 shadow-[0_20px_60px_rgba(15,23,42,0.07)]">
            <div className="flex flex-col items-center gap-4">
              <div className="h-11 w-11 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
              <p className="text-sm text-slate-500">Loading your orders...</p>
            </div>
          </div>
        ) : sortedOrders.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-stone-300 bg-white/82 px-5 py-16 text-center shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-slate-700 shadow-inner">
              <FiShoppingBag size={22} />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-slate-900">
              No active orders
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Place an order from the menu and it will appear here.
            </p>
            <button
              onClick={() =>
                navigate(`/?cafe=${cafeId || ""}&table=${tableNumber || ""}`)
              }
              className="theme-primary theme-primary-hover mt-5 inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white"
            >
              <FiArrowLeft />
              Go to menu
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedOrders.map((order) => {
              const currentStatus =
                statusConfig[order.status] || statusConfig.pending;

              return (
                <article
                  key={order._id}
                  className="overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
                >
                  <div className={`h-1.5 w-full ${currentStatus.accent}`} />

                  <div className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                          Order #{order._id.slice(-6).toUpperCase()}
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          Placed {formatDateTime(order.createdAt)}
                        </p>
                      </div>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${currentStatus.badge}`}
                      >
                        {currentStatus.label}
                      </span>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-slate-600">
                      {currentStatus.summary}
                    </p>

                    <div className="mt-3 h-2 rounded-full bg-stone-200">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${currentStatus.accent} ${currentStatus.progress}`}
                      />
                    </div>

                    <div className="mt-4">
                      {order.items.map((item, index) => {
                        const extras =
                          item.selectedOptions?.reduce(
                            (sum, option) => sum + (option.price || 0),
                            0,
                          ) || 0;
                        const lineTotal = (item.price + extras) * item.qty;

                        const extraOpt =
                          item.selectedOptions?.map((opt) => opt.name) || [];

                        return (
                          <div
                            key={`${order._id}-${index}`}
                            className="px-4 pt-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-950">
                                  {item.qty}{" "}
                                  <span className="font-normal text-slate-500">
                                    x
                                  </span>{" "}
                                  {item.name}
                                </p>
                              </div>

                              <p className="shrink-0 text-sm font-semibold text-slate-950">
                                {formatCurrency(lineTotal)}
                              </p>
                            </div>

                            {item.selectedOptions?.length ? (
                              <div className="mt-0 flex flex-wrap gap-1.5">
                                {extraOpt.length ? (
                                  <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500">
                                    + {extraOpt.join(", ")}
                                  </p>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-stone-200 pt-4">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                          Total
                        </p>
                        <p className="mt-1 text-lg font-semibold text-slate-950">
                          {formatCurrency(order.total)}
                        </p>
                      </div>

                      <p className="inline-flex items-center gap-2 text-xs text-slate-500">
                        <FiClock className="text-slate-400" />
                        Updated {formatTime(order.updatedAt || order.createdAt)}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderStatus;
