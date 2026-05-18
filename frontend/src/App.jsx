import { BrowserRouter, Routes, Route } from "react-router";
import Menu from "./pages/Menu";
import Dashboard from "./pages/Dashboard";
import OrderStatus from "./pages/OrderStatus";
import ProtectedRoute from "./components/Common/ProtectedRoute";
import Login from "./pages/Login";
import GoogleSuccess from "./pages/GoogleSuccess";
import Signup from "./pages/Signup";
import Settings from "./pages/Settings";
import AdminPanel from "./pages/AdminPanel";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Menu />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/menu"
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route path="/google-success" element={<GoogleSuccess />} />
          <Route path="/status" element={<OrderStatus />} />
        </Routes>
        <ToastContainer
          position="top-center"
          autoClose={2000}
          theme="dark"
          toastStyle={{
            width: window.innerWidth < 768 ? "400px" : "450px",
            borderRadius: "16px",
            margin: "0 auto",
            marginTop: "20px",
          }}
          hideProgressBar
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
