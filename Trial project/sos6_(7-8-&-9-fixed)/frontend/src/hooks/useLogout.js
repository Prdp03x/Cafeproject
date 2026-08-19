import { useNavigate } from "react-router";
import useAuth from "./useAuth";

const useLogout = () => {
  const navigate = useNavigate();
  const { logout: clearAuth } = useAuth();

  const logout = () => {
    clearAuth();
    navigate("/login");
  };

  return logout;
};

export default useLogout;
