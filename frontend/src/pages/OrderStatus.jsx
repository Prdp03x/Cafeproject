// import { useCallback, useEffect, useState } from "react";
// import { useNavigate, useSearchParams } from "react-router";
// import EmptyState from "../components/Common/EmptyState";
// import API from "../api/api";
// import socket from "../socket";

// const OrderStatus = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const navigate = useNavigate();
//   const [params] = useSearchParams();

//   const cafeId = params.get("cafe");
//   const tableNumber = params.get("table");

//   useEffect(() => {
//     document.title = "Your Orders | My Cafe";
//   }, []);

//   // Fetch customer orders
//   const fetchOrders = useCallback(async () => {
//     try {
//       setLoading(true);

//       if (!cafeId || !tableNumber) {
//         console.warn("Missing cafeId or tableNumber");
//         setOrders([]);
//         return;
//       }

//       const res = await API.get("/orders/customer", {
//         params: { cafeId, tableNumber },
//       });

//       if (Array.isArray(res.data)) {
//         setOrders(res.data);
//       } else if (Array.isArray(res.data.orders)) {
//         setOrders(res.data.orders);
//       } else {
//         console.error("Invalid orders response:", res.data);
//         setOrders([]);
//       }
//     } catch (err) {
//       console.error("Error fetching orders:", err);
//       setOrders([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [cafeId, tableNumber]);

//   // Initial fetch
//   useEffect(() => {
//     if (!cafeId || !tableNumber) return;

//     fetchOrders();
//   }, [cafeId, tableNumber, fetchOrders]);

//   // Realtime socket updates
//   useEffect(() => {
//     if (!cafeId) return;

//     socket.emit("joinCafe", cafeId);

//     socket.on("orderUpdated", () => {
//       fetchOrders();
//     });

//     socket.on("orderDeleted", (deletedOrderId) => {
//       setOrders((prevOrders) =>
//         prevOrders.filter(
//           (order) => order._id !== deletedOrderId
//         )
//       );
//     });

//     return () => {
//       socket.off("orderUpdated");
//       socket.off("orderDeleted");
//     };
//   }, [cafeId, fetchOrders]);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-5">
//       <div className="max-w-xl mx-auto">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-3xl font-bold tracking-tight">
//             🧾 Your Orders
//           </h1>

//           <button
//             onClick={() =>
//               navigate(`/?cafe=${cafeId}&table=${tableNumber}`)
//             }
//             className="bg-black text-white px-5 py-2 rounded-full shadow hover:scale-105 transition"
//           >
//             ← Menu
//           </button>
//         </div>

//         {/* Loading */}
//         {loading ? (
//           <div className="flex justify-center items-center py-20">
//             <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
//           </div>
//         ) : orders.length === 0 ? (
//           <EmptyState
//             title="No Active Orders"
//             subtitle="Place your order from the menu 🍽️"
//           />
//         ) : (
//           orders.map((order) => (
//             <div
//               key={order._id}
//               className="backdrop-blur-lg bg-white/70 border border-white/30 rounded-3xl shadow-lg p-6 mb-6 hover:shadow-xl transition"
//             >
//               {/* Order ID */}
//               <p className="text-xs text-gray-500 mb-3">
//                 Order #{order._id.slice(-6)}
//               </p>

//               {/* Items */}
//               {order.items.map((item, i) => {
//                 const extras =
//                   item.selectedOptions?.reduce(
//                     (s, o) => s + o.price,
//                     0
//                   ) || 0;

//                 const itemTotal =
//                   (item.price + extras) * item.qty;

//                 return (
//                   <div key={i} className="mb-3">
//                     <div className="flex justify-between font-medium">
//                       <span>
//                         {item.name}{" "}
//                         <span className="text-gray-400">
//                           ×{item.qty}
//                         </span>
//                       </span>

//                       <span>₹{itemTotal}</span>
//                     </div>

//                     {/* Options */}
//                     {item.selectedOptions?.map((opt, idx) => (
//                       <p
//                         key={idx}
//                         className="text-xs text-gray-500 ml-3"
//                       >
//                         + {opt.name} (₹{opt.price})
//                       </p>
//                     ))}
//                   </div>
//                 );
//               })}

//               {/* Total */}
//               <div className="flex justify-between font-bold text-lg mt-4 border-t pt-3">
//                 <span>Total</span>
//                 <span>₹{order.total}</span>
//               </div>

//               {/* Status */}
//               <div className="mt-5 flex items-center justify-between">
//                 <span
//                   className={`px-4 py-1 rounded-full text-white text-sm capitalize ${
//                     order.status === "completed"
//                       ? "bg-green-500"
//                       : order.status === "preparing"
//                       ? "bg-yellow-500 animate-pulse"
//                       : "bg-gray-400"
//                   }`}
//                 >
//                   {order.status || "pending"}
//                 </span>

//                 {order.status === "completed" && (
//                   <span className="text-green-600 font-medium text-sm animate-bounce">
//                     ✅ Ready to serve
//                   </span>
//                 )}

//                 {order.status === "preparing" && (
//                   <span className="text-yellow-600 text-sm flex items-center gap-1">
//                     👨‍🍳 Cooking...
//                   </span>
//                 )}

