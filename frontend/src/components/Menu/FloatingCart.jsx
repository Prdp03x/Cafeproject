const FloatingCart = ({ show, itemCount, total, onClick }) => {
  return (
    <div
      className={`theme-primary fixed bottom-4 left-1/2 z-50 flex w-[92%] max-w-md -translate-x-1/2 items-center justify-between rounded-xl px-4 py-3 text-white shadow-xl transition-all duration-300 lg:hidden ${
        show
          ? "translate-y-0 opacity-100"
          : "translate-y-20 opacity-0 pointer-events-none"
      }`}
    >
      <div>
        <p className="text-sm opacity-90">
          {itemCount} item{itemCount > 1 && "s"}
        </p>
        <p className="text-lg font-semibold">{"\u20B9"}{total}</p>
      </div>

      <button
        onClick={onClick}
        className="rounded-lg bg-white px-4 py-2 font-medium"
        style={{ color: "var(--brand-color)" }}
      >
        View Cart
      </button>
    </div>
  );
};

export default FloatingCart;
