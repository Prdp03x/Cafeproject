import { FiSearch } from "react-icons/fi";

const SearchBar = ({
  value,
  onChange,
  placeholder = "Search...",
  className = ""
}) => {
  return (
    <div
      className={`flex items-center bg-gray-200 rounded-lg px-4 py-2 my-2 focus-within:ring-2 focus-within:ring-green-800 ${className}`}
    >
      <FiSearch className="text-gray-400 mr-2" />

      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent outline-none w-full text-gray-700 placeholder-gray-400"
      />
    </div>
  );
};

export default SearchBar;