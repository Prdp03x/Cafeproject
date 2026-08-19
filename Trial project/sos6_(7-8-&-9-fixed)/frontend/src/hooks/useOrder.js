import API from "../api/api";

const useOrder = () => {
  const placeOrder = async ({ cart, total, tableNumber, cafeId }) => {
    const sessionId = localStorage.getItem("sessionId");

    await API.post("/orders", {
      items: cart,
      total,
      tableNumber,
      cafeId,
      sessionId,
    });
  };

  return { placeOrder };
};

export default useOrder;