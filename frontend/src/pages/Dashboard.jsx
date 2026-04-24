import { useEffect } from "react";
import useOrders from "../hooks/useOrders";
import API from "../api/api";
import OrderCard from "../components/Dashboard/OrderCard";
import LogoutBtn from "../components/Common/LogoutBtn";
import StatCard from "../components/Dashboard/StatCard";
import socket from "../socket";
import { useNavigate } from "react-router";
import { FaEdit } from 'react-icons/fa'

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

  // console.log("Token:", localStorage.getItem("token"));

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 🔝 Top Bar */}
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {cafe?.name || "Cafe"}
          </h1>
          <p className="text-sm text-gray-500">Kitchen Dashboard</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard/menu")}
            className="bg-black text-white p-3 rounded-lg md:rounded-lg flex items-center justify-center gap-2 md:px-4 md:py-2 hover:opacity-90 transition"
          >
            <FaEdit className="text-md" />

            <span className="md:inline text-sm font-medium">Menu</span>
          </button>

          <LogoutBtn />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* 📊 Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Total Orders" value={orders.length} />

          <StatCard
            title="Pending"
            value={orders.filter((o) => o.status === "pending").length}
            color="yellow"
          />

          <StatCard
            title="Completed"
            value={orders.filter((o) => o.status === "completed").length}
            color="green"
          />

          <StatCard
            title="Cancelled"
            value={orders.filter((o) => o.status === "cancelled").length}
            color="red"
          />
        </div>

        {/* 🧾 Orders Section */}
        <div className="bg-white rounded-2xl border p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Live Orders</h2>
            <span className="text-sm text-gray-400">Auto-updating</span>
          </div>

          {orders.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              No active orders
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
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
    </div>
  );
};

export default Dashboard;
