const Order = require("../models/Order");
const mongoose = require("mongoose");

// Server-side total calculation — never trust a client-supplied total.
const calculateTotal = (items) =>
  items.reduce((sum, item) => {
    const extras =
      item.selectedOptions?.reduce((s, opt) => s + opt.price, 0) || 0;
    return sum + (item.price + extras) * item.qty;
  }, 0);

exports.calculateTotal = calculateTotal;

// ADMIN ORDERS (live queue — excludes orders removed from queue)
exports.getAdminOrders = async (req, res) => {
  try {
    const cafeId = req.cafeId;

    if (!cafeId) {
      return res.status(400).json({ error: "Cafe ID missing in token" });
    }

    const orders = await Order.find({
      cafeId: new mongoose.Types.ObjectId(cafeId),
      archivedFromQueue: { $ne: true },
      status: { $ne: "awaiting_payment" }, // hide unpaid/abandoned carts from the kitchen queue
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// BILLING ORDERS — all orders for a given date
exports.getBillingOrders = async (req, res) => {
  try {
    const cafeId = req.cafeId;

    if (!cafeId) {
      return res.status(400).json({ error: "Cafe ID missing in token" });
    }

    if (!mongoose.Types.ObjectId.isValid(cafeId)) {
      return res.status(400).json({ error: "Invalid cafe ID in token" });
    }

    const { date } = req.query;

    let startOfDay, endOfDay;

    if (date) {
      startOfDay = new Date(`${date}T00:00:00.000Z`);
      endOfDay   = new Date(`${date}T23:59:59.999Z`);
    } else {
      const now = new Date();
      startOfDay = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0)
      );
      endOfDay = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999)
      );
    }

    const orders = await Order.find({
      cafeId: new mongoose.Types.ObjectId(cafeId),
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: "awaiting_payment" }, // unpaid/abandoned carts never became real orders
    }).sort({ createdAt: -1 });

    const summary = {
      total:     orders.length,
      completed: orders.filter((o) => o.status === "completed").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
      pending:   orders.filter((o) => o.status === "pending").length,
      preparing: orders.filter((o) => o.status === "preparing").length,
      revenue:   orders
        .filter((o) => o.status === "completed")
        .reduce((sum, o) => sum + (o.total || 0), 0),
      grossTotal: orders.reduce((sum, o) => sum + (o.total || 0), 0),
    };

    res.json({ orders, summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// CUSTOMER ORDERS
exports.getCustomerOrders = async (req, res) => {
  try {
    const { cafeId, tableNumber } = req.query;

    if (!cafeId || !tableNumber) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!mongoose.Types.ObjectId.isValid(cafeId)) {
      return res.status(400).json({ error: "Invalid cafeId" });
    }

    const orders = await Order.find({
      cafeId: new mongoose.Types.ObjectId(cafeId),
      tableNumber: String(tableNumber),
      archivedFromQueue: { $ne: true },
      status: { $ne: "awaiting_payment" },
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// UPDATE ORDER STATUS
exports.updateOrder = async (req, res) => {
  try {
    const { status, cancelReason, cancelNote } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const VALID_STATUSES = ["pending", "preparing", "completed", "cancelled"];
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    // ── Validate cancel reason when cancelling ────────────────────────────
    const VALID_REASONS = ["entry_error", "customer_changed_mind", "item_unavailable", "other"];

    if (status === "cancelled") {
      if (!cancelReason) {
        return res.status(400).json({ error: "Cancel reason is required" });
      }
      if (!VALID_REASONS.includes(cancelReason)) {
        return res.status(400).json({ error: "Invalid cancel reason" });
      }
    }

    // Build update payload
    const updatePayload = { status };

    if (status === "cancelled") {
      updatePayload.cancelReason  = cancelReason;
      updatePayload.cancelNote    = cancelNote?.trim()?.slice(0, 200) || null;
      updatePayload.cancelledAt   = new Date();
      updatePayload.cancelledBy   = "staff";
      // Also archive from live queue — cancelled orders don't belong in kitchen view
      updatePayload.archivedFromQueue = true;
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: req.params.id, cafeId: req.cafeId },
      updatePayload,
      { returnDocument: "after" }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    const io = req.app.get("io");
    io.to(req.cafeId.toString()).emit("orderUpdated", updatedOrder);

    res.json({
      message: "Order updated",
      order: updatedOrder,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// ARCHIVE ORDER FROM QUEUE — soft delete (keeps in DB for billing)
exports.deleteOrder = async (req, res) => {
  try {
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: req.params.id, cafeId: req.cafeId },
      { archivedFromQueue: true },
      { returnDocument: "after" }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    const io = req.app.get("io");
    io.to(req.cafeId.toString()).emit("orderDeleted", req.params.id);

    res.json({ message: "Order removed from queue", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET SINGLE ORDER
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
