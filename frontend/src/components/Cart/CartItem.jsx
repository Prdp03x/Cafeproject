import { FiPlus, FiMinus } from "react-icons/fi";


const CartItem = ({ item, removeFromCart, addToCart }) => {

  const extrasTotal =
    item.selectedOptions?.reduce((s, o) => s + o.price, 0) || 0;

  const itemTotal = (item.price + extrasTotal) * item.qty;

  return (
    <div className="flex gap-3 py-3 border-b border-gray-400">

      {/* 🖼️ Image */}
      <div className="w-20 h-20 flex-shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover rounded-xl"
        />
      </div>

      {/* 📦 Content */}
      <div className="flex flex-1 flex-col justify-between">

        {/* 🔹 Top: Name */}
        <div>
          <h3 className="font-medium text-gray-800 line-clamp-1">
            {item.name}
          </h3>

          {/* Options */}
          {item.selectedOptions?.length > 0 && (
            <p className="text-xs text-gray-500">
              {item.selectedOptions.map((o) => o.name).join(", ")}
            </p>
          )}
        </div>

        {/* 🔹 Bottom: Quantity + Price */}
        <div className="flex items-center justify-between mt-2">

          {/* Quantity Controls */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-1">

            <button
              onClick={() => removeFromCart(item)}
              className="w-7 h-7 flex items-center justify-center bg-white rounded-full shadow-sm"
            >
              <FiMinus size={14} />
            </button>

            <span className="text-sm font-medium px-1">
              {item.qty}
            </span>

            <button
              onClick={() => addToCart(item, 1)}
              className="w-7 h-7 flex items-center justify-center bg-green-800 rounded-full text-white"
            >
              <FiPlus size={14} />
            </button>

          </div>

          {/* Price */}
          <span className="font-semibold text-gray-900">
            ₹ {itemTotal}
          </span>

        </div>
      </div>
    </div>
  );
};

export default CartItem;