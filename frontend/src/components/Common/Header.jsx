import { useNavigate } from "react-router";
import { FiShoppingCart } from "react-icons/fi";

const Header = ({ brand, cartCount = 0, onCartClick }) => {
  const navigate = useNavigate();

  return (
    <div className="w-full py-4 flex items-center justify-between bg-gray-50 ">

      {/* 🔹 LEFT: LOGO + NAME */}
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => navigate("/")}
      >
        {brand?.logo ? (
          <img
            src={brand.logo}
            alt="logo"
            className="h-10 w-10 object-cover rounded-full border"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-green-800 flex items-center justify-center text-white font-semibold">
            {brand?.name?.charAt(0) || "C"}
          </div>
        )}

        <div className="flex flex-col leading-tight">
          <h1 className="text-black font-semibold text-base">
            {brand?.name || "My Cafe"}
          </h1>
          <span className="text-xs text-gray-500">
            Fresh & Tasty
          </span>
        </div>
      </div>

      {/* 🔹 RIGHT: CART */}
      <div
        onClick={onCartClick}
        className="relative cursor-pointer"
      >
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 border border-gray-300 hover:bg-gray-200 transition">
          <FiShoppingCart className="text-gray-700" size={18} />
        </div>

        {/* Badge */}
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-green-800 text-white text-[10px] px-1.5 py-0.5 rounded-full">
            {cartCount}
          </span>
        )}
      </div>

    </div>
  );
};

export default Header;