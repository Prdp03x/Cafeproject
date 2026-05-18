import { useCallback, useEffect, useState } from "react";
import API from "../api/api";
import AuthContext from "./auth-context";

const readStoredCafe = () => {
  try {
    const storedCafe = localStorage.getItem("cafe");
    return storedCafe ? JSON.parse(storedCafe) : null;
  } catch {
    localStorage.removeItem("cafe");
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [cafe, setCafe] = useState(readStoredCafe);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      if (!token) {
        if (isMounted) {
          setCafe(null);
          setIsReady(true);
        }
        return;
      }

      try {
        const res = await API.get("/auth/me");

        if (!isMounted) return;

        setCafe(res.data);
        localStorage.setItem("cafe", JSON.stringify(res.data));
      } catch {
        if (!isMounted) return;

        localStorage.removeItem("token");
        localStorage.removeItem("cafe");
        setToken(null);
        setCafe(null);
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    };

    setIsReady(false);
    void bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = useCallback((nextToken, nextCafe) => {
    localStorage.setItem("token", nextToken);
    localStorage.setItem("cafe", JSON.stringify(nextCafe));
    setToken(nextToken);
    setCafe(nextCafe);
    setIsReady(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("cafe");
    setToken(null);
    setCafe(null);
    setIsReady(true);
  }, []);

  const updateCafe = useCallback((nextCafe) => {
    if (nextCafe) {
      localStorage.setItem("cafe", JSON.stringify(nextCafe));
    } else {
      localStorage.removeItem("cafe");
    }

    setCafe(nextCafe || null);
  }, []);

  const refreshCafe = useCallback(async () => {
    if (!token) return null;

    const res = await API.get("/auth/me");
    updateCafe(res.data);
    return res.data;
  }, [token, updateCafe]);

  const authenticateWithToken = useCallback(async (nextToken) => {
    const res = await API.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${nextToken}`,
      },
    });

    login(nextToken, res.data);
    return res.data;
  }, [login]);

  return (
    <AuthContext.Provider
      value={{
        token,
        cafe,
        isReady,
        isAuthenticated: Boolean(token),
        login,
        logout,
        updateCafe,
        refreshCafe,
        authenticateWithToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
