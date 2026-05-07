import { useEffect } from "react";

const OrderSuccessToast = ({ show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <div
      className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 
        transition-all duration-500
        ${
          show
            ? "opacity-100 scale-100"
            : "opacity-0 scale-90 pointer-events-none"
        }`}
    >
      <div className="bg-green-700 font-light text-sm text-white px-6 py-3 rounded-full shadow-xl whitespace-nowrap">
        Order placed successfully!
      </div>
    </div>
  );
};

export default OrderSuccessToast;
