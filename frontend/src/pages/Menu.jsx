import { useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import OrderSuccessToast from "../components/OrderSuccessToast";
import CategoryFilter from "../components/Menu/CategoryFilter";
import MenuCard from "../components/Menu/MenuCard";
import CartSidebar from "../components/Cart/CartSidebar";
import useMenu from "../hooks/useMenu";
import useCart from "../hooks/useCart";
import API from "../api/api";
import Header from "../components/Common/Header";

const Menu = () => {
  const navigate = useNavigate();
  // UseState Hooks
  const [showCart, setShowCart] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  // UseSearchParam Hooks
  const [params] = useSearchParams();
  const tableFromURL = params.get("table");
  const cafeId = params.get("cafe");
  const [tableNumber, setTableNumber] = useState(
    tableFromURL ? Number(tableFromURL) : null,
  ); //Added line 4

  const { menu, categories, selectedCategory, loadMenu } = useMenu();

  const {
    cart,
    selectedOptions,
    handleOptionChange,
    addToCart,
    removeFromCart,
    total,
    setCart,
    setSelectedOptions,
  } = useCart();

  useEffect(() => {
    document.title = "Menu | My Cafe";
  }, []);

  // 🔥 CORRECT ORDER SYNC (WITH BACKEND)
  // useEffect(() => {
  //   const syncOrders = async () => {
  //     const ids = JSON.parse(localStorage.getItem("orders")) || [];

  //     if (ids.length === 0) {
  //       setOrderCount(0);
  //       return;
  //     }

  //     try {
  //       const results = await Promise.all(
  //         ids.map((id) =>
  //           API.get(`/order/${id}`)
  //             .then((res) => res.data)
  //             .catch(() => null),
  //         ),
  //       );

  //       const valid = results.filter(Boolean);

  //       setOrderCount(valid.length);

  //       // 🔥 CLEAN STORAGE
  //       const validIds = valid.map((o) => o._id);
  //       localStorage.setItem("orders", JSON.stringify(validIds));
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   };

  //   syncOrders();
  // }, []);

  useEffect(() => {
  const syncOrders = async () => {
    const allOrders =
      JSON.parse(localStorage.getItem("orders")) || {};

    const ids = allOrders[cafeId] || [];

    if (ids.length === 0) {
      setOrderCount(0);
      return;
    }

    try {
      const results = await Promise.all(
        ids.map((id) =>
          API.get(`/order/${id}`)
            .then((res) => res.data)
            .catch(() => null)
        )
      );

      const valid = results.filter(Boolean);

      setOrderCount(valid.length);

      // ✅ FIXED STORAGE (per cafe)
      const validIds = valid.map((o) => o._id);

      const updatedOrders = {
        ...allOrders,
        [cafeId]: validIds,
      };

      localStorage.setItem("orders", JSON.stringify(updatedOrders));

    } catch (err) {
      console.log(err);
    }
  };

  syncOrders();
}, [cafeId]);

  // 🔥 PLACE ORDER
  const placeOrder = async () => {
    if (cart.length === 0) return;

    if (!tableNumber) {
      throw new Error("Table not selected"); // ✅ THROW
    }

    if (!cafeId) {
      alert("Invalid QR / Cafe not found");
      return;
    }

    try {
      const res = await API.post("/order", {
        items: cart,
        total,
        tableNumber,
        status: "pending",
        cafeId,
      });

      const orderId = res.data.orderId;

      // const existing = JSON.parse(localStorage.getItem("orders")) || [];
      // const updated = [...existing, orderId];

      // localStorage.setItem("orders", JSON.stringify(updated));
      const allOrders = JSON.parse(localStorage.getItem("orders")) || {};

      const cafeOrders = allOrders[cafeId] || [];

      const updatedCafeOrders = [...cafeOrders, orderId];

      allOrders[cafeId] = updatedCafeOrders;

      localStorage.setItem("orders", JSON.stringify(allOrders));
      

      setOrderCount(updatedCafeOrders .length);
      // setOrderCount(updated.length);

      setShowSuccess(true);

      setCart([]);
      setSelectedOptions({});
      loadMenu("");
      setShowCart(false);
    } catch (error) {
      console.log(error);
      throw error; // 🔥 VERY IMPORTANT
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans">
      <Header
        brand={{
          name: "Cafe Delight",
          logo: "https://images.unsplash.com/photo-1633409361618-c73427e4e206?w=600",
          primaryColor: "#ccc",
        }}
        cartCount={cart.length}
      />

      <OrderSuccessToast
        show={showSuccess}
        onClose={() => setShowSuccess(false)}
      />

      {/* 🔥 TABLE SELECTOR */}
      {!tableNumber && (
        <div className="max-w-7xl mx-auto mt-4">
          <div className="bg-yellow-100 p-4 rounded">
            <p className="mb-2 font-medium">Please select your table number</p>

            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <button
                  key={num}
                  onClick={() => setTableNumber(num)}
                  className="px-4 py-2 bg-black text-white rounded"
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {tableNumber && (
        <div className="max-w-7xl mx-auto mt-4">
          <div className="bg-green-100 p-2 rounded text-sm font-medium">
            Table #{tableNumber}
          </div>
        </div>
      )}
      {/* 🔥 TOP BUTTONS */}
      <div className="fixed top-6 right-6 flex gap-2 z-50">
        {orderCount > 0 && (
          <button
            onClick={() => navigate(`/status?cafe=${cafeId}&table=${tableNumber}`)}
            className="bg-white border px-4 py-2 rounded-full shadow"
          >
            📦 Orders ({orderCount})
          </button>
        )}

        {cart.length > 0 && (
          <button
            onClick={() => setShowCart(true)}
            className="bg-black text-white px-4 py-2 rounded-full shadow"
          >
            🛒 Cart ({cart.length})
          </button>
        )}
      </div>

      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">🍽️ Our Menu</h1>

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelect={loadMenu}
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {menu.map((item) => (
            <MenuCard
              key={item._id}
              item={item}
              selectedOptions={selectedOptions}
              handleOptionChange={handleOptionChange}
              addToCart={addToCart}
            />
          ))}
        </div>
      </div>

      <CartSidebar
        cart={cart}
        total={total}
        showCart={showCart}
        setShowCart={setShowCart}
        placeOrder={placeOrder}
        removeFromCart={removeFromCart}
      />

      {showSuccess && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => navigate(`/status?cafe=${cafeId}&table=${tableNumber}`)}
            className="bg-blue-500 text-white px-4 py-2 rounded-full shadow"
          >
            Track Order →
          </button>
        </div>
      )}
    </div>
  );
};

export default Menu;
