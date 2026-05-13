import { useEffect, useState } from "react";
import useOrders from "../hooks/useOrders";
import API from "../api/api";
import LogoutBtn from "../components/Common/LogoutBtn";
import OrdersSection from "../components/Dashboard/OrdersSection";
import MenuSection from "../components/Dashboard/MenuSection";
import SettingsSection from "../components/Dashboard/SettingsSection";
import socket from "../socket";
import { useNavigate } from "react-router";
import { FaBars, FaClipboardList, FaCog, FaEdit } from "react-icons/fa";
import { FiMapPin, FiRadio, FiVolume2 } from "react-icons/fi";
import { toast } from "react-toastify";

const viewConfig = {
  orders: {
    label: "Orders",
    title: "Orders command center",
    description: "Monitor live tickets, track service flow, and keep kitchen actions moving.",
  },
  menu: {
    label: "Menu",
    title: "Menu management",
    description: "Keep your catalog polished, consistent, and easy to maintain.",
  },
  settings: {
    label: "Settings",
    title: "Cafe settings",
    description: "Control your brand details, business information, and account security.",
  },
};

const navItems = [
  {
    key: "orders",
    label: "Orders",
    description: "Realtime service",
    icon: FaClipboardList,
  },
  {
    key: "menu",
    label: "Menu",
    description: "Items and pricing",
    icon: FaEdit,
  },
  {
    key: "settings",
    label: "Settings",
    description: "Brand and account",
    icon: FaCog,
  },
];

const DashboardNavButton = ({ active, description, icon, label, onClick }) => {
  const NavIcon = icon;

  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-[22px] px-4 py-3 text-left transition ${
        active
          ? "bg-slate-900 text-white shadow-[0_16px_36px_rgba(15,23,42,0.18)]"
          : "text-slate-700 hover:bg-stone-100"
      }`}
    >
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
          active ? "bg-white/12 text-white" : "bg-white text-slate-700 shadow-sm"
        }`}
      >
        <NavIcon size={16} />
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold">{label}</p>
        <p
          className={`text-xs ${
            active ? "text-white/70" : "text-slate-500 group-hover:text-slate-600"
          }`}
        >
          {description}
        </p>
      </div>
    </button>
  );
};

