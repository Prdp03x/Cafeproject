import { useEffect, useState } from "react";
import { FiMinus, FiPlus, FiX } from "react-icons/fi";
import { FaCheckCircle } from "react-icons/fa";

const CURRENCY_SYMBOL = "\u20B9";

const ItemModal = ({ item, onClose, addToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [options, setOptions] = useState({});
  const [closing, setClosing] = useState(false);
  const [added, setAdded] = useState(false);

  const handleClose = () => {
    setClosing(true);

    setTimeout(() => {
      onClose();
    }, 250);
  };

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setClosing(true);

        setTimeout(() => {
          onClose();
        }, 250);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleOptionChange = (title, choice, type) => {
    setOptions((prev) => {
      const existing = prev[title] || [];

      if (type === "single") {
        return {
          ...prev,
          [title]: [choice],
        };
      }

      const alreadySelected = existing.find(
        (entry) => entry.name === choice.name,
      );

      if (alreadySelected) {
        return {
          ...prev,
          [title]: existing.filter((entry) => entry.name !== choice.name),
        };
      }

      return {
        ...prev,
        [title]: [...existing, choice],
      };
    });
  };

  const getExtraPrice = () =>
    Object.values(options)
      .flat()
      .reduce((sum, option) => sum + (option.price || 0), 0);

  const totalPrice = (item.price + getExtraPrice()) * quantity;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-slate-950/45 p-0 backdrop-blur-[2px] lg:items-center lg:justify-center lg:p-6"
      onClick={handleClose}
    >
      <div
        className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden bg-white shadow-2xl ${
          closing ? "animate-dialogOut" : "animate-dialogIn"
        } rounded-t-[2rem] lg:max-w-5xl lg:rounded-[2rem]`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm transition hover:bg-white"
        >
          <FiX size={18} />
        </button>

        <div className="grid min-h-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
          <div className="bg-stone-100 lg:h-full">
            <img
              src={item.image}
              alt={item.name}
              className="h-64 w-full object-cover sm:h-72 lg:h-full lg:min-h-[36rem]"
            />
          </div>

          <div className="flex min-h-0 flex-col">
            <div className="flex-1 overflow-y-auto px-5 pb-6 pt-6 sm:px-6 lg:px-8 lg:pb-8 lg:pt-8">
              <div className="max-w-xl">
                <div className="mb-6 border-b border-slate-100 pb-5 pr-12">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Customize Item
                  </p>
                  <h2 className="text-2xl font-semibold text-slate-900 lg:text-3xl">
                    {item.name}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-500 lg:text-base">
                    {item.description ||
                      "Freshly prepared and ready to customize."}
                  </p>
                </div>

                <div className="space-y-5">
                  {item.options?.map((option) => (
                    <section
                      key={option.title}
                      className="rounded-2xl bg-slate-50 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="font-medium text-slate-900">
                          {option.title}
                        </p>
                        <span className="text-xs uppercase tracking-[0.18em] text-slate-400">
                          {option.type === "single"
                            ? "Choose one"
                            : "Choose any"}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {option.choices.map((choice) => {
                          const selected =
                            options?.[option.title]?.some(
                              (entry) => entry.name === choice.name,
                            ) || false;

                          return (
                            <button
                              key={choice.name}
                              type="button"
                              onClick={() =>
                                handleOptionChange(
                                  option.title,
                                  choice,
                                  option.type,
                                )
                              }
                              className={`rounded-full border px-3 py-2 text-sm transition ${
                                selected
                                  ? "theme-primary text-white shadow-sm"
                                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                              }`}
                            >
                              {choice.name} (+{CURRENCY_SYMBOL}
                              {choice.price})
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 bg-white px-5 py-4 sm:px-6 lg:px-8 lg:py-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total</p>
                  <div className="text-2xl font-bold text-slate-900">
                    {CURRENCY_SYMBOL} {totalPrice}
                  </div>
                </div>

                {/* <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3 rounded-full bg-slate-100 p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity((count) => Math.max(1, count - 1))}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm"
                    >
                      <FiMinus />
                    </button>

                    <span className="min-w-8 text-center font-medium text-slate-900">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => setQuantity((count) => count + 1)}
                      className="theme-primary theme-primary-hover flex h-10 w-10 items-center justify-center rounded-full"
                    >
                      <FiPlus className="text-white" />
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={added}
                    onClick={() => {
                      if (added) {
                        return;
                      }

                      addToCart(item, quantity, {
                        [item._id]: options,
                      });

                      setAdded(true);

                      setTimeout(() => {
                        handleClose();
                      }, 250);
                    }}
                    className={`min-w-44 rounded-full px-6 py-3 font-medium text-white transition-all duration-300 ${
                      added
                        ? "theme-primary"
                        : "theme-primary theme-primary-hover shadow-lg shadow-[var(--brand-color-shadow)]"
                    }`}
                  >
                    {added ? (
                      <span className="flex items-center justify-center gap-2 whitespace-nowrap">
                        Added <FaCheckCircle />
                      </span>
                    ) : (
                      `Add ${CURRENCY_SYMBOL} ${totalPrice}`
                    )}
                  </button>
                </div> */}
                {/* Quantity */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3 bg-gray-100 rounded-full p-2">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full"
                    >
                      <FiMinus />
                    </button>

                    <span className="text-[20px]">{quantity}</span>

                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-green-800 rounded-full"
                    >
                      <FiPlus className="text-white" />
                    </button>
                  </div>

                  {/* Add */}
                  <button
                    disabled={added}
                    onClick={() => {
                      if (added) return;

                      const formattedOptions = {
                        [item._id]: options,
                      };

                      addToCart(item, quantity, formattedOptions);

                      // ✅ show feedback
                      setAdded(true);

                      // close after short delay
                      setTimeout(() => {
                        handleClose();
                      }, 300);
                    }}
                    className={`px-6 py-2 rounded-full transition-all duration-300 ${
                      added
                        ? "bg-green-600 text-white"
                        : "bg-green-800 text-white"
                    }`}
                  >
                    {added ? (
                      <div className=" flex items-center gap-2 whitespace-nowrap">
                        Added <FaCheckCircle />
                      </div>
                    ) : (
                      `Add ₹ ${totalPrice}`
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemModal;
