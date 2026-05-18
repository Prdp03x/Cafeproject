const MenuCard = ({ item, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
    >
      {/* Image */}
      <div className="relative">
        <img
          src={item.image}
          alt={item.name}
          className="h-44 w-full object-cover"
        />

        {/* Floating Add Button */}
        <button
          className="theme-primary theme-primary-hover absolute bottom-3 right-3 rounded-full px-4 py-1.5 text-sm text-white shadow"
          onClick={(e) => {
            e.stopPropagation(); // prevent modal open
            onClick(); // open modal instead
          }}
        >
          Add
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="theme-text line-clamp-1 text-lg font-semibold">
          {item.name}
        </h3>

        <p className="text-gray-500 text-sm mt-1 line-clamp-2">
          {item.description || "Tasty and fresh"}
        </p>

        <div className="mt-3 flex justify-between items-center">
          <span className="font-bold text-gray-800">
            ₹ {item.price}
          </span>

          {item.options?.length > 0 && (
            <span className="text-xs text-gray-400">
              Customizable
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuCard;
