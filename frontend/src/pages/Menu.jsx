import { useSearchParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
// COMPONENTS
import Header from "../components/Common/Header";
import OrderSuccessToast from "../components/OrderSuccessToast";
import CategoryFilter from "../components/Menu/CategoryFilter";
import CartSidebar from "../components/Cart/CartSidebar";
import FloatingCart from "../components/Menu/FloatingCart";
import SearchBar from "../components/Menu/SearchBar";
import MenuContent from "../components/Menu/MenuContent";
import TableSelector from "../components/TableSelector";
import TopActions from "../components/TopActions";
import ItemModel from "../components/Menu/ItemModel";
// HOOKS
import useMenu from "../hooks/useMenu";
import useCart from "../hooks/useCart";
import useSession from "../hooks/useSession";
import useSocket from "../hooks/useSocket";
import useOrderCount from "../hooks/useOrderCount";
import useStickyScroll from "../hooks/useStickyScroll";
import useCafe from "../hooks/useCafe";
// API
import API from "../api/api";

const Menu = () => {
  // 🔹 Routing
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const cafeId = params.get("cafe");
  const tableFromURL = params.get("table");

  // 🔹 Local State
  const [tableNumber, setTableNumber] = useState(
    tableFromURL ? String(tableFromURL) : null
  );
  const [search, setSearch] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  // 🔹 Hooks
  useSession();
  useSocket(cafeId);
 // CUSTOM HOOKS
  const { showSticky, stickyRef } = useStickyScroll();
  const { cafe } = useCafe(cafeId);
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

  const orderCount = useOrderCount(cafeId, tableNumber);

  // 🔹 Effects
  useEffect(() => {
    if (cafe?.name) {
      document.title = `${cafe.name} | Menu`;
    }
  }, [cafe]);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 150);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🔹 Derived State
  const filteredMenu = menu.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const cartItemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const showFloatingCart =
    cartItemCount > 0 && hasScrolled && !showCart && !selectedItem;

  // 🔹 Actions
  const placeOrder = async () => {
    const sessionId = localStorage.getItem("sessionId");

    if (!cafeId) {
    alert("Invalid cafe. Please scan QR again.");
    return;
  }

  if (!tableNumber) {
    alert("Please select table number");
    return;
  }

  if (!cart.length) {
    alert("Cart is empty");
    return;
  }


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

  // 🔹 UI
  return (
    <div className="min-h-screen bg-gray-50 font-poppins">

      {/* 🔝 Header */}
      <div className="p-4 pb-0 z-50 bg-gray-50 shadow-md">
        <div className="max-w-7xl mx-auto">
          <Header
            brand={{ name: cafe?.name || "Cafe Delight" }}
            cartCount={cartItemCount}
            onCartClick={() => setShowCart(true)}
          />

          <TableSelector
            tableNumber={tableNumber}
            setTableNumber={setTableNumber}
          />
        </div>
      </div>

      {/* 🔹 Sticky Section */}
      <div
        ref={stickyRef}
        className={`sticky top-0 p-3 z-50 bg-gray-50 transition-transform duration-300 ${
          showSticky ? "translate-y-0 shadow-sm" : "-translate-y-0"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <p className="text-md font-semibold text-gray-400 -mb-3">
            Our Food
          </p>

          <div className="flex justify-between items-center my-4">
            <h1 className="text-3xl font-semibold text-green-700">
              Special For You
            </h1>
            <span className="text-sm text-gray-500">
              {filteredMenu.length} items
            </span>
          </div>

          <SearchBar value={search} onChange={setSearch} />

          <div className="overflow-x-auto scrollbar-hide">
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

      {/* 🔹 Toast */}
      <OrderSuccessToast
        show={showSuccess}
        onClose={() => setShowSuccess(false)}
      />

      {/* 🔹 Main Content */}
      <div className="p-4 pb-28">
        <TopActions
          orderCount={orderCount}
          cartLength={cartItemCount}
          navigate={navigate}
          cafeId={cafeId}
          tableNumber={tableNumber}
          setShowCart={setShowCart}
        />

        <div className="max-w-7xl mx-auto">
          <MenuContent
            loading={loading}
            items={filteredMenu}
            onItemClick={setSelectedItem}
          />
        </div>

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

        {selectedItem && (
          <ItemModel
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            addToCart={addToCart}
          />
        )}
      </div>

      {/* 🔹 Floating Cart */}
      <FloatingCart
        show={showFloatingCart}
        itemCount={cartItemCount}
        total={total}
        onClick={() => setShowCart(true)}
      />
    </div>
  );
};

export default Menu;