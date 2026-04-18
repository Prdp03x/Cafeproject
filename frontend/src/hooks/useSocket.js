import { useEffect } from "react";
import socket from "../socket";

const useSocket = (cafeId) => {
  useEffect(() => {
    if (!cafeId) return;

    socket.emit("joinCafe", cafeId);
  }, [cafeId]);
};

export default useSocket;