import { io } from "socket.io-client";

const trimTrailingSlash = (value) => value?.replace(/\/+$/, "");

const resolveSocketUrl = () => {
  const envSocketUrl = trimTrailingSlash(import.meta.env.VITE_SOCKET_URL);

  if (envSocketUrl) {
    return envSocketUrl;
  }

  if (import.meta.env.DEV) {
    return "http://localhost:5000";
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return undefined;
};

const socket = io(resolveSocketUrl(), {
  transports: ["websocket", "polling"],
});

export default socket;
