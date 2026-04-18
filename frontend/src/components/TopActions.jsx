const TopActions = ({ orderCount, cartLength, navigate, cafeId, tableNumber, setShowCart }) => {
  return (
    <div className="fixed bottom-6 right-1/2 translate-x-1/2 flex gap-2 z-50">
      {orderCount > 0 && (
        <button
          onClick={() =>
            navigate(`/status?cafe=${cafeId}&table=${tableNumber}`)
          }
          className="bg-white border px-4 py-2 rounded-full shadow whitespace-nowrap"
        >
          📦 Orders ({orderCount})
        </button>
      )}
    </div>
  );
};

export default TopActions;