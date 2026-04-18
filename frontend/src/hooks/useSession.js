import { useEffect } from "react";

const useSession = () => {
  useEffect(() => {
    let sessionId = localStorage.getItem("sessionId");

    if (!sessionId) {
      sessionId =
        Date.now() + "_" + Math.random().toString(36).substring(2);
      localStorage.setItem("sessionId", sessionId);
    }
  }, []);

  return localStorage.getItem("sessionId");
};

export default useSession;