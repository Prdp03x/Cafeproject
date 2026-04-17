import { useEffect, useRef, useState } from "react";
import API from "../api/api";
import notificationSound from "../assets/notification.mp3";

const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [newOrderIds, setNewOrderIds] = useState([]);

  const prevCountRef = useRef(0);

  // 🔊 sound unlock
  useEffect(() => {
    const enableSound = () => {
      const audio = new Audio(notificationSound);
      audio.play().catch(() => {});
    };

    document.addEventListener("click", enableSound, { once: true });
  }, []);

  const playSound = () => {
    const audio = new Audio(notificationSound);
    audio.play().catch(() => {});
  };

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders/admin"); // only orders is there before
      const newOrders = res.data;

      if (newOrders.length > prevCountRef.current) {
        playSound();

        const diff = newOrders.length - prevCountRef.current;
        const newItems = newOrders.slice(0, diff);

        setNewOrderIds(newItems.map((o) => o._id));
      }

      prevCountRef.current = newOrders.length;
      setOrders(newOrders);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (newOrderIds.length === 0) return;

    const timer = setTimeout(() => {
      setNewOrderIds([]);
    }, 5000);

    return () => clearTimeout(timer);
  }, [newOrderIds]);

  return {
    orders,
    setOrders,
    newOrderIds,
    fetchOrders,
  };
};

export default useOrders;