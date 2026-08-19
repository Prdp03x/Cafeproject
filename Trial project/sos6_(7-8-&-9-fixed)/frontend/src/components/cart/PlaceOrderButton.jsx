import { useState } from "react";

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

      await placeOrder(); // call parent function — opens Razorpay Checkout, then confirms the order

      // ✅ success animation
      setStatus("success");

      setTimeout(() => {
        setStatus("idle");
      }, 1500);
    } catch (err) {
      setStatus("idle");

      // A user closing the payment sheet isn't really a "failure" worth alarming them over.
      if (err?.message === "Payment cancelled") return;

      alert(err?.message || "Order failed!");
    }
  };

  const getText = () => {
    if (!tableNumber) return "Select Table First";
    if (status === "loading") return "Opening Payment...";
    if (status === "success") return "Order Placed ✓";
    return "Pay & Place Order";
  };

  const getStyle = () => {
    if (!tableNumber) return "bg-gray-400 cursor-not-allowed";
    if (status === "success") return "theme-primary scale-95";
    if (status === "loading") return "bg-gray-400 cursor-not-allowed";
    return "theme-primary theme-primary-hover";
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
