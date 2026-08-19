import { FiLogOut } from "react-icons/fi";
import useLogout from "../../hooks/useLogout";

const LogoutBtn = ({ className = "" }) => {
  const logout = useLogout();

  return (
    <button
      onClick={logout}
      className={`inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-rose-700 ${className}`}
    >
      <FiLogOut size={16} />
      Logout
    </button>
  );
};

export default LogoutBtn;
