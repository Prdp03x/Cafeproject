import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import API from "../../../api/api";
import { todayISO } from "./billingUtils.js";

const useBilling = () => {
  const todayDT = () => `${todayISO()}T00:00`;
  const nowDT = () => {
    const now = new Date();
    return `${todayISO()}T${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  };
  const [fromDT, setFromDT] = useState(todayDT());
  const [toDT, setToDT] = useState(nowDT());
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchBilling = useCallback(async (selectedFrom, selectedTo) => {
    setLoading(true);
    try {
      const res = await API.get(
        `/orders/billing?from=${selectedFrom}&to=${selectedTo}`,
      );
      setOrders(res.data.orders || []);
      setSummary(res.data.summary || null);
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Failed to load billing data",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBilling(fromDT, toDT);
  }, [fromDT, toDT, fetchBilling]);

  const requestCancel = useCallback((bill) => setCancelTarget(bill), []);

  const confirmCancel = async ({ reason, note }) => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await API.put(`/orders/${cancelTarget._id}`, {
        status: "cancelled",
        cancelReason: reason,
        cancelNote: note || null,
      });
      toast.success("Order cancelled successfully");
      setCancelTarget(null);
      setSelectedBill((prev) =>
        prev?._id === cancelTarget._id
          ? {
              ...prev,
              status: "cancelled",
              cancelReason: reason,
              cancelNote: note || null,
              cancelledAt: new Date().toISOString(),
            }
          : prev,
      );
      await fetchBilling(date);
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  return {
    fromDT,
    setFromDT,
    toDT,
    setToDT,
    orders,
    summary,
    loading,
    selectedBill,
    setSelectedBill,
    cancelTarget,
    setCancelTarget,
    cancelling,
    statusFilter,
    setStatusFilter,
    filteredOrders,
    requestCancel,
    confirmCancel,
  };
};

export default useBilling;
