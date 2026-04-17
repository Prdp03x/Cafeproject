import { BrowserRouter, Routes, Route } from "react-router";
import Menu from "./pages/Menu";
import Dashboard from "./pages/Dashboard";
import OrderStatus from "./pages/OrderStatus";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/login" element={<Login />} />
        <Route 
            path="/dashboard" 
            element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
          } />
        <Route path="/status" element={<OrderStatus />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;