const crypto    = require("crypto");
const mongoose  = require("mongoose");
const { razorpayForCafe, decrypt } = require("../config/razorpay");
const Cafe      = require("../models/Cafe");
const Order     = require("../models/Order");
const { calculateTotal } = require("./orderController");

// STEP 1 — customer taps "Pay & Place Order"
exports.createPaymentOrder = async (req, res) => {
  try {
    const { items, tableNumber, sessionId, cafeId } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ error: "No items in order" });
    if (!tableNumber)
      return res.status(400).json({ error: "Table number required" });
    if (!sessionId)
      return res.status(400).json({ error: "Session ID required" });
    if (!mongoose.Types.ObjectId.isValid(cafeId))
      return res.status(400).json({ error: "Invalid cafeId" });

    const cafe = await Cafe.findById(cafeId);
    if (!cafe) return res.status(404).json({ error: "Cafe not found" });

    // Build a per-café Razorpay instance from their encrypted keys
    let cafeRazorpay;
    try {
      cafeRazorpay = razorpayForCafe(cafe.razorpay?.keyId, cafe.razorpay?.keySecret);
    } catch {
      return res.status(400).json({
        error: "This café has not set up its Razorpay keys. Contact the café owner.",
      });
    }

    // ── Re-price every item from the database ──────────────────────────────
    // NEVER trust client-supplied prices. Look up each item in the MenuItem
    // collection (scoped to this café) and use only the server-side price.
    const MenuItem = require("../models/MenuItem");

    const verifiedItems = [];
    for (const clientItem of items) {
      const dbItem = await MenuItem.findOne({
        _id:    clientItem._id,
        cafeId: new mongoose.Types.ObjectId(cafeId),
      });

      if (!dbItem) {
        return res.status(400).json({
          error: `Item not found or does not belong to this café: ${clientItem._id}`,
        });
      }

      // Verify each selected option against the DB definition
      const verifiedOptions = [];
      for (const clientOpt of clientItem.selectedOptions || []) {
        // Find the matching choice across all option groups on this menu item
        let dbChoice = null;
        for (const optGroup of dbItem.options || []) {
          const found = optGroup.choices.find((c) => c.name === clientOpt.name);
          if (found) { dbChoice = found; break; }
        }

        if (!dbChoice) {
          return res.status(400).json({
            error: `Invalid option "${clientOpt.name}" for item "${dbItem.name}"`,
          });
        }

        verifiedOptions.push({ name: dbChoice.name, price: dbChoice.price });
      }

      verifiedItems.push({
        _id:             dbItem._id,
        name:            dbItem.name,          // use DB name, not client name
        price:           dbItem.price,         // use DB price, not client price
        qty:             clientItem.qty,        // qty is still from client (validated by middleware: 1–100)
        selectedOptions: verifiedOptions,       // options re-priced from DB
      });
    }
    // ── End re-pricing ─────────────────────────────────────────────────────

    const GST_RATE = 0.05;
    const subtotal = calculateTotal(verifiedItems);   // now uses only DB prices
    if (subtotal <= 0)
      return res.status(400).json({ error: "Invalid order total" });

    const total         = Math.round(subtotal * (1 + GST_RATE));
    const amountInPaise = Math.round(total * 100);

    // Create local "pending payment" order — hidden from kitchen queue until verified
    const localOrder = new Order({
      cafeId:      new mongoose.Types.ObjectId(cafeId),
      items:       verifiedItems,   // store DB-verified items, not raw client items
      total,
      tableNumber: String(tableNumber),
      sessionId,
      status:      "awaiting_payment",
      payment:     { status: "created" },
    });
    await localOrder.save();

    const razorpayOrder = await cafeRazorpay.orders.create({
      amount:          amountInPaise,
      currency:        "INR",
      partial_payment: false,
      notes: {
        internalOrderId: localOrder._id.toString(),
        cafeId:          cafeId.toString(),
      },
    });

    localOrder.payment.razorpayOrderId = razorpayOrder.id;
    await localOrder.save();

    res.json({
      internalOrderId: localOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount:          amountInPaise,
      currency:        "INR",
      keyId:           decrypt(cafe.razorpay.keyId), // send decrypted public key to frontend
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not start payment" });
  }
};

