// import { useNavigate, useSearchParams } from "react-router";

// const TableSelector = ({ tableNumber, setTableNumber }) => {
//   const navigate = useNavigate();
//   const [params] = useSearchParams();

//   const cafeId = params.get("cafe");

//   if (tableNumber) {
//     return (
//       <div className="max-w-7xl mx-auto mt-0">
//         <div className="theme-primary-soft rounded border p-2 text-sm font-medium">
//           Table #{tableNumber}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-7xl mx-auto mt-4">
//       <div className="bg-yellow-100 p-4 rounded">
//         <p className="mb-2 font-medium">Please select your table number</p>

//         <div className="flex flex-wrap gap-2">
//           {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
//             <button
//               key={num}
//               onClick={() => {
//                 const selectedTable = String(num);
//                 setTableNumber(selectedTable);
//                 // 🔥 update URL with table
//                 navigate(`/?cafe=${cafeId}&table=${selectedTable}`);
//               }}
//               className="theme-primary theme-primary-hover rounded px-4 py-2 text-white"
//             >
//               {num}
//             </button>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TableSelector;


import { useEffect } from "react";
import { FiX, FiGrid } from "react-icons/fi";

const TableModal = ({ isOpen, onClose, onSelect, cafeId, navigate, currentTable }) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Blur Background Overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity animate-in fade-in duration-200" 
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 transform transition-all animate-in fade-in zoom-in-95 duration-300 border border-gray-100">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#14532d]/10 text-[#14532d] rounded-xl shrink-0">
              <FiGrid size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Select Table</h2>
              <p className="text-xs text-gray-500 mt-0.5">Choose where you are seated.</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
            <button
              key={num}
              onClick={() => {
                onSelect(String(num));
                if (navigate && cafeId) {
                  navigate(`/?cafe=${cafeId}&table=${num}`);
                }
                onClose();
              }}
              className={`aspect-square flex flex-col items-center justify-center rounded-2xl border font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#14532d]/30 active:scale-95 ${
                currentTable === String(num)
                  ? "bg-[#14532d] text-white border-[#14532d] shadow-lg shadow-[#14532d]/20"
                  : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-[#14532d] hover:text-white hover:border-[#14532d] hover:shadow-md"
              }`}
            >
              <span className="text-xl">{num}</span>
            </button>
          ))}
        </div>
        
        <p className="text-center text-[11px] text-gray-400 mt-6">
          Need help? Please ask our staff.
        </p>
      </div>
    </div>
  );
};

export default TableModal;