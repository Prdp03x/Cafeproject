import { useEffect } from "react";
import { useNavigate } from "react-router";
import useAuth from "../hooks/useAuth";

export default function GoogleSuccess() {
  const navigate = useNavigate();
  const { authenticateWithToken, logout } = useAuth();

  useEffect(() => {
    const completeLogin = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        await authenticateWithToken(token);
        navigate("/dashboard");
      } catch {
        logout();
        navigate("/login");
      }
    };

    completeLogin();
  }, [authenticateWithToken, logout, navigate]);

  return <div>Logging you in...</div>;
}
