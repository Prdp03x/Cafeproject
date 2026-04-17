import useLogout from "../../hooks/useLogout";

const LogoutBtn = ({ className = "" }) => {
  const logout = useLogout();

  return (
    <button
      onClick={logout}
      className={`bg-red-500 text-white px-4 py-2 rounded ${className}`}
    >
      Logout
    </button>
  );
};

export default LogoutBtn;