const Dashboard = () => {
  const {
    orders,
    newOrderIds,
    fetchOrders,
    enableAudio,
    addIncomingOrder,
    updateOrder,
    removeOrder,
  } = useOrders();
  const navigate = useNavigate();
  const [loadingActions, setLoadingActions] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("orders");

  const [cafe, setCafe] = useState(() =>
    JSON.parse(localStorage.getItem("cafe") || "null"),
  );

  const updateCafeData = (updatedCafe) => {
    setCafe(updatedCafe);
    localStorage.setItem("cafe", JSON.stringify(updatedCafe));
  };

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

    const handleNewOrder = (order) => {
      addIncomingOrder(order);
    };

    const handleOrderUpdated = (updatedOrder) => {
      updateOrder(updatedOrder);
    };

    const handleOrderDeleted = (id) => {
      removeOrder(id);
    };

    socket.on("newOrder", handleNewOrder);
    socket.on("orderUpdated", handleOrderUpdated);
    socket.on("orderDeleted", handleOrderDeleted);

    return () => {
      socket.off("newOrder", handleNewOrder);
      socket.off("orderUpdated", handleOrderUpdated);
      socket.off("orderDeleted", handleOrderDeleted);
    };
  }, [addIncomingOrder, cafe?.id, removeOrder, updateOrder]);

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

  const pendingCount = orders.filter((order) => order.status === "pending").length;
  const liveCount = orders.filter((order) => order.status !== "completed").length;
  const currentView = viewConfig[activePage];
  const cafeInitial = cafe?.name?.charAt(0)?.toUpperCase() || "C";

  return (
    <div
      onClick={enableAudio}
      className="min-h-screen bg-[#f4efe6] text-slate-900"
    >
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-12%] top-[-10%] h-64 w-64 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="absolute right-[-8%] top-[12%] h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[22%] h-80 w-80 rounded-full bg-stone-300/35 blur-3xl" />
      </div>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm md:hidden"
        />
      )}

      <div className="flex min-h-screen">
        <aside
          className={`fixed left-0 top-0 z-50 h-screen w-[88vw] max-w-[340px] transform transition-transform duration-300 md:w-[320px] md:max-w-none md:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col gap-4 overflow-y-auto p-4 scrollbar-hide md:p-5">
            <div className="rounded-[30px] border border-white/70 bg-white/82 p-5 shadow-[0_28px_80px_rgba(15,23,42,0.08)] backdrop-blur">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-[22px] bg-stone-100 shadow-inner ring-1 ring-black/5">
                  {cafe?.logo ? (
                    <img
                      src={cafe.logo}
                      alt="Cafe Logo"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-900 text-xl font-bold text-white">
                      {cafeInitial}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Cafe profile
                  </p>
                  <h2 className="mt-2 truncate text-xl font-semibold text-slate-900">
                    {cafe?.name || "Cafe"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {cafe?.category || "Cafe"} operations dashboard
                  </p>
                </div>
              </div>

              {cafe?.description ? (
                <p className="mt-5 text-sm leading-6 text-slate-600">
                  {cafe.description}
                </p>
              ) : (
                <p className="mt-5 text-sm leading-6 text-slate-500">
                  Manage orders, menu items, and business settings from one place.
                </p>
              )}

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-stone-100 px-3 py-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    Live
                  </p>
                  <p className="mt-1 text-xl font-semibold text-slate-900">
                    {liveCount}
                  </p>
                </div>
                <div className="rounded-2xl bg-amber-50 px-3 py-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-amber-700">
                    Pending
                  </p>
                  <p className="mt-1 text-xl font-semibold text-amber-900">
                    {pendingCount}
                  </p>
                </div>
              </div>

              {cafe?.address ? (
                <div className="mt-5 flex items-start gap-2 rounded-2xl border border-stone-200 bg-stone-50 px-3 py-3 text-sm text-slate-600">
                  <FiMapPin className="mt-0.5 shrink-0 text-slate-400" />
                  <span>{cafe.address}</span>
                </div>
              ) : null}
            </div>

            <div className="rounded-[30px] border border-white/70 bg-white/82 p-3 shadow-[0_24px_70px_rgba(15,23,42,0.06)] backdrop-blur">
              <div className="px-2 pb-2 pt-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Workspace
                </p>
              </div>

              <div className="space-y-2">
                {navItems.map((item) => (
                  <DashboardNavButton
                    key={item.key}
                    active={activePage === item.key}
                    description={item.description}
                    icon={item.icon}
                    label={item.label}
                    onClick={() => {
                      setActivePage(item.key);
                      setSidebarOpen(false);
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-auto rounded-[30px] border border-white/70 bg-white/82 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.06)] backdrop-blur">
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <FiRadio className="text-emerald-600" />
                    Live sync
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    Active
                  </p>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <FiVolume2 className="text-slate-700" />
                    Audio
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    Tap to enable
                  </p>
                </div>
              </div>

              <LogoutBtn className="w-full justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800" />
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col md:ml-[320px]">
          <header className="sticky top-0 z-30 px-4 pb-2 pt-4 sm:px-6 lg:px-8">
            <div className="rounded-[30px] border border-white/75 bg-white/70 px-4 py-4 shadow-[0_24px_70px_rgba(15,23,42,0.07)] backdrop-blur sm:px-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-start gap-3 sm:gap-4">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-stone-200 bg-white text-slate-700 shadow-sm md:hidden"
                  >
                    <FaBars />
                  </button>

                  <div className="hidden h-12 w-12 overflow-hidden rounded-[18px] bg-stone-100 shadow-inner ring-1 ring-black/5 sm:block">
                    {cafe?.logo ? (
                      <img
                        src={cafe.logo}
                        alt="Cafe Logo"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-900 text-lg font-semibold text-white">
                        {cafeInitial}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                      {currentView.label}
                    </p>
                    <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-[28px]">
                      {currentView.title}
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                      {currentView.description}
                    </p>
                  </div>
                </div>

                <div className="hidden sm:grid grid-cols-1 gap-3 sm:grid-cols-3 xl:min-w-[420px]">
                  <div className="rounded-[24px] border border-stone-200 bg-stone-50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Active orders
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                      {liveCount}
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                      Needs action
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-amber-900">
                      {pendingCount}
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                      Service sync
                    </p>
                    <p className="mt-2 text-sm font-semibold text-emerald-900">
                      Realtime connected
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 pb-8 pt-4 sm:px-6 lg:px-8">
            {activePage === "orders" && (
              <OrdersSection
                orders={orders}
                newOrderIds={newOrderIds}
                updateStatus={updateStatus}
                deleteOrder={deleteOrder}
                loadingActions={loadingActions}
              />
            )}

            {activePage === "menu" && <MenuSection />}

            {activePage === "settings" && (
              <SettingsSection updateCafeData={updateCafeData} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
