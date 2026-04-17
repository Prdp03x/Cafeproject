import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import EmptyState from "../components/EmptyState";
import API from "../api/api";

const OrderStatus = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const cafeId = params.get("cafe");
  const tableNumber = params.get("table");

  useEffect(() => {
    document.title = "Your Orders | My Cafe";
  }, []);

  const fetchOrders = async () => {
    try {
      const allOrders =
        JSON.parse(localStorage.getItem("orders")) || {};

      const orderIds = allOrders[cafeId] || [];

      if (!orderIds.length) {
        setOrders([]);
        return;
      }

      const results = await Promise.all(
        orderIds.map((id) =>
          API.get(`/order/${id}`)
            .then((res) => res.data)
            .catch(() => null)
        )
      );

      const validOrders = results.filter(Boolean);
      setOrders(validOrders);

      // ✅ FIXED STORAGE (per cafe)
      const validIds = validOrders.map((o) => o._id);

      const updatedOrders = {
        ...allOrders,
        [cafeId]: validIds,
      };

      localStorage.setItem("orders", JSON.stringify(updatedOrders));

    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  useEffect(() => {
    fetchOrders();

    const interval = setInterval(fetchOrders, 4000);
    return () => clearInterval(interval);
  }, []);

  // 🔥 Auto remove completed orders after 10 sec
  useEffect(() => {
    const completedOrders = orders.filter(
      (o) => (o.status || "").toLowerCase() === "completed"
    );

    if (completedOrders.length === 0) return;

    const timer = setTimeout(() => {
      const remaining = orders.filter(
        (o) => (o.status || "").toLowerCase() !== "completed"
      );

      setOrders(remaining);

      const remainingIds = remaining.map((o) => o._id);

      const allOrders =
        JSON.parse(localStorage.getItem("orders")) || {};

      const updatedOrders = {
        ...allOrders,
        [cafeId]: remainingIds,
      };

      localStorage.setItem("orders", JSON.stringify(updatedOrders));

    }, 10000);

    return () => clearTimeout(timer);
  }, [orders]);

  const getStatusUI = (status) => {
    const s = (status || "").toLowerCase();

    if (s === "completed") return "bg-green-500";
    if (s === "preparing") return "bg-yellow-500 animate-pulse";

    return "bg-gray-400";
  };

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <div className="max-w-xl mx-auto">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-2xl font-bold">🧾 Your Orders</h1>

          <button
            onClick={() =>
              navigate(`/?cafe=${cafeId}&table=${tableNumber}`)
            }
            className="bg-black text-white px-4 py-2 rounded-full shadow"
          >
            ← Menu
          </button>
        </div>

        {orders.length === 0 ? (
          <EmptyState
            title="No Active Orders"
            subtitle="Place your order from the menu 🍽️"
          />
        ) : (
          orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-2xl shadow p-5 mb-5"
            >
              <p className="text-sm text-gray-500 mb-2">
                Order ID: #{order._id.slice(-6)}
              </p>

              {order.items.map((item, i) => {
                const extras =
                  item.selectedOptions?.reduce(
                    (s, o) => s + o.price,
                    0
                  ) || 0;

                const itemTotal =
                  (item.price + extras) * item.qty;

                return (
                  <div key={i} className="mb-2">
                    <div className="flex justify-between">
                      <span>
                        {item.name} x {item.qty}
                      </span>
                      <span>₹{itemTotal}</span>
                    </div>

                    {item.selectedOptions?.map((opt, idx) => (
                      <p
                        key={idx}
                        className="text-sm text-gray-500 ml-2"
                      >
                        + {opt.name} (₹{opt.price})
                      </p>
                    ))}
                  </div>
                );
              })}

              <div className="flex justify-between font-bold mt-3">
                <span>Total</span>
                <span>₹{order.total}</span>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span
                  className={`px-4 py-1 rounded-full text-white text-sm ${getStatusUI(
                    order.status
                  )}`}
                >
                  {order.status || "pending"}
                </span>

                {(order.status || "").toLowerCase() === "completed" && (
                  <span className="text-green-600 text-sm font-medium">
                    ✅ Ready!
                  </span>
                )}

                {(order.status || "").toLowerCase() === "preparing" && (
                  <span className="text-yellow-600 text-sm">
                    👨‍🍳 Cooking...
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderStatus;