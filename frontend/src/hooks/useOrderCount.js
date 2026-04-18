import { useEffect, useState } from "react";
import API from "../api/api";
import socket from "../socket";

const useOrderCount = (cafeId, tableNumber) => {
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    if (!cafeId || !tableNumber) return;

    const updateCount = async () => {
      try {
        const sessionId = localStorage.getItem("sessionId");

        const res = await API.get(
          `/orders/customer?cafeId=${cafeId}&tableNumber=${tableNumber}&sessionId=${sessionId}`
        );

        setOrderCount(res.data.length);
      } catch (err) {
        console.log(err);
      }
    };

    updateCount();

    socket.on("newOrder", updateCount);
    socket.on("orderDeleted", updateCount);
    socket.on("orderUpdated", updateCount);

    return () => {
      socket.off("newOrder");
      socket.off("orderDeleted");
      socket.off("orderUpdated");
    };
  }, [cafeId, tableNumber]);

  return orderCount;
};

export default useOrderCount;