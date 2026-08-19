const crypto = require("crypto");
const mongoose = require("mongoose");
const { razorpay } = require("../config/razorpay");
const Cafe = require("../models/Cafe");
const Order = require("../models/Order");
const { calculateTotal } = require("./orderController");

// STEP 1 — customer taps "Pay & Place Order":
// validate the cart, work out the real total server-side, split the payment
// between the platform (commission) and the café's linked Razorpay account,
// and hand back a Razorpay order for the frontend Checkout widget to open.
exports.createPaymentOrder = async (req, res) => {
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

    const cafe = await Cafe.findById(cafeId);
    if (!cafe) {
      return res.status(404).json({ error: "Cafe not found" });
    }

    const isLinkedAccountActive =
      cafe.razorpay?.accountStatus === "activated" && cafe.razorpay?.accountId;

    // DEV-ONLY BYPASS: lets you test checkout before a cafe's Razorpay
    // linked account is onboarded. Falls back to a plain order with no
    // transfer split. Gated behind NODE_ENV so this can't run in production.
    if (!isLinkedAccountActive && process.env.NODE_ENV === "production") {
      return res.status(400).json({
        error: "This cafe hasn't finished setting up online payments yet.",
      });
    }

    const total = calculateTotal(items);
    if (total <= 0) {
      return res.status(400).json({ error: "Invalid order total" });
    }

    const amountInPaise = Math.round(total * 100);
    const commissionPercent = cafe.razorpay?.commissionPercent ?? 5;
    const cafeShareInPaise = Math.round(
      amountInPaise * (1 - commissionPercent / 100)
    );

    const localOrder = new Order({
      cafeId: new mongoose.Types.ObjectId(cafeId),
      items,
      total,
      tableNumber: String(tableNumber),
      sessionId,
      status: "awaiting_payment",
      payment: { status: "created" },
    });
    await localOrder.save();

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      partial_payment: false,
      notes: {
        internalOrderId: localOrder._id.toString(),
        cafeId: cafeId.toString(),
      },
      ...(isLinkedAccountActive && {
        transfers: [
          {
            account: cafe.razorpay.accountId,
            amount: cafeShareInPaise,
            currency: "INR",
            on_hold: false,
          },
        ],
      }),
    });

    localOrder.payment.razorpayOrderId = razorpayOrder.id;
    await localOrder.save();

    res.json({
      internalOrderId: localOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not start payment" });
  }
};

// STEP 2 — Razorpay Checkout succeeds client-side and hands us back the
// order/payment/signature trio. We verify it server-side before treating
// the order as real (this is the step that actually confirms payment).
exports.verifyPayment = async (req, res) => {
  try {
    const {
      internalOrderId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    } = req.body;

    if (!internalOrderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ error: "Missing payment details" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ error: "Payment verification failed" });
    }

    const order = await Order.findById(internalOrderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Idempotent — a webhook or a page refresh could call this twice.
    if (order.payment.status !== "paid") {
      order.status = "pending";
      order.payment.status = "paid";
      order.payment.razorpayPaymentId = razorpayPaymentId;
      await order.save();

      const io = req.app.get("io");
      io.to(order.cafeId.toString()).emit("newOrder", order);
    }

    res.json({ message: "Payment verified", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// STEP 3 (safety net) — Razorpay's webhook for payment.captured. Covers the
// case where the customer's browser closes/drops connection right after
// paying, before the /verify call above completes.
exports.razorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body) // raw Buffer — see server.js mounting
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).json({ error: "Invalid webhook signature" });
    }

    const payload = JSON.parse(req.body.toString("utf8"));

    if (payload.event === "payment.captured") {
      const razorpayOrderId = payload.payload?.payment?.entity?.order_id;
      const razorpayPaymentId = payload.payload?.payment?.entity?.id;

      const order = await Order.findOne({ "payment.razorpayOrderId": razorpayOrderId });

      if (order && order.payment.status !== "paid") {
        order.status = "pending";
        order.payment.status = "paid";
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
