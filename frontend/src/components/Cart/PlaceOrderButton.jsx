import { useState } from "react";
import { FiArrowRight } from "react-icons/fi";

const PlaceOrderButton = ({ placeOrder, disabled, tableNumber }) => {
  const [status, setStatus] = useState("idle");
  // idle | loading | success

  const handleClick = async () => {
    if (!tableNumber) {
  alert("Please select your table");
  return;
}
    if (disabled || status === "loading") return;


    try {
      setStatus("loading");

      await placeOrder(); // call parent function

      // ✅ success animation
      setStatus("success");

      setTimeout(() => {
        setStatus("idle");
      }, 1500);
    } catch {
      setStatus("idle");
      alert("Order failed!");
    }
  };

  const getText = () => {
    if (!tableNumber) return "Select Table First";
    if (status === "loading") return "Placing...";
    if (status === "success") return "Order Placed ✓";
    return "Place Order";
  };

  const getStyle = () => {
    if (!tableNumber) return "bg-gray-400 cursor-not-allowed";
    if (status === "success") return "bg-green-800 scale-95";
    if (status === "loading") return "bg-gray-400 cursor-not-allowed";
    return "bg-green-800 hover:bg-green-600";
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || status === "loading"}
      className={`w-full mt-4 py-3 rounded-xl text-white font-semibold
        transition-all duration-300 ${getStyle()}`}
    >
      {getText()}
    </button>
  );
};

export default PlaceOrderButton;
