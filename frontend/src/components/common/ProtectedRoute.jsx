import { Navigate } from "react-router";
import useAuth from "../../hooks/useAuth";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isReady } = useAuth();

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4efe6] text-sm text-slate-500">
        Loading workspace...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
