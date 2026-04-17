import { useEffect } from "react";
import useOrders from "../hooks/useOrders";
import API from "../api/api";
import OrderCard from "../components/Dashboard/OrderCard";
import LogoutBtn from "../components/common/LogoutBtn";
import socket from "../socket";
const cafe = JSON.parse(localStorage.getItem("cafe"));

const Dashboard = () => {
  const { orders, setOrders, newOrderIds, fetchOrders } = useOrders();

  useEffect(() => {
    document.title = "Dashboard | Kitchen";
  }, []);

  useEffect(() => {
    const cafe = JSON.parse(localStorage.getItem("cafe"));

    if (cafe?.id) {
      socket.emit("joinCafe", cafe.id);
    }

    // ✅ NEW ORDER
    socket.on("newOrder", (order) => {
      setOrders((prev) => [order, ...prev]);
    });

    // ✅ UPDATE ORDER
    socket.on("orderUpdated", ({ id, status }) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status } : o)),
      );
    });

    // ✅ DELETE ORDER
    socket.on("orderDeleted", (id) => {
      setOrders((prev) => prev.filter((o) => o._id !== id));
    });

    return () => {
      socket.off("newOrder");
      socket.off("orderUpdated");
      socket.off("orderDeleted");
    };
  }, []);

  const updateStatus = async (id, status) => {
    await API.put(`/orders/${id}`, { status });
    fetchOrders();
  };

  const deleteOrder = async (id) => {
    try {
      await API.delete(`/orders/${id}`);

      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-5 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Cafes Identity */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold">☕ {cafe?.name || "Cafe"}</h2>
            <p className="text-sm text-gray-500">{cafe?.email}</p>
          </div>

          <LogoutBtn />
        </div>

        <h1 className="text-3xl font-bold mb-6">
          👨‍🍳 Kitchen Dashboard ({orders.length})
        </h1>

        {orders.length === 0 ? (
          <p className="text-gray-400">No orders yet</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                isNew={newOrderIds.includes(order._id)}
                updateStatus={updateStatus}
                deleteOrder={deleteOrder}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
