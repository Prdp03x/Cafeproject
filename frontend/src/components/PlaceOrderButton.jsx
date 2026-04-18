import { useState } from "react";
import { FiArrowRight } from "react-icons/fi";

const PlaceOrderButton = ({ placeOrder, disabled }) => {
  const [status, setStatus] = useState("idle");
  // idle | loading | success

  const handleClick = async () => {
    if (disabled || status === "loading") return;

    try {
      setStatus("loading");

      await placeOrder(); // call parent function

      // ✅ success animation
      setStatus("success");

      setTimeout(() => {
        setStatus("idle");
      }, 1500);
    } catch (err) {
      setStatus("idle");
      alert("Order failed!");
    }
  };

  const getText = () => {
    if (status === "loading") return "Placing...";
    if (status === "success") return "Order Placed ✓";
    return "Place Order";
  };

  const getStyle = () => {
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