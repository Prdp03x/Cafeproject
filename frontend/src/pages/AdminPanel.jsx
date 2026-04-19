import { useEffect, useState } from "react";
import API from "../api/api";
import AddItemModal from "../components/Admin/AddItemModal";

const AdminPanel = () => {
  const [menu, setMenu] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const fetchMenu = async () => {
    try {
      const cafe = JSON.parse(localStorage.getItem("cafe"));

      const res = await API.get(`/menu?cafeId=${cafe.id}`);
      setMenu(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch menu");
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const deleteItem = async (id) => {
    try {
      setMenu((prev) => prev.filter((item) => item._id !== id));
      await API.delete(`/menu/${id}`);
    } catch (err) {
      console.error("Delete failed");
      fetchMenu();
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🍽️ Manage Menu</h1>

      {/* Add Button */}
      <button
        onClick={() => setShowModal(true)}
        className="mb-4 bg-green-800 text-white px-4 py-2 rounded"
      >
        + Add Item
      </button>

      {/* Menu List */}
      <div className="space-y-4">
        {menu.map((item) => (
          <div
            key={item._id}
            className="p-4 bg-white rounded shadow flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-gray-500">₹ {item.price}</p>
            </div>

            <div className="flex gap-2">
              <button className="text-blue-500">Edit</button>
              <button onClick={() => deleteItem(item._id)} className="text-red-500">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {showModal && (
        <AddItemModal onClose={() => setShowModal(false)} refresh={fetchMenu} />
      )}
    </div>
  );
};

export default AdminPanel;
