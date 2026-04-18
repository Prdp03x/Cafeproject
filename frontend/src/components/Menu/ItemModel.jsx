import { useState } from "react";
import { FiPlus, FiMinus } from "react-icons/fi";

const ItemModel = ({ item, onClose, addToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [options, setOptions] = useState({}); // 🔥 local state
  const [closing, setClosing] = useState(false);

  // handle option change
  const handleOptionChange = (title, choice, type) => {
    setOptions((prev) => {
      const existing = prev[title] || [];

      if (type === "single") {
        return {
          ...prev,
          [title]: [choice],
        };
      }

      // multi
      const already = existing.find((c) => c.name === choice.name);

      if (already) {
        return {
          ...prev,
          [title]: existing.filter((c) => c.name !== choice.name),
        };
      }

      return {
        ...prev,
        [title]: [...existing, choice],
      };
    });
  };

  const handleClose = () => {
    setClosing(true);

    setTimeout(() => {
      onClose();
    }, 300); // match animation duration
  };

  // calculate price
  const getExtraPrice = () => {
    return Object.values(options)
      .flat()
      .reduce((sum, opt) => sum + (opt.price || 0), 0);
  };

  const totalPrice = (item.price + getExtraPrice()) * quantity;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-end z-50"
      onClick={handleClose}
    >
      <div
        className={`bg-white w-full rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto ${ closing ? "animate-slideDown" : "animate-slideUp"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-54 object-cover mb-4 rounded-3xl"
          />
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">{item.name}</h2>
        </div>

        {/* Description */}
        <p className="text-gray-500 mb-4 text-sm">
          {item.description || "Delicious item"}
        </p>

        {/* 🔥 OPTIONS */}
        {item.options?.map((opt) => (
          <div key={opt.title} className="mb-5">
            <p className="font-medium mb-2">{opt.title}</p>

            <div className="flex flex-wrap gap-2">
              {opt.choices.map((choice) => {
                const selected =
                  options?.[opt.title]?.some((c) => c.name === choice.name) ||
                  false;

                return (
                  <button
                    key={choice.name}
                    onClick={() =>
                      handleOptionChange(opt.title, choice, opt.type)
                    }
                    className={`px-3 py-1 rounded-full border text-sm ${
                      selected ? "bg-green-800 text-white" : "bg-gray-100"
                    }`}
                  >
                    {choice.name} (+₹{choice.price})
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Price */}
        <div className="text-lg font-bold mb-4">₹ {totalPrice}</div>

        {/* Quantity */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3 bg-gray-100 rounded-full">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-9 h-9 flex items-center justify-center bg-gray-200 rounded-full"
            >
              <FiMinus />
            </button>

            <span>{quantity}</span>

            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-9 h-9 flex items-center justify-center bg-green-800 rounded-full"
            >
              <FiPlus className="text-white" />
            </button>
          </div>

          {/* Add */}
          <button
            onClick={() => {
              // 🔥 convert to your cart format
              const formattedOptions = {
                [item._id]: options,
              };

              addToCart(item, quantity, formattedOptions);
              handleClose();
            }}
            className="bg-green-800 text-white px-6 py-2 rounded-full"
          >
            Add ₹ {totalPrice}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemModel;
