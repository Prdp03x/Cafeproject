import { io } from "socket.io-client";

const socketUrl =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.DEV ? "http://localhost:5000" : undefined);

const socket = io(socketUrl, {
  transports: ["websocket", "polling"],
});

export default socket;

// console.log("SOCKET URL:", import.meta.env.VITE_SOCKET_URL);
