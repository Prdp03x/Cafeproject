import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import API from "../api/api";

const AuthContext = createContext();

const readStoredCafe = () => {
  try {
    const storedCafe = localStorage.getItem("cafe");

    return storedCafe ? JSON.parse(storedCafe) : null;
  } catch (error) {
    console.error("Failed to parse cafe:", error);

    localStorage.removeItem("cafe");

    return null;
  }
};

const saveCafe = (data) => {
  localStorage.setItem("cafe", JSON.stringify(data));
};

const clearStorage = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("cafe");
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return localStorage.getItem("token");
  });

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

        saveCafe(res.data);
      } catch (error) {
        console.error("Auth bootstrap failed:", error);

        if (!isMounted) return;

        clearStorage();

        setToken(null);
        setCafe(null);
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    };

    void bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = useCallback((nextToken, nextCafe) => {
    localStorage.setItem("token", nextToken);

    saveCafe(nextCafe);

    setToken(nextToken);
    setCafe(nextCafe);

    setIsReady(true);
  }, []);

  const logout = useCallback(() => {
    clearStorage();

    setToken(null);
    setCafe(null);

    setIsReady(true);
  }, []);

  const updateCafe = useCallback((nextCafe) => {
    if (nextCafe) {
      saveCafe(nextCafe);
    } else {
      localStorage.removeItem("cafe");
    }

    setCafe(nextCafe || null);
  }, []);

  const refreshCafe = useCallback(async () => {
    if (!token) return null;

    try {
      const res = await API.get("/auth/me");

      updateCafe(res.data);

      return res.data;
    } catch (error) {
      console.error("Failed to refresh cafe:", error);

      return null;
    }
  }, [token, updateCafe]);

  const authenticateWithToken = useCallback(
    async (nextToken) => {
      try {
        const res = await API.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${nextToken}`,
          },
        });

        login(nextToken, res.data);

        return res.data;
      } catch (error) {
        console.error("Token authentication failed:", error);

        clearStorage();

        setToken(null);
        setCafe(null);

        return null;
      }
    },
    [login]
  );

  const value = useMemo(() => {
    return {
      token,
      cafe,
      isReady,
      isAuthenticated: Boolean(token && cafe),

      login,
      logout,
      updateCafe,
      refreshCafe,
      authenticateWithToken,
    };
  }, [
    token,
    cafe,
    isReady,
    login,
    logout,
    updateCafe,
    refreshCafe,
    authenticateWithToken,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;