import { useEffect } from "react";
import { FaArrowRight, FaShoppingCart } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import { MdOutlineShoppingCart } from "react-icons/md";
import CartItem from "./CartItem";
import PlaceOrderButton from "./PlaceOrderButton";

const CURRENCY_SYMBOL = "\u20B9";

const CartSidebar = ({
  cart,
  total,
  showCart,
  setShowCart,
  placeOrder,
  removeFromCart,
  addToCart,
  tableNumber,
}) => {
  useEffect(() => {
    if (!showCart) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowCart(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [setShowCart, showCart]);

  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div
      className={`fixed inset-0 z-50 bg-slate-950/35 backdrop-blur-[2px] transition-opacity duration-300 ${
        showCart ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={() => setShowCart(false)}
    >
      <div
        className={`flex h-full w-full flex-col bg-white px-5 py-6 shadow-2xl transition-transform duration-300 sm:ml-auto sm:max-w-xl sm:px-6 sm:rounded-l-[2rem] lg:mr-4 lg:mt-4 lg:h-[calc(100vh-2rem)] lg:max-w-lg lg:rounded-[2rem] ${
          showCart
            ? "translate-x-0 translate-y-0"
            : "translate-y-full lg:translate-x-full lg:translate-y-0"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Current Order
            </p>
            <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
              <MdOutlineShoppingCart /> Your Cart
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {itemCount} item{itemCount === 1 ? "" : "s"} selected
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCart(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="mb-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {tableNumber ? `Serving table #${tableNumber}` : "Choose a table before placing the order."}
        </div>

        <div className="scrollbar-hide flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
              <div className="mb-3 text-5xl text-slate-400">
                <FaShoppingCart />
              </div>
              <h2 className="text-lg font-semibold text-slate-800">
                Your cart is empty
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Looks like you have not added anything yet.
              </p>
              <button
                type="button"
                onClick={() => setShowCart(false)}
                className="theme-primary theme-primary-hover mt-5 flex items-center gap-2 rounded-full px-6 py-2 text-white transition"
              >
                Browse Menu <FaArrowRight />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <CartItem
                  key={item.uniqueKey}
                  item={item}
                  removeFromCart={removeFromCart}
                  addToCart={addToCart}
                />
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="mt-5 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between text-lg font-bold text-slate-900">
              <span>Total</span>
              <span>
                {CURRENCY_SYMBOL}
                {total}
              </span>
            </div>

            <PlaceOrderButton
              placeOrder={placeOrder}
              disabled={cart.length === 0 || !tableNumber}
              tableNumber={tableNumber}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;
