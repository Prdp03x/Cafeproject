// import { useSearchParams, useNavigate } from "react-router";
// import { useState, useEffect } from "react";
// import { toast } from "react-toastify";
// // COMPONENTS
// import Header from "../components/common/Header";
// import CategoryFilter from "../components/menu/CategoryFilter";
// import CartSidebar from "../components/cart/CartSidebar";
// import FloatingCart from "../components/menu/FloatingCart";
// import SearchBar from "../components/menu/SearchBar";
// import MenuContent from "../components/menu/MenuContent";
// import TableSelector from "../components/menu/TableSelector";
// import TopActions from "../components/menu/TopActions";
// import ItemModal from "../components/menu/ItemModal";
// // HOOKS
// import useMenu from "../hooks/useMenu";
// import useCart from "../hooks/useCart";
// import useSession from "../hooks/useSession";
// import useSocket from "../hooks/useSocket";
// import useOrderCount from "../hooks/useOrderCount";
// import useStickyScroll from "../hooks/useStickyScroll";
// import useCafe from "../hooks/useCafe";
// import useThemeColor from "../hooks/useThemeColor";
// import usePayment from "../hooks/usePayment";
// const Menu = () => {
//   // 🔹 Routing
//   const navigate = useNavigate();
//   const [params] = useSearchParams();

//   const cafeId = params.get("cafe");
//   const tableFromURL = params.get("table");

//   // 🔹 Local State
//   const [tableNumber, setTableNumber] = useState(
//     tableFromURL ? String(tableFromURL) : null,
//   );
//   const [search, setSearch] = useState("");
//   const [showCart, setShowCart] = useState(false);
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [hasScrolled, setHasScrolled] = useState(false);

//   // 🔹 Hooks
//   useSession();
//   useSocket(cafeId);
//   // CUSTOM HOOKS
//   const { showSticky, stickyRef } = useStickyScroll();
//   const { cafe } = useCafe(cafeId);
//   useThemeColor(cafe?.themeColor);
//   const { menu, categories, selectedCategory, loadMenu, loading } =
//     useMenu(cafeId);

//   const {
//     cart,
//     addToCart,
//     removeFromCart,
//     total,
//     setCart,
//     setSelectedOptions,
//   } = useCart();

//   const orderCount = useOrderCount(cafeId, tableNumber);
//   const { payAndPlaceOrder } = usePayment();

//   // 🔹 Effects
//   useEffect(() => {
//     if (cafe?.name) {
//       document.title = `${cafe.name} | Menu`;
//     }
//   }, [cafe]);

