const TopActions = ({
  orderCount,
  navigate,
  cafeId,
  tableNumber,
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      {orderCount > 0 && (
        <button
          onClick={() => {
            if (!tableNumber) {
              alert("Please select your table");
              return;
            }

            navigate(`/status?cafe=${cafeId}&table=${tableNumber}`);
          }}
          className="bg-white border px-6 py-3 rounded-full shadow-lg whitespace-nowrap hover:bg-gray-100 transition active:scale-95"
        >
          📦 Orders ({orderCount})
        </button>
      )}
    </div>
  );
};

export default TopActions;