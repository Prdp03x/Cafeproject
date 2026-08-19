// import { FiSearch } from "react-icons/fi";

// const SearchBar = ({
//   value,
//   onChange,
//   placeholder = "Search...",
//   className = ""
// }) => {
//   return (
//     <div
//       className={`flex items-center bg-gray-200 rounded-lg px-4 py-2 my-2 focus-within:ring-2 focus-within:ring-green-800 ${className}`}
//     >
//       <FiSearch className="text-gray-400 mr-2" />

//       <input
//         type="text"
//         placeholder={placeholder}
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         className="bg-transparent outline-none w-full text-gray-700 placeholder-gray-400"
//       />
//     </div>
//   );
// };

// export default SearchBar;

import { FiSearch, FiX } from "react-icons/fi";

const SearchBar = ({ value, onChange, placeholder = "Search menu...", className = "" }) => {
  return (
    <div className={`relative group mb-4 ${className}`}>
      <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#14532d] transition-colors duration-200" size={18} />

      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border border-gray-200 rounded-full pl-11 pr-10 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#14532d]/20 focus:border-[#14532d] transition-all duration-200 shadow-sm"
      />

      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          aria-label="Clear search"
        >
          <FiX size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;