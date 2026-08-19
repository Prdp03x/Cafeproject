import { Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TopActions = ({ orderCount, navigate, cafeId, tableNumber }) => {
  const handleClick = () => {
    if (!tableNumber) {
      alert("Please select your table");
      return;
    }
    navigate(`/status?cafe=${cafeId}&table=${tableNumber}`);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <AnimatePresence>
        {orderCount > 0 && (
          <motion.button
            key="orders-fab"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            onClick={handleClick}
            className="group relative flex items-center gap-2.5 whitespace-nowrap rounded-full
                       bg-white/50 backdrop-blur-md border border-gray-200
                       pl-4 pr-5 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)]
                       transition-all duration-200
                       hover:shadow-[0_10px_36px_rgba(20,83,45,0.25)] hover:border-[#14532d]/30
                       active:scale-95"
          >
            {/* icon badge */}
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#14532d] text-white shrink-0">
              <Package size={17} strokeWidth={2.25} />
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#14532d]/60 opacity-75" />
                <span className="relative inline-flex items-center justify-center h-4 w-4 rounded-full bg-[#14532d] text-[10px] font-semibold text-white ring-2 ring-white">
                  {orderCount}
                </span>
              </span>
            </span>

            <span className="flex flex-col items-start leading-tight">
              <span className="text-[13px] font-semibold text-gray-900">
                Track Orders
              </span>
              <span className="text-[11px] text-gray-500">
                {orderCount} {orderCount === 1 ? "order" : "orders"} in progress
              </span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TopActions;