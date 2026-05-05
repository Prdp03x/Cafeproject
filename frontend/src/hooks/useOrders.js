import { useCallback, useEffect, useRef, useState } from "react";
import API from "../api/api";
import notificationSound from "../assets/notification.mp3";


const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [newOrderIds, setNewOrderIds] = useState([]);

  const prevCountRef = useRef(0);

  // 🔊 sound unlock
 const audioRef = useRef(null);

useEffect(() => {
  audioRef.current = new Audio(notificationSound);

  const unlockAudio = () => {
    audioRef.current.play().then(() => {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }).catch(() => {});
  };

  document.addEventListener("click", unlockAudio, { once: true });

  return () => {
    document.removeEventListener("click", unlockAudio);
  };
}, []);

const playSound = () => {
  if (audioRef.current) {
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  }
};
  const fetchOrders = useCallback(async () => {
    try {
      const res = await API.get("/orders/admin");

      const newOrders = Array.isArray(res.data) ? res.data : [];

      if (newOrders.length > prevCountRef.current) {
        playSound();

        const diff = newOrders.length - prevCountRef.current;
        const newItems = newOrders.slice(0, diff);

        setNewOrderIds(newItems.map((o) => o._id));
      }

      prevCountRef.current = newOrders.length;
      setOrders(newOrders);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

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
