import CartItem from "./CartItem";
import PlaceOrderButton from "../PlaceOrderButton";
import { MdOutlineShoppingCart } from "react-icons/md";
// 🛒

const CartSidebar = ({
  cart,
  total,
  showCart,
  setShowCart,
  placeOrder,
  removeFromCart,
  addToCart,
}) => {
  return (
    <div
      className="fixed inset-0 bg-white z-50 transition-all duration-500"
      style={{
        clipPath: showCart
          ? "circle(150% at 90% 10%)"
          : "circle(0% at 90% 10%)",
      }}
    >
      <div className="p-6 h-full flex flex-col">
        {/* HEADER */}
        <div className="flex justify-center items-center mb-4">
          <h2 className="text-2xl font-bold my-5 flex items-center gap-2">
            {" "}
            <MdOutlineShoppingCart /> Your Cart
          </h2>
          <button
            onClick={() => setShowCart(false)}
            className=" absolute top-4 right-6 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <div className="mb-3">
          <h2 className="font-bold">
            Your Orders ({cart.reduce((sum, item) => sum + item.qty, 0)})
          </h2>
        </div>

        {/* ITEMS */}
        <div className="flex-1 overflow-y-auto space-y-2 scrollbar-hide">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              {/* Icon / Illustration */}
              <div className="text-5xl mb-3">🛒</div>

              {/* Title */}
              <h2 className="text-lg font-semibold text-gray-800">
                Your cart is empty
              </h2>

              {/* Subtitle */}
              <p className="text-sm text-gray-500 mt-1">
                Looks like you haven’t added anything yet
              </p>

              {/* CTA Button */}
              <button
                onClick={() => setShowCart(false)}
                className="mt-5 bg-green-800 text-white px-6 py-2 rounded-full hover:bg-green-900 transition"
              >
                Browse Menu →
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <CartItem
                key={item.uniqueKey}
                item={item}
                removeFromCart={removeFromCart}
                addToCart={addToCart}
              />
            ))
          )}
        </div>

        {/* FOOTER */}
        {cart.length > 0 && (
          <div className="mt-4">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹{total}</span>
            </div>

            <PlaceOrderButton
              placeOrder={placeOrder}
              disabled={cart.length === 0}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;
