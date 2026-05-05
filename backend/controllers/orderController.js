const Order = require("../models/Order");
const mongoose = require("mongoose");

// 🔥 CREATE ORDER
exports.createOrder = async (req, res) => {
  try {
    const { items, tableNumber, sessionId, cafeId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No items in order" });
    }

    if (!tableNumber) {
      return res.status(400).json({ error: "Table number required" });
    }

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID required" });
    }

    if (!mongoose.Types.ObjectId.isValid(cafeId)) {
      return res.status(400).json({ error: "Invalid cafeId" });
    }

    const total = items.reduce((sum, item) => {
      const extras =
        item.selectedOptions?.reduce((s, opt) => s + opt.price, 0) || 0;

      return sum + (item.price + extras) * item.qty;
    }, 0);

    const newOrder = new Order({
      cafeId: new mongoose.Types.ObjectId(cafeId),
      items,
      total,
      tableNumber: String(tableNumber),
      sessionId,
      status: "pending",
    });

    await newOrder.save();

    // 🔥 SOCKET
    const io = req.app.get("io");
    io.to(cafeId).emit("newOrder", newOrder);

    res.json({
      message: "Order placed",
      orderId: newOrder._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🔥 ADMIN ORDERS
// exports.getAdminOrders = async (req, res) => {
//   try {
//     const orders = await Order.find({ cafeId: req.cafeId }).sort({
//       createdAt: -1,
//     });

//     res.json(orders);
//   } catch (err) {
//     res.status(500).json({ error: "Internal server error" });
//   }
// };
exports.getAdminOrders = async (req, res) => {
  try {
    const cafeId = req.cafeId; // ✅ from auth middleware

    if (!cafeId) {
      return res.status(400).json({ error: "Cafe ID missing in token" });
    }

    const orders = await Order.find({
      cafeId: new mongoose.Types.ObjectId(cafeId),
    }).sort({ createdAt: -1 });

    res.json(orders);

    // console.log("Token cafeId:", req.cafeId);
  } catch (err) {
    console.error(err); // 🔥 useful for debugging
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🔥 CUSTOMER ORDERS
exports.getCustomerOrders = async (req, res) => {
  try {
    const { cafeId, tableNumber, sessionId } = req.query;

    if (!cafeId || !tableNumber || !sessionId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const orders = await Order.find({
      cafeId: new mongoose.Types.ObjectId(cafeId),
      tableNumber: String(tableNumber),
      sessionId: sessionId,
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🔥 UPDATE ORDER
exports.updateOrder = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: req.params.id, cafeId: req.cafeId },
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    const io = req.app.get("io");
    io.to(req.cafeId.toString()).emit("orderUpdated", {
      id: req.params.id,
      status,
    });

    res.json({ message: "Order updated" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🔥 DELETE ORDER
exports.deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await Order.findOneAndDelete({
      _id: req.params.id,
      cafeId: req.cafeId,
    });

    if (!deletedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    const io = req.app.get("io");
    io.to(req.cafeId.toString()).emit("orderDeleted", req.params.id);

    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🔥 GET SINGLE ORDER
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};
