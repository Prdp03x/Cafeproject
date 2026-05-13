import { useCallback, useEffect, useRef, useState } from "react";
import API from "../api/api";
import notificationSound from "../assets/notification.mp3";

const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [newOrderIds, setNewOrderIds] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const prevCountRef = useRef(0);
  const hasFetchedInitialOrdersRef = useRef(false);
  const audioRef = useRef(null);

  // INITIALIZE AUDIO
  useEffect(() => {
    audioRef.current = new Audio(notificationSound);
    audioRef.current.preload = "auto";
    audioRef.current.volume = 1;

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  // ENABLE AUDIO AFTER USER INTERACTION
  const enableAudio = useCallback(async () => {
    try {
      if (!audioRef.current || audioEnabled) return;

      audioRef.current.muted = true;

      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        await playPromise;
      }

      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.muted = false;

      setAudioEnabled(true);
    } catch (err) {
      console.error("Enable audio failed:", err);
    }
  }, [audioEnabled]);

  // PLAY SOUND
  const playSound = useCallback(async () => {
    try {
      if (!audioRef.current || !audioEnabled) return;

      audioRef.current.currentTime = 0;

      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        await playPromise;
      }
    } catch (err) {
      console.error("Play failed:", err);
    }
  }, [audioEnabled]);

  const registerNewOrderIds = useCallback((orderIds) => {
    if (orderIds.length === 0) return;

    setNewOrderIds((prevIds) => {
      const seen = new Set(prevIds);
      const nextIds = [...prevIds];

      for (const orderId of orderIds) {
        if (!seen.has(orderId)) {
          seen.add(orderId);
          nextIds.push(orderId);
        }
      }

      return nextIds;
    });
  }, []);

  // FETCH ORDERS
  const fetchOrders = useCallback(async () => {
    try {
      const res = await API.get("/orders/admin");

      const newOrders = Array.isArray(res.data) ? res.data : [];
      const previousCount = prevCountRef.current;
      const hasNewOrders =
        hasFetchedInitialOrdersRef.current &&
        newOrders.length > previousCount;

      if (hasNewOrders) {
        const diff = newOrders.length - previousCount;
        const newItems = newOrders.slice(0, diff);

        registerNewOrderIds(newItems.map((order) => order._id));
        void playSound();
      }

      prevCountRef.current = newOrders.length;
      hasFetchedInitialOrdersRef.current = true;
      setOrders(newOrders);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }, [playSound, registerNewOrderIds]);

  const addIncomingOrder = useCallback(
    (order) => {
      if (!order?._id) return;

      setOrders((prevOrders) => {
        const alreadyExists = prevOrders.some(
          (existingOrder) => existingOrder._id === order._id,
        );

        if (alreadyExists) {
          return prevOrders.map((existingOrder) =>
            existingOrder._id === order._id ? order : existingOrder,
          );
        }

        const nextOrders = [order, ...prevOrders];
        prevCountRef.current = nextOrders.length;
        return nextOrders;
      });

      registerNewOrderIds([order._id]);
      void playSound();
    },
    [playSound, registerNewOrderIds],
  );

  const updateOrder = useCallback((updatedOrder) => {
    if (!updatedOrder?._id) return;

    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order._id === updatedOrder._id ? updatedOrder : order,
      ),
    );
  }, []);

  const removeOrder = useCallback((orderId) => {
    if (!orderId) return;

    setOrders((prevOrders) => {
      const nextOrders = prevOrders.filter((order) => order._id !== orderId);
      prevCountRef.current = nextOrders.length;
      return nextOrders;
    });

    setNewOrderIds((prevIds) =>
      prevIds.filter((existingId) => existingId !== orderId),
    );
  }, []);

  // POLLING
  useEffect(() => {
    void fetchOrders();

    const interval = setInterval(
      fetchOrders,
      3000
    );

    return () => clearInterval(interval);
  }, [fetchOrders]);

  // NEW ORDER HIGHLIGHT
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
    playSound,
    enableAudio,
    addIncomingOrder,
    updateOrder,
    removeOrder,
  };
};

export default useOrders;
