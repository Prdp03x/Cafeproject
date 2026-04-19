import { useSearchParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";

import Header from "../components/Common/Header";
import OrderSuccessToast from "../components/OrderSuccessToast";
import CategoryFilter from "../components/Menu/CategoryFilter";
import MenuCard from "../components/Menu/MenuCard";
import CartSidebar from "../components/Cart/CartSidebar";

import TableSelector from "../components/TableSelector";
import TopActions from "../components/TopActions";

import useMenu from "../hooks/useMenu";
import useCart from "../hooks/useCart";
import useSession from "../hooks/useSession";
import useSocket from "../hooks/useSocket";
import useOrderCount from "../hooks/useOrderCount";
import ItemModel from "../components/Menu/ItemModel";
import MenuSkeleton from "../components/Loader/MenuSkeleton";

import API from "../api/api";

const Menu = () => {
  const navigate = useNavigate();

  const [params] = useSearchParams();
  const cafeId = params.get("cafe");
  const tableFromURL = params.get("table");

  const [tableNumber, setTableNumber] = useState(
    tableFromURL ? String(tableFromURL) : null,
  );

  const [showCart, setShowCart] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [cafe, setCafe] = useState(null);

  // 🔥 SEARCH STATE
  const [search, setSearch] = useState("");

  useSession();
  useSocket(cafeId);

  const orderCount = useOrderCount(cafeId, tableNumber);

  const { menu, categories, selectedCategory, loadMenu, loading } =
    useMenu(cafeId);
  const {
    cart,
    addToCart,
    removeFromCart,
    total,
    setCart,
    setSelectedOptions,
  } = useCart();

  useEffect(() => {
    if (!cafeId) return;

    const fetchCafe = async () => {
      try {
        const res = await API.get(`/cafes/${cafeId}`);
        setCafe(res.data);
      } catch (err) {
        console.error("Cafe not found");
        setCafe({ name: "Cafe" }); // fallback
      }
    };

    fetchCafe();
  }, [cafeId]);

  useEffect(() => {
    if (cafe?.name) {
      document.title = `${cafe.name} | Menu`;
    }
  }, [cafe]);

  // 🔥 FILTER MENU
  const filteredMenu = menu.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  const placeOrder = async () => {
    const sessionId = localStorage.getItem("sessionId");

    await API.post("/orders", {
      items: cart,
      total,
      tableNumber,
      cafeId,
      sessionId,
    });

    window.location.reload();
    setShowSuccess(true);
    setCart([]);
    setSelectedOptions({});
    setShowCart(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      {/* 🔝 Sticky Top */}
      <div className="sticky p-4 pb-0 top-0 z-50 bg-gray-50 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto">
          <Header
            brand={{ name: cafe?.name || "Cafe Delight" }}
            cartCount={cart.reduce((sum, item) => sum + item.qty, 0)}
            onCartClick={() => setShowCart(true)}
          />

          <TableSelector
            tableNumber={tableNumber}
            setTableNumber={setTableNumber}
          />
          {/* Title */}
          <div>
            <p className="text-md font-semibold text-gray-400 -mb-3 mt-4">
              Our Food
            </p>
            <div className="flex justify-between items-center my-4">
              <h1 className="text-3xl font-semibold text-green-700 tracking-tight">
                Special For You
              </h1>
              <span className="text-sm text-gray-500">
                {filteredMenu.length} items
              </span>
            </div>
          </div>

          {/* 🔍 Search Bar */}
          <div className="pb-2">
            <div className="flex items-center bg-gray-200 rounded-lg px-4 py-2 focus-within:ring-2 focus-within:ring-green-800">
              <FiSearch className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search food..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none w-full text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="p-3 overflow-x-auto scrollbar-hide scroll-smooth">
            <div className="flex gap-3 min-w-max">
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onSelect={loadMenu}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      <OrderSuccessToast
        show={showSuccess}
        onClose={() => setShowSuccess(false)}
      />

      {/* Actions */}
      <div className="p-4">
        <TopActions
          orderCount={orderCount}
          cartLength={cart.reduce((sum, item) => sum + item.qty, 0)}
          navigate={navigate}
          cafeId={cafeId}
          tableNumber={tableNumber}
          setShowCart={setShowCart}
        />

        {/* Menu Grid */}
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <MenuSkeleton/>
          ) : filteredMenu.length === 0 ? (
            <div className="text-center mt-20">
              <p className="text-gray-400 text-lg">No items available 🍽️</p>
              <p className="text-sm text-gray-500 mt-2">
                This cafe hasn’t added menu yet
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredMenu.map((item) => (
                <MenuCard
                  key={item._id}
                  item={item}
                  onClick={() => setSelectedItem(item)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Cart */}
        <CartSidebar
          cart={cart}
          total={total}
          showCart={showCart}
          setShowCart={setShowCart}
          placeOrder={placeOrder}
          removeFromCart={removeFromCart}
          addToCart={addToCart}
          tableNumber={tableNumber}
        />

        {/* Modal */}
        {selectedItem && (
          <ItemModel
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            addToCart={addToCart}
          />
        )}
      </div>
    </div>
  );
};

export default Menu;
