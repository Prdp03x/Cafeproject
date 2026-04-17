const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const DEFAULT_CAFE_ID = "69e0da3fc53d76f3adcf4da8";
const mongoose = require("mongoose");
const auth = require("../middleware/auth");

router.post("/", async (req, res) => {
  try {
    const { items, tableNumber, cafeId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No items in order" });
    }

    if (!tableNumber) {
      return res.status(400).json({ error: "Table number required" });
    }

    const total = items.reduce((sum, item) => {
      const extras =
        item.selectedOptions?.reduce(
          (s, opt) => s + opt.price,
          0
        ) || 0;

      return sum + (item.price + extras) * item.qty;
    }, 0);

    const newOrder = new Order({
      cafeId: new mongoose.Types.ObjectId(cafeId),
      items,
      total,
      tableNumber, // ✅ now valid
      status: "pending",
    });

    await newOrder.save();

    res.json({
      message: "Order placed",
      orderId: newOrder._id,
    });

    

  } catch (err) {
    console.error("🔥 ORDER ERROR:", err); // 👈 ADD THIS
    res.status(500).json({ error: err.message });
  }
});

// Get all orders
router.get("/admin", auth, async (req, res) => {
  try {
    const orders = await Order.find({cafeId: req.cafeId}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update order
router.put("/:id", auth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    await Order.findByIdAndUpdate({_id:req.params.id,  cafeId: req.cafeId}, { status });

    res.json({ message: "Order updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete order
router.delete("/:id", auth, async (req, res) => {
  try {
    await Order.findByIdAndDelete({ _id: req.params.id, cafeId: req.cafeId });
    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//get Id details
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;