//   useEffect(() => {
//     const handleScroll = () => {
//       setHasScrolled(window.scrollY > 150);
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   useEffect(() => {
//     const shouldLockScroll = showCart || Boolean(selectedItem);

//     document.body.style.overflow = shouldLockScroll ? "hidden" : "";

//     return () => {
//       document.body.style.overflow = "";
//     };
//   }, [selectedItem, showCart]);

//   // 🔹 Derived State
//   const filteredMenu = menu.filter((item) =>
//     item.name.toLowerCase().includes(search.toLowerCase()),
//   );

//   const cartItemCount = cart.reduce((sum, item) => sum + item.qty, 0);

//   const showFloatingCart =
//     cartItemCount > 0 && hasScrolled && !showCart && !selectedItem;

//   // 🔹 Actions
//   const placeOrder = async () => {
//     const sessionId = localStorage.getItem("sessionId");

//     if (!cafeId) {
//       alert("Invalid cafe. Please scan QR again.");
//       return;
//     }

//     if (!tableNumber) {
//       alert("Please select table number");
//       return;
//     }

//     if (!cart.length) {
//       alert("Cart is empty");
//       return;
//     }

//     await payAndPlaceOrder({
//       cart,
//       tableNumber,
//       cafeId,
//       sessionId,
//       cafeName: cafe?.name,
//       themeColor: cafe?.themeColor,
//     });

//     setCart([]);
//     setSelectedOptions({});
//     setShowCart(false);
//     toast.success("Payment successful — order placed");
//     navigate(`/status?cafe=${cafeId}&table=${tableNumber}`);
//   };

//   // 🔹 UI
//   return (
//     <div className="min-h-screen bg-gray-50 font-poppins">
//       {/* 🔝 Header */}
//       <div className="p-4 pb-0 z-50 bg-gray-50 shadow-md">
//         <div className="max-w-7xl mx-auto">
//           <Header
//             brand={cafe}
//             loading={!cafe}
//             cartCount={cartItemCount}
//             onCartClick={() => setShowCart(true)}
//           />

//           <TableSelector
//             tableNumber={tableNumber}
//             setTableNumber={setTableNumber}
//           />
//         </div>
//       </div>

//       {/* 🔹 Sticky Section */}
//       <div
//         ref={stickyRef}
//         className={`sticky top-0 p-3 z-50 bg-gray-50 transition-transform duration-300 ${
//           showSticky ? "translate-y-0 shadow-sm" : "-translate-y-0"
//         }`}
//       >
//         <div className="max-w-7xl mx-auto">
//           <p className="text-md font-semibold text-gray-400 -mb-3">Our Food</p>

//           <div className="flex justify-between items-center my-4">
//             <h1 className="theme-text text-3xl font-semibold">
//               Special For You
//             </h1>
//             <span className="text-sm text-gray-500">
//               {filteredMenu.length} items
//             </span>
//           </div>

//           <SearchBar value={search} onChange={setSearch} />

//           <div className="overflow-x-auto scrollbar-hide">
//             <div className="flex gap-3 min-w-max">
//               <CategoryFilter
//                 categories={categories}
//                 selectedCategory={selectedCategory}
//                 onSelect={loadMenu}
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* 🔹 Main Content */}
//       <div className="p-4 pb-4">
//         <TopActions
//           orderCount={orderCount}
//           cartLength={cartItemCount}
//           navigate={navigate}
//           cafeId={cafeId}
//           tableNumber={tableNumber}
//           setShowCart={setShowCart}
//         />

//         <div className="max-w-7xl mx-auto">
//           <MenuContent
//             loading={loading}
//             items={filteredMenu}
//             onItemClick={setSelectedItem}
//           />
//         </div>

//         <CartSidebar
//           cart={cart}
//           total={total}
//           showCart={showCart}
//           setShowCart={setShowCart}
//           placeOrder={placeOrder}
//           removeFromCart={removeFromCart}
//           addToCart={addToCart}
//           tableNumber={tableNumber}
//         />

//         {selectedItem && (
//           <ItemModal
//             item={selectedItem}
//             onClose={() => setSelectedItem(null)}
//             addToCart={addToCart}
//           />
//         )}
//       </div>

//       {/* 🔹 Floating Cart */}
//       <FloatingCart
//         show={showFloatingCart}
//         itemCount={cartItemCount}
//         total={total}
//         onClick={() => setShowCart(true)}
//       />
//     </div>
//   );
// };

// export default Menu;



// // ==============================================================================================================================



import { useSearchParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

// COMPONENTS
import Header from "../components/common/Header";
import CategoryFilter from "../components/menu/CategoryFilter";
import CartSidebar from "../components/cart/CartSidebar";
import FloatingCart from "../components/menu/FloatingCart";
import SearchBar from "../components/menu/SearchBar";
import MenuContent from "../components/menu/MenuContent";
import TableModal from "../components/menu/TableModal"; // 🌟 NEW
import TopActions from "../components/menu/TopActions";
import ItemModal from "../components/menu/ItemModal";

// HOOKS
import useMenu from "../hooks/useMenu";
import useCart from "../hooks/useCart";
import useSession from "../hooks/useSession";
import useSocket from "../hooks/useSocket";
import useOrderCount from "../hooks/useOrderCount";
import useStickyScroll from "../hooks/useStickyScroll";
import useCafe from "../hooks/useCafe";
import useThemeColor from "../hooks/useThemeColor";
import usePayment from "../hooks/usePayment";

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
  // Open modal automatically if no table is selected yet
  const [showTableModal, setShowTableModal] = useState(!tableFromURL); 
  const [search, setSearch] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // 🔹 Hooks
  useSession();
  useSocket(cafeId);
  
  const { showSticky, stickyRef } = useStickyScroll();
  const { cafe } = useCafe(cafeId);
  useThemeColor(cafe?.themeColor);
  
  const { menu, categories, selectedCategory, loadMenu, loading } = useMenu(cafeId);
  const { cart, addToCart, removeFromCart, total, setCart, setSelectedOptions } = useCart();
  const orderCount = useOrderCount(cafeId, tableNumber);
  const { payAndPlaceOrder } = usePayment();

  // 🔹 Effects
  useEffect(() => {
    if (cafe?.name) document.title = `${cafe.name} | Menu`;
  }, [cafe]);

  useEffect(() => {
    // Lock scroll if Cart, Item Modal, OR Table Modal is open
    const shouldLockScroll = showCart || Boolean(selectedItem) || showTableModal;
    document.body.style.overflow = shouldLockScroll ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selectedItem, showCart, showTableModal]);

  // 🔹 Derived State
  const filteredMenu = menu.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );
  const cartItemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const showFloatingCart = cartItemCount > 0 && !showCart && !selectedItem && !showTableModal;

  // 🔹 Actions
  const placeOrder = async () => {
    const sessionId = localStorage.getItem("sessionId");

    if (!cafeId) {
      toast.error("Invalid cafe. Please scan QR again.");
      return;
    }
    if (!tableNumber) {
      toast.warning("Please select a table number.");
      setShowTableModal(true); // Force open modal if they try to checkout without a table
      return;
    }
    if (!cart.length) {
      toast.warning("Your cart is empty.");
      return;
    }

    await payAndPlaceOrder({
      cart, tableNumber, cafeId, sessionId,
      cafeName: cafe?.name, themeColor: cafe?.themeColor,
    });

    setCart([]);
    setSelectedOptions({});
    setShowCart(false);
    toast.success("Payment successful — order placed");
    navigate(`/status?cafe=${cafeId}&table=${tableNumber}`);
  };

  // 🔹 UI
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 antialiased">
      
      {/* 🔝 Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Header
            brand={cafe}
            loading={!cafe}
            cartCount={cartItemCount}
            onCartClick={() => setShowCart(true)}
            onTableClick={() => setShowTableModal(true)} // 🌟 Open Modal
            tableNumber={tableNumber} // 🌟 Pass Table Number
          />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-32">
        
        {/* 🔹 Sticky Section (Search & Categories) */}
        <div
          ref={stickyRef}
          className={`sticky top-[68px] z-40 bg-gray-50/95 backdrop-blur-md py-4 transition-all duration-300 ${
            showSticky ? "shadow-[0_2px_3px_-1px_rgba(20,83,45,0.2)] -mx-4 px-4 sm:-mx-6 sm:px-6" : ""
          }`}
        >
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-xs font-semibold text-[#14532d] uppercase tracking-wider mb-1">
                Our Menu
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Special For You
              </h1>
            </div>
            <span className="text-sm font-medium text-gray-500 whitespace-nowrap ml-4">
              {filteredMenu.length} items
            </span>
          </div>

          <SearchBar value={search} onChange={setSearch} />

          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelect={loadMenu}
          />
        </div>

        {/* 🔹 Main Content */}
        <div className="mt-6">
          <MenuContent
            loading={loading}
            items={filteredMenu}
            onItemClick={setSelectedItem}
          />
        </div>
      </main>

      {/* 🔹 Floating & Modals */}
      <TopActions
        orderCount={orderCount}
        navigate={navigate}
        cafeId={cafeId}
        tableNumber={tableNumber}
      />

      <FloatingCart
        show={showFloatingCart}
        itemCount={cartItemCount}
        total={total}
        onClick={() => setShowCart(true)}
      />

      {/* 🌟 Table Modal Overlay */}
      <TableModal
        isOpen={showTableModal}
        onClose={() => setShowTableModal(false)}
        onSelect={setTableNumber}
        cafeId={cafeId}
        navigate={navigate}
        currentTable={tableNumber}
      />

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
        <ItemModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          addToCart={addToCart}
        />
      )}
    </div>
  );
};

export default Menu;