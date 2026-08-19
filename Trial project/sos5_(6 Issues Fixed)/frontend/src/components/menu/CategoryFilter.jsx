// const CategoryFilter = ({ categories, selectedCategory, onSelect }) => {
//   return (
//     <div className="flex gap-3 mb-2 flex-wrap">
//       <button
//         onClick={() => onSelect("")}
//         className={`px-4 py-2 rounded-full border border-gray-300 shadow-md ${
//           selectedCategory === ""
//             ? "theme-primary theme-primary-hover text-white"
//             : "bg-white hover:bg-gray-100"
//         }`}
//       >
//         All
//       </button>

//       {categories.map((cat) => (
//         <button
//           key={cat}
//           onClick={() => onSelect(cat)}
//           className={`px-4 py-2 rounded-full border border-gray-300 shadow-md ${
//             selectedCategory === cat
//               ? "theme-primary theme-primary-hover text-white"
//               : "bg-white hover:bg-gray-100"
//           }`}
//         >
//           {cat}
//         </button>
//       ))}
//     </div>
//   );
// };

// export default CategoryFilter;


const CategoryFilter = ({ categories, selectedCategory, onSelect }) => {
  return (
    <div className="flex gap-2 mb-2 overflow-x-auto scrollbar-hide pb-0 -mx-1 px-1">
      <button
        onClick={() => onSelect("")}
        className={`px-5 py-2.5 rounded-full text-md font-medium transition-all duration-200 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#14532d]/20 ${
          selectedCategory === ""
            ? "bg-[#14532d] text-white shadow-md shadow-[#14532d]/20"
            : "bg-white text-gray-600 border border-gray-200 hover:border-[#14532d]/30 hover:text-[#14532d] hover:bg-[#14532d]/5"
        }`}
      >
        All
      </button>

      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`px-5 py-2.5 rounded-full text-md font-medium transition-all duration-200 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#14532d]/20 ${
            selectedCategory === cat
              ? "bg-[#14532d] text-white shadow-md shadow-[#14532d]/20"
              : "bg-white text-gray-600 border border-gray-200 hover:border-[#14532d]/30 hover:text-[#14532d] hover:bg-[#14532d]/5"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;