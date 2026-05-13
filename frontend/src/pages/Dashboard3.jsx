import { useEffect, useState } from "react";
import useOrders from "../hooks/useOrders";
import API from "../api/api";
import OrderCard from "../components/Dashboard/OrderCard";
import LogoutBtn from "../components/Common/LogoutBtn";
import StatCard from "../components/Dashboard/StatCard";
import socket from "../socket";
import { useNavigate } from "react-router";
import {
  FaEdit,
  FaCog,
  FaSignOutAlt,
  FaClipboardList,
  FaBars,
} from "react-icons/fa";
import { toast } from "react-toastify";

const Dashboard = () => {
  const { orders, setOrders, newOrderIds, fetchOrders } = useOrders();
  const navigate = useNavigate();
  const [loadingActions, setLoadingActions] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [cafe, setCafe] = useState(() =>
    JSON.parse(localStorage.getItem("cafe") || "null"),
  );

  useEffect(() => {
    document.title = "Dashboard | Kitchen";

    const loadCafe = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      if (cafe) return;

      try {
        const res = await API.get("/auth/me");
        localStorage.setItem("cafe", JSON.stringify(res.data));
        setCafe(res.data);
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("cafe");
        navigate("/login");
      }
    };

    loadCafe();
  }, [cafe, navigate]);

  useEffect(() => {
    if (!cafe?.id) return;

    socket.emit("joinCafe", cafe.id);

    socket.on("newOrder", (order) => {
      setOrders((prev) => [order, ...prev]);
    });
    socket.on("orderUpdated", (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o)),
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

  const setActionLoading = (id, action, isLoading) => {
    const key = `${id}:${action}`;

    setLoadingActions((prev) => {
      if (isLoading) return { ...prev, [key]: true };

      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const isOrderBusy = (id) =>
    Object.keys(loadingActions).some((key) => key.startsWith(`${id}:`));

  const updateStatus = async (id, status) => {
    if (isOrderBusy(id)) return;

    setActionLoading(id, status, true);

    try {
      await API.put(`/orders/${id}`, { status });
      toast.success(`Order marked as ${status}`);
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update order status");
    } finally {
      setActionLoading(id, status, false);
    }
  };

  const deleteOrder = async (id) => {
    if (isOrderBusy(id)) return;

    setActionLoading(id, "delete", true);

    try {
      await API.delete(`/orders/${id}`);
      toast.success("Order deleted");
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete order");
    } finally {
      setActionLoading(id, "delete", false);
    }
  };

  // console.log("Cafe from token:", req.cafeId);

  // return (
  //   <div className="min-h-screen bg-gray-100">
  //     {/* 🔝 Top Bar */}
  //     <div className="bg-white border-b px-4 md:px-6 py-4 flex flex-col md:flex-row gap-4 md:gap-0 justify-between md:items-center">
  //       <div className="flex gap-2 items-start">
  //         <div className="h-12 w-12 rounded-2xl overflow-hidden bg-gray-100 shadow-sm flex items-center justify-center">
  //           {cafe?.logo ? (
  //             <img
  //               src={cafe.logo}
  //               alt="Cafe Logo"
  //               className="w-full h-full object-cover"
  //             />
  //           ) : (
  //             <div className="w-full h-full bg-green-800 text-white flex items-center justify-center font-semibold text-lg">
  //               {cafe?.name?.charAt(0) || "C"}
  //             </div>
  //           )}
  //         </div>
  //         <div>
  //           <h1 className="text-xl font-semibold tracking-tight">
  //             {cafe?.name || "Cafe"}
  //           </h1>
  //           <p className="text-sm text-gray-500">Kitchen Dashboard</p>
  //         </div>
  //       </div>

  //       <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
  //         <button
  //           onClick={() => navigate("/dashboard/menu")}
  //           className="flex-1 md:flex-none bg-black text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition"
  //         >
  //           <FaEdit className="text-md" />

  //           <span className="md:inline text-sm font-medium">Menu</span>
  //         </button>

  //         <button
  //           onClick={() => navigate("/settings")}
  //           className="flex-1 md:flex-none bg-gray-200 px-4 py-3 rounded-xl"
  //         >
  //           Settings
  //         </button>
  //         <LogoutBtn />
  //       </div>
  //     </div>

  //     <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
  //       {/* 📊 Stats Row */}
  //       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  //         <StatCard title="Total Orders" value={orders.length} />

  //         <StatCard
  //           title="Pending"
  //           value={orders.filter((o) => o.status === "pending").length}
  //           color="yellow"
  //         />

  //         <StatCard
  //           title="Completed"
  //           value={orders.filter((o) => o.status === "completed").length}
  //           color="green"
  //         />

  //         <StatCard
  //           title="Cancelled"
  //           value={orders.filter((o) => o.status === "cancelled").length}
  //           color="red"
  //         />
  //       </div>

  //       {/* 🧾 Orders Section */}
  //       <div className="bg-white rounded-2xl border p-5 shadow-sm">
  //         <div className="flex justify-between items-center mb-4">
  //           <h2 className="text-lg font-semibold">Live Orders</h2>
  //           <span className="text-sm text-gray-400">Auto-updating</span>
  //         </div>

  //         {orders.length === 0 ? (
  //           <div className="py-16 text-center text-gray-400">
  //             No active orders
  //           </div>
  //         ) : (
  //           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
  //             {orders.map((order) => (
  //               <OrderCard
  //                 key={order._id}
  //                 order={order}
  //                 isNew={newOrderIds.includes(order._id)}
  //                 updateStatus={updateStatus}
  //                 deleteOrder={deleteOrder}
  //                 loadingActions={loadingActions}
  //               />
  //             ))}
  //           </div>
  //         )}
  //       </div>
  //     </div>
  //   </div>
  // );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
        fixed md:static top-0 left-0 h-screen w-72 bg-white border-r z-50
        transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        <div className="h-full flex flex-col">
          {/* CAFE INFO */}
          <div className="p-5 border-b bg-gray-50">
            <div className="flex items-center gap-4">
              {/* LOGO */}
              <div className="h-14 w-14 rounded-2xl overflow-hidden border bg-gray-100">
                {cafe?.logo ? (
                  <img
                    src={cafe.logo}
                    alt="Cafe Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-green-800 text-white flex items-center justify-center font-bold text-xl">
                    {cafe?.name?.charAt(0) || "C"}
                  </div>
                )}
              </div>

              {/* NAME */}
              <div>
                <h2 className="font-bold text-lg">{cafe?.name || "Cafe"}</h2>

                <p className="text-xs text-gray-500">
                  {cafe?.category || "Cafe"}
                </p>
              </div>
            </div>

            {/* DESCRIPTION */}
            {cafe?.description && (
              <p className="text-sm text-gray-600 mt-4 leading-relaxed">
                {cafe.description}
              </p>
            )}

            {/* ADDRESS */}
            {cafe?.address && (
              <div className="mt-3 text-sm text-gray-500">
                📍 {cafe.address}
              </div>
            )}
          </div>

          {/* NAVIGATION */}
          <div className="flex-1 p-4 space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-black text-white">
              <FaClipboardList />
              Dashboard
            </button>

            <button
              onClick={() => navigate("/dashboard/menu")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-100 transition"
            >
              <FaEdit />
              Menu Management
            </button>

            <button
              onClick={() => navigate("/settings")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-100 transition"
            >
              <FaCog />
              Settings
            </button>
          </div>

          {/* LOGOUT */}
          <div className="p-4 border-t">
            <LogoutBtn />
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER */}
        <header className="bg-white border-b px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* LEFT */}
            <div className="flex items-center gap-4">
              {/* MOBILE MENU */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden h-11 w-11 rounded-xl border flex items-center justify-center"
              >
                <FaBars />
              </button>

              {/* HEADER LOGO */}
              <div className="h-12 w-12 rounded-2xl overflow-hidden border bg-gray-100">
                {cafe?.logo ? (
                  <img
                    src={cafe.logo}
                    alt="Cafe Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-green-800 text-white flex items-center justify-center font-semibold text-lg">
                    {cafe?.name?.charAt(0) || "C"}
                  </div>
                )}
              </div>

              {/* TITLE */}
              <div>
                <h1 className="text-xl font-bold">{cafe?.name || "Cafe"}</h1>

                <p className="text-sm text-gray-500">Dashboard</p>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 p-4 md:p-6">
          {/* STATS */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
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

          {/* ORDERS */}
          <div className="bg-white rounded-3xl border shadow-sm p-5">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-xl font-bold">Live Orders</h2>

                <p className="text-sm text-gray-500 mt-1">
                  Auto updating orders
                </p>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="py-20 text-center text-gray-400">
                No active orders
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                {orders.map((order) => (
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
