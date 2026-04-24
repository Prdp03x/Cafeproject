import { useEffect, useState } from "react";
import API from "../api/api";
import AddItemModal from "../components/Admin/AddItemModal";
import { useNavigate } from "react-router";
import { FaArrowLeft, FaRegEdit } from "react-icons/fa";
import { AiOutlineDelete } from "react-icons/ai";

const AdminPanel = () => {
  const [menu, setMenu] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const navigate = useNavigate();

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

    useEffect(() => {
    document.title = "Admin Panel";
  },[])

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">🍽️ Manage Menu</h1>

        <button
          onClick={() => navigate("/dashboard")}
          className="bg-gray-200 hover:bg-gray-300 p-2 rounded-full md:rounded flex items-center justify-center md:gap-2 md:px-4 md:py-2"
        >
          <FaArrowLeft className="text-lg" />

          <span className="hidden md:inline text-md font-bold">Dashboard</span>
        </button>
      </div>

      {/* Add Button */}
      <button
        onClick={() => setShowModal(true)}
        className="mb-4 bg-green-800 text-white px-4 py-2 rounded"
      >
        + Add Item
      </button>

      {/* Menu List */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {menu.map((item) => (
          <div
            key={item._id}
            className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden"
          >
            {/* 🍽️ Image */}
            <div className="h-40 w-full overflow-hidden">
              <img
                src={item.image || "https://via.placeholder.com/300"}
                alt={item.name}
                className="w-full h-full object-cover hover:scale-105 transition"
              />
            </div>

            {/* 📦 Content */}
            <div className="p-4 flex justify-between items-start">
              <div>
                <p className="font-semibold text-lg">{item.name}</p>
                <p className="text-sm text-gray-500">₹ {item.price}</p>
                <p className="text-xs text-gray-400 mt-1">{item.category}</p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                {/* ✏️ Edit */}
                <button
                  onClick={() => {
                    setEditingItem(item);
                    setShowModal(true);
                  }}
                  className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition text-sm font-medium"
                >
                  <FaRegEdit /> Edit
                </button>

                {/* 🗑 Delete */}
                <button
                  onClick={() => deleteItem(item._id)}
                  className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition text-sm font-medium"
                >
                  <AiOutlineDelete /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {showModal && (
        <AddItemModal 
            onClose={() => {
              setShowModal(false);
              setEditingItem(null);
            }} 
            refresh={fetchMenu} 
            editItem={editingItem}
        />
      )}
    </div>
  );
};

export default AdminPanel;