//                 {order.status === "pending" && (
//                   <span className="text-gray-500 text-sm">
//                     🕒 Waiting...
//                   </span>
//                 )}
//               </div>

//               {/* Progress Bar */}
//               <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
//                 <div
//                   className={`h-full transition-all duration-500 ${
//                     order.status === "completed"
//                       ? "w-full bg-green-500"
//                       : order.status === "preparing"
//                       ? "w-2/3 bg-yellow-500"
//                       : "w-1/4 bg-gray-400"
//                   }`}
//                 />
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default OrderStatus;


import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import EmptyState from "../components/Common/EmptyState";
import API from "../api/api";
import socket from "../socket";

const OrderStatus = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoaded, setInitialLoaded] = useState(false);

  const navigate = useNavigate();
  const [params] = useSearchParams();

  const cafeId = params.get("cafe");
  const tableNumber = params.get("table");

  useEffect(() => {
    document.title = "Your Orders | My Cafe";
  }, []);

  // Fetch customer orders
  const fetchOrders = useCallback(async () => {
    try {
      if (!initialLoaded) {
        setLoading(true);
      }

      if (!cafeId || !tableNumber) {
        console.warn("Missing cafeId or tableNumber");
        setOrders([]);
        return;
      }

      const res = await API.get("/orders/customer", {
        params: { cafeId, tableNumber },
      });

      if (Array.isArray(res.data)) {
        setOrders(res.data);
      } else if (Array.isArray(res.data.orders)) {
        setOrders(res.data.orders);
      } else {
        console.error("Invalid orders response:", res.data);
        setOrders([]);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
      setInitialLoaded(true);
    }
  }, [cafeId, tableNumber, initialLoaded]);

  // Initial fetch
  useEffect(() => {
    if (!cafeId || !tableNumber) return;

    fetchOrders();
  }, [cafeId, tableNumber, fetchOrders]);

  // Realtime socket updates
  useEffect(() => {
    if (!cafeId) return;

    socket.emit("joinCafe", cafeId);

    socket.on("orderUpdated", () => {
      fetchOrders();
    });

    socket.on("orderDeleted", (deletedOrderId) => {
      setOrders((prevOrders) =>
        prevOrders.filter(
          (order) => order._id !== deletedOrderId
        )
      );
    });

    return () => {
      socket.off("orderUpdated");
      socket.off("orderDeleted");
    };
  }, [cafeId, fetchOrders]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-5">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            🧾 Your Orders
          </h1>

          <button
            onClick={() =>
              navigate(`/?cafe=${cafeId}&table=${tableNumber}`)
            }
            className="bg-black text-white px-5 py-2 rounded-full shadow hover:scale-105 transition"
          >
            ← Menu
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            title="No Active Orders"
            subtitle="Place your order from the menu 🍽️"
          />
        ) : (
          orders.map((order) => (
            <div
              key={order._id}
              className="backdrop-blur-lg bg-white/70 border border-white/30 rounded-3xl shadow-lg p-6 mb-6 hover:shadow-xl transition"
            >
              {/* Order ID */}
              <p className="text-xs text-gray-500 mb-3">
                Order #{order._id.slice(-6)}
              </p>

              {/* Items */}
              {order.items.map((item, i) => {
                const extras =
                  item.selectedOptions?.reduce(
                    (s, o) => s + o.price,
                    0
                  ) || 0;

                const itemTotal =
                  (item.price + extras) * item.qty;

                return (
                  <div key={i} className="mb-3">
                    <div className="flex justify-between font-medium">
                      <span>
                        {item.name}{" "}
                        <span className="text-gray-400">
                          ×{item.qty}
                        </span>
                      </span>

                      <span>₹{itemTotal}</span>
                    </div>

                    {/* Options */}
                    {item.selectedOptions?.map((opt, idx) => (
                      <p
                        key={idx}
                        className="text-xs text-gray-500 ml-3"
                      >
                        + {opt.name} (₹{opt.price})
                      </p>
                    ))}
                  </div>
                );
              })}

              {/* Total */}
              <div className="flex justify-between font-bold text-lg mt-4 border-t pt-3">
                <span>Total</span>
                <span>₹{order.total}</span>
              </div>

              {/* Status */}
              <div className="mt-5 flex items-center justify-between">
                <span
                  className={`px-4 py-1 rounded-full text-white text-sm capitalize ${
                    order.status === "completed"
                      ? "bg-green-500"
                      : order.status === "preparing"
                      ? "bg-yellow-500 animate-pulse"
                      : "bg-gray-400"
                  }`}
                >
                  {order.status || "pending"}
                </span>

                {order.status === "completed" && (
                  <span className="text-green-600 font-medium text-sm animate-bounce">
                    ✅ Ready to serve
                  </span>
                )}

                {order.status === "preparing" && (
                  <span className="text-yellow-600 text-sm flex items-center gap-1">
                    👨‍🍳 Cooking...
                  </span>
                )}

                {order.status === "pending" && (
                  <span className="text-gray-500 text-sm">
                    🕒 Waiting...
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-[width] duration-700 ease-in-out ${
                    order.status === "completed"
                      ? "w-full bg-green-500"
                      : order.status === "preparing"
                      ? "w-2/3 bg-yellow-500"
                      : "w-1/4 bg-gray-400"
                  }`}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderStatus;
