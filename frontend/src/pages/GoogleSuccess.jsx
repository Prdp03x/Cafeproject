import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function GoogleSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    console.log("TOKEN:", token); // 🔥 DEBUG

    if (token) {
      localStorage.setItem("token", token);
      setTimeout(() => {
        navigate("/dashboard");
      }, 100);
    } else {
      navigate("/login");
    }
  }, []);

  return <div>Logging you in...</div>;
}