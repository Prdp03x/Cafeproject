import { useState } from "react";

const AddToCartButton = ({ item, selectedOptions, quantity, addToCart }) => {
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    addToCart(item, selectedOptions, quantity);;

    // 🔥 Trigger animation
    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 1200);
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full mt-3 py-2 rounded-xl text-white transition-all ease-out duration-100
        ${
          added
            ? "bg-green-500 scale-100"
            : "bg-black hover:bg-gray-800"
        }`}
    >
      {added ? "Added ✓" : "Add to Cart"}
    </button>
  );
};

export default AddToCartButton;