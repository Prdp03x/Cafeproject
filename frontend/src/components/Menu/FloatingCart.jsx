const FloatingCart = ({
  show,
  itemCount,
  total,
  onClick
}) => {
  // const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-green-700 text-white px-4 py-3 rounded-xl shadow-xl z-50 flex justify-between items-center transition-all duration-300 ${
        show
          ? "translate-y-0 opacity-100"
          : "translate-y-20 opacity-0 pointer-events-none"
      }`}
    >
      {/* Left Info */}
      <div>
        <p className="text-sm opacity-90">
          {itemCount} item{itemCount > 1 && "s"}
        </p>
        <p className="font-semibold text-lg">₹{total}</p>
      </div>

      {/* Button */}
      <button
        onClick={onClick}
        className="bg-white text-green-700 px-4 py-2 rounded-lg font-medium"
      >
        View Cart
      </button>
    </div>
  );
};

export default FloatingCart;