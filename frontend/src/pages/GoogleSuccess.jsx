import { useEffect } from "react";
import { useNavigate } from "react-router";
import API from "../api/api";

export default function GoogleSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const completeLogin = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (!token) {
        navigate("/login");
        return;
      }

      localStorage.setItem("token", token);

      try {
        const res = await API.get("/auth/me");
        localStorage.setItem("cafe", JSON.stringify(res.data));
        navigate("/dashboard");
      } catch {
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    completeLogin();
  }, [navigate]);

  return <div>Logging you in...</div>;
}
