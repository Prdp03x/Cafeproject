import { useState } from "react";

const useCart = () => {
  const [cart, setCart] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});

  const handleOptionChange = (itemId, optionTitle, choice, type) => {
    setSelectedOptions((prev) => {
      const itemOptions = prev[itemId] || {};

      if (type === "single") {
        return {
          ...prev,
          [itemId]: {
            ...itemOptions,
            [optionTitle]: [choice],
          },
        };
      }

      const existing = itemOptions[optionTitle] || [];
      const alreadySelected = existing.find((c) => c.name === choice.name);

      const updated = alreadySelected
        ? existing.filter((c) => c.name !== choice.name)
        : [...existing, choice];

      return {
        ...prev,
        [itemId]: {
          ...itemOptions,
          [optionTitle]: updated,
        },
      };
    });
  };

  const addToCart = (item, quantity = 1, modalOptions = {}) => {
  const extras = modalOptions[item._id] || {};
  const selectedExtras = Object.values(extras).flat();

  const uniqueKey = item._id + selectedExtras.map((o) => o.name).sort().join("-");

  const existing = cart.find(
  (i) => i.uniqueKey === uniqueKey
);

if (existing) {
  setCart(
    cart.map((i) =>
      i.uniqueKey === uniqueKey
        ? { ...i, qty: i.qty + quantity }
        : i
    )
  );
} else {
  setCart([
    ...cart,
    {
      ...item,
      qty: quantity,
      selectedOptions: selectedExtras,
      uniqueKey, // 🔥 store it
    },
  ]);
}
};


  const total = cart.reduce((sum, item) => {
    const extras =
      item.selectedOptions?.reduce((s, opt) => s + opt.price, 0) || 0;

    return sum + (item.price + extras) * item.qty;
  }, 0);

  const removeFromCart = (item) => {
  setCart((prev) =>
    prev
      .map((i) =>
        i.uniqueKey === item.uniqueKey
          ? { ...i, qty: i.qty - 1 }
          : i
      )
      .filter((i) => i.qty > 0)
  );
};

  return {
    cart,
    selectedOptions,
    handleOptionChange,
    addToCart,
    removeFromCart,
    total,
    setCart,
    setSelectedOptions,
  };
};

export default useCart;