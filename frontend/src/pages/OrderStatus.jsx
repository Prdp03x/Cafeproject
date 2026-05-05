import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import EmptyState from "../components/EmptyState";
import API from "../api/api";
import socket from "../socket";

const OrderStatus = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const cafeId = params.get("cafe");
  const tableNumber = params.get("table");

  const sessionId = localStorage.getItem("sessionId");

  useEffect(() => {
    document.title = "Your Orders | My Cafe";
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      if (!cafeId || !tableNumber) {
        console.warn("Missing cafeId or tableNumber");
        setOrders([]);
        return;
      }

      const res = await API.get(
        `/orders/customer?cafeId=${cafeId}&tableNumber=${tableNumber}&sessionId=${sessionId}`,
      );

      if (Array.isArray(res.data)) {
        setOrders(res.data);
      } else if (Array.isArray(res.data.orders)) {
        setOrders(res.data.orders);
      } else {
        console.error("Invalid orders response:", res.data);
        setOrders([]);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setOrders([]);
    }
  }, [cafeId, tableNumber, sessionId]);

  useEffect(() => {
    if (!cafeId) return;

    socket.emit("joinCafe", cafeId);

    socket.on("orderUpdated", fetchOrders);

    return () => {
      socket.off("orderUpdated", fetchOrders);
    };
  }, [cafeId, fetchOrders]);

  useEffect(() => {
    if (!cafeId || !tableNumber) return;

    const initialFetch = setTimeout(fetchOrders, 0);

    const interval = setInterval(fetchOrders, 4000);
    return () => {
      clearTimeout(initialFetch);
      clearInterval(interval);
    };
  }, [cafeId, tableNumber, fetchOrders]);

  // 🔥 Auto remove completed orders after 10 sec
  useEffect(() => {
    const completedOrders = orders.filter(
      (o) => (o.status || "").toLowerCase() === "completed",
    );

    if (completedOrders.length === 0) return;

    const timer = setTimeout(() => {
      const remaining = orders.filter(
        (o) => (o.status || "").toLowerCase() !== "completed",
      );

      setOrders(remaining);

      const remainingIds = remaining.map((o) => o._id);

      const allOrders = JSON.parse(localStorage.getItem("orders")) || {};

      const updatedOrders = {
        ...allOrders,
        [cafeId]: remainingIds,
      };

      localStorage.setItem("orders", JSON.stringify(updatedOrders));
    }, 10000);

    return () => clearTimeout(timer);
  }, [orders, cafeId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-5">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">🧾 Your Orders</h1>

          <button
            onClick={() => navigate(`/?cafe=${cafeId}&table=${tableNumber}`)}
            className="bg-black text-white px-5 py-2 rounded-full shadow hover:scale-105 transition"
          >
            ← Menu
          </button>
        </div>

        {/* Empty State */}
        {orders.length === 0 ? (
          <EmptyState
            title="No Active Orders"
            subtitle="Place your order from the menu 🍽️"
          />
        ) : (
          orders.map((order) => (
            <div
              key={order._id}
              className="backdrop-blur-lg bg-white/70 border border-white/30 rounded-3xl shadow-lg p-6 mb-6 hover:shadow-xl transition"
            >
              {/* Order ID */}
              <p className="text-xs text-gray-500 mb-3">
                Order #{order._id.slice(-6)}
              </p>

              {/* Items */}
              {order.items.map((item, i) => {
                const extras =
                  item.selectedOptions?.reduce((s, o) => s + o.price, 0) || 0;

                const itemTotal = (item.price + extras) * item.qty;

                return (
                  <div key={i} className="mb-3">
                    <div className="flex justify-between font-medium">
                      <span>
                        {item.name}{" "}
                        <span className="text-gray-400">×{item.qty}</span>
                      </span>
                      <span>₹{itemTotal}</span>
                    </div>

                    {/* Options */}
                    {item.selectedOptions?.map((opt, idx) => (
                      <p key={idx} className="text-xs text-gray-500 ml-3">
                        + {opt.name} (₹{opt.price})
                      </p>
                    ))}
                  </div>
                );
              })}

              {/* Total */}
              <div className="flex justify-between font-bold text-lg mt-4 border-t pt-3">
                <span>Total</span>
                <span>₹{order.total}</span>
              </div>

              {/* Status Section */}
              <div className="mt-5 flex items-center justify-between">
                {/* Status Badge */}
                <span
                  className={`px-4 py-1 rounded-full text-white text-sm capitalize ${
                    order.status === "completed"
                      ? "bg-green-500"
                      : order.status === "preparing"
                        ? "bg-yellow-500 animate-pulse"
                        : "bg-gray-400"
                  }`}
                >
                  {order.status || "pending"}
                </span>

                {/* Status Text */}
                {order.status === "completed" && (
                  <span className="text-green-600 font-medium text-sm animate-bounce">
                    ✅ Ready to serve
                  </span>
                )}

                {order.status === "preparing" && (
                  <span className="text-yellow-600 text-sm flex items-center gap-1">
                    👨‍🍳 Cooking...
                  </span>
                )}

                {order.status === "pending" && (
                  <span className="text-gray-500 text-sm">🕒 Waiting...</span>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    order.status === "completed"
                      ? "w-full bg-green-500"
                      : order.status === "preparing"
                        ? "w-2/3 bg-yellow-500"
                        : "w-1/4 bg-gray-400"
                  }`}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderStatus;
