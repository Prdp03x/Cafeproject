// const OrderCard = ({ order, isNew, updateStatus, deleteOrder }) => {
//   const getStatusColor = (status) => {
//     if (status === "completed") return "bg-green-100 text-green-600";
//     if (status === "preparing") return "bg-yellow-100 text-yellow-600";
//     return "bg-gray-100 text-gray-600";
//   };

//   return (
//     <div
//       className={`p-5 rounded-2xl shadow-sm transition ${
//         isNew
//           ? "bg-green-100 border-2 border-green-500 animate-pulse"
//           : "bg-white hover:shadow-md"
//       }`}
//     >
//       <p className="font-bold text-lg">
//         Table #{order.tableNumber}
//       </p>
//       <p className="text-xs text-gray-400 mb-2">
//         #{order._id.slice(-6)}
//       </p>

//       <div className="mb-4 space-y-3">
//         {order.items.map((item, i) => {
//           const extras =
//             item.selectedOptions?.reduce(
//               (sum, opt) => sum + opt.price,
//               0
//             ) || 0;

//           const itemTotal = (item.price + extras) * item.qty;

//           return (
//             <div key={i} className="border-b pb-2">
//               <div className="flex justify-between">
//                 <span>{item.name} x {item.qty}</span>
//                 <span>₹{itemTotal}</span>
//               </div>

//               {item.selectedOptions?.map((opt, idx) => (
//                 <p key={idx} className="text-xs text-gray-500">
//                   + {opt.name} (₹{opt.price})
//                 </p>
//               ))}
//             </div>
//           );
//         })}
//       </div>

//       <div className="flex justify-between font-bold mb-3">
//         <span>Total</span>
//         <span>₹{order.total}</span>
//       </div>

//       <div className="mb-3">
//         <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
//           {order.status || "pending"}
//         </span>
//       </div>

//       <div className="flex gap-2 flex-wrap">
//         <button
//           onClick={() => updateStatus(order._id, "preparing")}
//           className="flex-1 bg-yellow-400 text-white py-2 rounded-lg"
//         >
//           Preparing
//         </button>

//         <button
//           onClick={() => updateStatus(order._id, "completed")}
//           className="flex-1 bg-green-500 text-white py-2 rounded-lg"
//         >
//           Done
//         </button>

//         {order.status === "completed" && (
//           <button
//             onClick={() => deleteOrder(order._id)}
//             className="flex-1 bg-red-500 text-white py-2 rounded-lg"
//           >
//             Delete
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default OrderCard;

const OrderCard = ({ order, isNew, updateStatus, deleteOrder }) => {
  const status = order.status || "pending";

  const statusBar = {
    pending: "bg-gray-400",
    preparing: "bg-yellow-400",
    completed: "bg-green-500",
  };

  return (
    <div
      className={`relative bg-white rounded-xl border overflow-hidden transition ${
        isNew ? "ring-2 ring-green-400" : "hover:shadow-md"
      }`}
    >
      {/* 🔥 TOP STATUS BAR */}
      <div className={`h-1 w-full ${statusBar[status]}`} />

      <div className="flex gap-3 p-3">

        {/* 🧾 LEFT: Identity */}
        <div className="min-w-[60px] text-center">
          <p className="text-xs text-gray-400">Table</p>
          <p className="text-lg font-bold">{order.tableNumber}</p>
          <p className="text-[10px] text-gray-400">
            #{order._id.slice(-4)}
          </p>
        </div>

        {/* 🍔 CENTER: Items */}
        <div className="flex-1 space-y-1 text-xs max-h-20 overflow-hidden">
          {order.items.slice(0, 3).map((item, i) => (
            <div key={i} className="flex justify-between">
              <span className="truncate">
                {item.name} ×{item.qty}
              </span>
              <span>₹{item.price * item.qty}</span>
            </div>
          ))}

          {order.items.length > 3 && (
            <p className="text-gray-400 text-[10px]">
              +{order.items.length - 3} more
            </p>
          )}
        </div>

        {/* ⚡ RIGHT: Actions */}
        <div className="flex flex-col gap-1">
          {status !== "preparing" && (
            <button
              onClick={() => updateStatus(order._id, "preparing")}
              className="text-[10px] px-2 py-1 bg-yellow-400 text-white rounded-md"
            >
              Prep
            </button>
          )}

          {status !== "completed" && (
            <button
              onClick={() => updateStatus(order._id, "completed")}
              className="text-[10px] px-2 py-1 bg-green-500 text-white rounded-md"
            >
              Done
            </button>
          )}

          {status === "completed" && (
            <button
              onClick={() => deleteOrder(order._id)}
              className="text-[10px] px-2 py-1 bg-red-500 text-white rounded-md"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 💰 Bottom strip */}
      <div className="flex justify-between items-center px-3 py-2 border-t text-xs bg-gray-50">
        <span className="font-medium">₹{order.total}</span>

        <span className="capitalize text-gray-500">
          {status}
        </span>
      </div>
    </div>
  );
};

export default OrderCard;