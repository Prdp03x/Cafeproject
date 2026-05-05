import MenuSkeleton from "../Loader/MenuSkeleton";
import MenuCard from "./MenuCard";

const MenuContent = ({
  loading,
  items,
  onItemClick,
  error,
  emptyText = "No items available",
}) => {
  if (loading) {
    return <MenuSkeleton />;
  }

  if (error) return <p>Error loading Menu</p>;

  if (!items || items.length === 0) {
    return (
      <div className="text-center mt-20">
        <p className="text-gray-400 text-lg">{emptyText}</p>
        <p className="text-sm text-gray-500 mt-2">
          This cafe has not added menu yet
        </p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((item) => (
        <MenuCard
          key={item._id}
          item={item}
          onClick={() => onItemClick(item)}
        />
      ))}
    </div>
  );
};

export default MenuContent;
