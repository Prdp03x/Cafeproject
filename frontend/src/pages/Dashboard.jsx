import { useEffect } from "react";
import useOrders from "../hooks/useOrders";
import API from "../api/api";
import OrderCard from "../components/Dashboard/OrderCard";
import LogoutBtn from "../components/Common/LogoutBtn";
import socket from "../socket";
import { useNavigate } from "react-router";

const Dashboard = () => {
  const { orders, setOrders, newOrderIds, fetchOrders } = useOrders();
  const navigate = useNavigate();

  const cafe = JSON.parse(localStorage.getItem("cafe") || "null");

  useEffect(() => {
    document.title = "Dashboard | Kitchen";
    if (!cafe) window.location.href = "/login";
  }, [cafe]);

  useEffect(() => {
    if (!cafe?.id) return;

    socket.emit("joinCafe", cafe.id);

    socket.on("newOrder", (order) => {
      setOrders((prev) => [order, ...prev]);
    });

    socket.on("orderUpdated", ({ id, status }) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status } : o)),
      );
    });

    socket.on("orderDeleted", (id) => {
      setOrders((prev) => prev.filter((o) => o._id !== id));
    });

    return () => {
      socket.off("newOrder");
      socket.off("orderUpdated");
      socket.off("orderDeleted");
    };
  }, [cafe, setOrders]);

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
    <div className="min-h-screen bg-gray-100 px-4 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 🔝 Top Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          {/* Cafe Info */}
          <div>
            <h2 className="text-2xl font-semibold">
              ☕ {cafe?.name || "Cafe"}
            </h2>
            <p className="text-sm text-gray-500">{cafe?.email}</p>
          </div>

          {/* Logout */}
          <LogoutBtn />
        </div>

        <button
          onClick={() => navigate("/dashboard/menu")}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Manage Menu
        </button>

        {/* 📊 Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border">
            <p className="text-sm text-gray-500">Total Orders</p>
            <h3 className="text-2xl font-bold">{orders.length}</h3>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border">
            <p className="text-sm text-gray-500">Pending</p>
            <h3 className="text-2xl font-bold">
              {orders.filter((o) => o.status === "pending").length}
            </h3>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border">
            <p className="text-sm text-gray-500">Completed</p>
            <h3 className="text-2xl font-bold">
              {orders.filter((o) => o.status === "completed").length}
            </h3>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border">
            <p className="text-sm text-gray-500">Cancelled</p>
            <h3 className="text-2xl font-bold">
              {orders.filter((o) => o.status === "cancelled").length}
            </h3>
          </div>
        </div>

        {/* 🧾 Section Title */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Kitchen Orders</h1>
        </div>

        {/* 📦 Orders */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm border">
            <p className="text-gray-400 text-lg">No orders yet 🍽️</p>
            <p className="text-sm text-gray-400 mt-2">
              Orders will appear here in real-time
            </p>
          </div>
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
