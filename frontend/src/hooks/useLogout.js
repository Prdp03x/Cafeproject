import { useNavigate } from "react-router";

const useLogout = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("cafe");
    navigate("/login");
  };

  return logout;
};

export default useLogout;