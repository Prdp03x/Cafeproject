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


import { useNavigate, useSearchParams } from "react-router";
import { FiInfo, FiMapPin } from "react-icons/fi";

const TableSelector = ({ tableNumber, setTableNumber }) => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const cafeId = params.get("cafe");

  if (tableNumber) {
    return (
      // Added mb-2 to prevent shadow clipping, changed shadow-lg to shadow-md
      <div className="flex items-center gap-2 bg-[#14532d] text-white px-4 py-2 rounded-full shadow-md shadow-[#14532d]/20 w-max mb-2 animate-in fade-in slide-in-from-top-2 duration-300">
        <FiMapPin size={16} />
        <span className="text-sm font-semibold tracking-wide">
          Table {tableNumber}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-start gap-3 mb-5">
        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0">
          <FiInfo size={20} />
        </div>
        <div>
          <p className="font-semibold text-gray-900">Select your table</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Please choose your table number to begin ordering.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
          <button
            key={num}
            onClick={() => {
              const selectedTable = String(num);
              setTableNumber(selectedTable);
              navigate(`/?cafe=${cafeId}&table=${selectedTable}`);
            }}
            className="aspect-square flex items-center justify-center rounded-xl bg-gray-50 border border-gray-200 text-gray-700 font-semibold hover:bg-[#14532d] hover:text-white hover:border-[#14532d] hover:shadow-md hover:shadow-[#14532d]/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#14532d]/30 active:scale-95"
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TableSelector;