// STEP 2 — verify Razorpay signature after client-side checkout succeeds
exports.verifyPayment = async (req, res) => {
  try {
    const {
      internalOrderId,
      razorpay_order_id:   razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature:  razorpaySignature,
    } = req.body;

    if (!internalOrderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature)
      return res.status(400).json({ error: "Missing payment details" });

    // Load the order → then the café → decrypt their secret for HMAC
    const pendingOrder = await Order.findById(internalOrderId);
    if (!pendingOrder)
      return res.status(404).json({ error: "Order not found" });

    const cafe = await Cafe.findById(pendingOrder.cafeId);
    if (!cafe || !cafe.razorpay?.keySecret)
      return res.status(400).json({ error: "Café payment config missing" });

    const cafeSecret = decrypt(cafe.razorpay.keySecret);

    const expectedSignature = crypto
      .createHmac("sha256", cafeSecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature)
      return res.status(400).json({ error: "Payment verification failed" });

    // Atomic update — prevents race condition from double-clicks / refresh
    const order = await Order.findOneAndUpdate(
      {
        _id:                         internalOrderId,
        "payment.razorpayOrderId":   razorpayOrderId,
        "payment.status":            "created",
      },
      {
        $set: {
          status:                        "pending",
          "payment.status":              "paid",
          "payment.razorpayPaymentId":   razorpayPaymentId,
        },
      },
      { returnDocument: "after" },
    );

    if (!order) {
      // Either doesn't exist or already processed
      const existingOrder = await Order.findById(internalOrderId);
      if (!existingOrder)
        return res.status(404).json({ error: "Order not found" });

      if (existingOrder.payment.status === "paid") {
        const io = req.app.get("io");
        io.to(existingOrder.cafeId.toString()).emit("newOrder", existingOrder);
        return res.json({ message: "Payment already verified", order: existingOrder });
      }
      return res.status(400).json({ error: "Payment verification failed" });
    }

    const io = req.app.get("io");
    io.to(order.cafeId.toString()).emit("newOrder", order);
    res.json({ message: "Payment verified", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Mark payment as failed (for analytics / retry logic)
exports.markPaymentFailed = async (req, res) => {
  try {
    const { internalOrderId, razorpayOrderId, errorCode, errorDescription } = req.body;

    if (!internalOrderId || !razorpayOrderId)
      return res.status(400).json({ error: "Missing required fields" });

    const order = await Order.findOneAndUpdate(
      {
        _id:                       internalOrderId,
        "payment.razorpayOrderId": razorpayOrderId,
        "payment.status":          "created",
      },
      {
        $set: {
          "payment.status":        "failed",
          "payment.failureReason": errorDescription || "Unknown error",
          "payment.failureCode":   errorCode || "UNKNOWN",
          "payment.failedAt":      new Date(),
        },
      },
      { returnDocument: "after" },
    );

    if (order) {
      res.json({ message: "Payment failure recorded" });
    } else {
      res.status(404).json({ error: "Order not found or already processed" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// STEP 3 (safety net) — Razorpay webhook for payment.captured
// Covers the case where the browser closes before /verify completes
exports.razorpayWebhook = async (req, res) => {
  try {
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      console.error("CRITICAL: RAZORPAY_WEBHOOK_SECRET not configured");
      return res.status(500).json({ error: "Webhook not configured" });
    }

    const signature = req.headers["x-razorpay-signature"];
    if (!signature)
      return res.status(400).json({ error: "Missing webhook signature" });

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body) // raw Buffer — see server.js mounting
      .digest("hex");

    if (signature !== expectedSignature)
      return res.status(400).json({ error: "Invalid webhook signature" });

    const payload = JSON.parse(req.body.toString("utf8"));

    if (payload.event === "payment.captured") {
      const razorpayOrderId   = payload.payload?.payment?.entity?.order_id;
      const razorpayPaymentId = payload.payload?.payment?.entity?.id;

      const order = await Order.findOne({ "payment.razorpayOrderId": razorpayOrderId });

      if (order && order.payment.status !== "paid") {
        order.status                    = "pending";
        order.payment.status            = "paid";
        order.payment.razorpayPaymentId = razorpayPaymentId;
        await order.save();

        const io = req.app.get("io");
        io.to(order.cafeId.toString()).emit("newOrder", order);
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Webhook processing failed" });
  }
};
