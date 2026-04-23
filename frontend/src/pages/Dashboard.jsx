import { useEffect } from "react";
import useOrders from "../hooks/useOrders";
import API from "../api/api";
import OrderCard from "../components/Dashboard/OrderCard";
import LogoutBtn from "../components/Common/LogoutBtn";
import StatCard from "../components/Dashboard/StatCard";
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
          className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:opacity-90 transition"
        >
          Manage Menu
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
          value={orders.filter(o => o.status === "pending").length}
          color="yellow"
        />

        <StatCard
          title="Completed"
          value={orders.filter(o => o.status === "completed").length}
          color="green"
        />

        <StatCard
          title="Cancelled"
          value={orders.filter(o => o.status === "cancelled").length}
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
            {orders.map(order => (
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


    // <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 px-4 py-6">
    //   <div className="max-w-7xl mx-auto space-y-6">
    //     {/* 🔝 Header */}
    //     <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border">
    //       <div>
    //         <h2 className="text-2xl font-bold tracking-tight">
    //           ☕ {cafe?.name || "Cafe"}
    //         </h2>
    //         <p className="text-sm text-gray-500">{cafe?.email}</p>
    //       </div>

    //       <div className="flex items-center gap-3">
    //         <button
    //           onClick={() => navigate("/dashboard/menu")}
    //           className="bg-black text-white px-4 py-2 rounded-xl shadow hover:scale-105 transition"
    //         >
    //           Manage Menu
    //         </button>

    //         <LogoutBtn />
    //       </div>
    //     </div>

    //     {/* 📊 Stats */}
    //     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    //       <div className="bg-white rounded-2xl p-4 shadow border hover:shadow-md transition">
    //         <p className="text-sm text-gray-500">Total Orders</p>
    //         <h3 className="text-2xl font-bold mt-1">{orders.length}</h3>
    //       </div>

    //       <div className="bg-yellow-50 rounded-2xl p-4 shadow border border-yellow-200">
    //         <p className="text-sm text-yellow-700">Pending</p>
    //         <h3 className="text-2xl font-bold text-yellow-800 mt-1">
    //           {orders.filter((o) => o.status === "pending").length}
    //         </h3>
    //       </div>

    //       <div className="bg-green-50 rounded-2xl p-4 shadow border border-green-200">
    //         <p className="text-sm text-green-700">Completed</p>
    //         <h3 className="text-2xl font-bold text-green-800 mt-1">
    //           {orders.filter((o) => o.status === "completed").length}
    //         </h3>
    //       </div>

    //       <div className="bg-red-50 rounded-2xl p-4 shadow border border-red-200">
    //         <p className="text-sm text-red-700">Cancelled</p>
    //         <h3 className="text-2xl font-bold text-red-800 mt-1">
    //           {orders.filter((o) => o.status === "cancelled").length}
    //         </h3>
    //       </div>
    //     </div>

    //     {/* 🧾 Section Title */}
    //     <div className="flex justify-between items-center">
    //       <h1 className="text-2xl font-semibold tracking-tight">
    //         Kitchen Orders
    //       </h1>
    //       <p className="text-sm text-gray-500">Live updates ⚡</p>
    //     </div>

    //     {/* 📦 Orders */}
    //     {orders.length === 0 ? (
    //       <div className="bg-white rounded-2xl p-12 text-center shadow border">
    //         <p className="text-gray-400 text-xl">No orders yet 🍽️</p>
    //         <p className="text-sm text-gray-400 mt-2">
    //           Orders will appear here in real-time
    //         </p>
    //       </div>
    //     ) : (
    //       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
    //         {orders.map((order) => (
    //           <OrderCard
    //             key={order._id}
    //             order={order}
    //             isNew={newOrderIds.includes(order._id)}
    //             updateStatus={updateStatus}
    //             deleteOrder={deleteOrder}
    //           />
    //         ))}
    //       </div>
    //     )}
    //   </div>
    // </div>
