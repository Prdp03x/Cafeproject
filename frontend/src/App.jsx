import { BrowserRouter, Routes, Route } from "react-router";
import Menu from "./pages/Menu";
import Dashboard from "./pages/Dashboard";
import OrderStatus from "./pages/OrderStatus";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import GoogleSuccess from "./pages/GoogleSuccess";
import Signup from "./pages/Signup";
import AdminPanel from "./pages/AdminPanel";




function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
          } />
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
    </BrowserRouter>
  );
}

export default App;
