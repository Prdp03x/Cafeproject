// 🔥 FIX #9: Input validation middleware to prevent NoSQL injection and XSS
const mongoose = require("mongoose");

const validateCreateOrder = (req, res, next) => {
  const { items, tableNumber, sessionId, cafeId } = req.body;

  // Validate cafeId
  if (!cafeId || !mongoose.Types.ObjectId.isValid(cafeId)) {
    return res.status(400).json({ error: "Invalid cafe ID" });
  }

  // Validate sessionId (format: UUID or alphanumeric string)
  if (!sessionId || typeof sessionId !== "string" || sessionId.length < 10 || sessionId.length > 100) {
    return res.status(400).json({ error: "Invalid session ID" });
  }

  // Validate tableNumber (alphanumeric with dash/underscore only)
  if (!tableNumber || typeof tableNumber !== "string" || !/^[A-Za-z0-9\-_]+$/.test(tableNumber)) {
    return res.status(400).json({ error: "Invalid table number" });
  }

  // Validate items array
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    return res.status(400).json({ error: "Invalid items array" });
  }

  for (const item of items) {
    if (!item._id || !mongoose.Types.ObjectId.isValid(item._id)) {
      return res.status(400).json({ error: "Invalid item ID" });
    }

    if (!item.qty || typeof item.qty !== "number" || item.qty < 1 || item.qty > 100) {
      return res.status(400).json({ error: "Invalid quantity" });
    }

    // Validate selected options if present
    if (item.selectedOptions && !Array.isArray(item.selectedOptions)) {
      return res.status(400).json({ error: "Invalid selected options format" });
    }
  }

  next();
};

const validateVerifyPayment = (req, res, next) => {
  const {
    internalOrderId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  // Validate internal order ID
  if (!internalOrderId || !mongoose.Types.ObjectId.isValid(internalOrderId)) {
    return res.status(400).json({ error: "Invalid order ID" });
  }

  // Validate Razorpay order ID format (starts with "order_")
  if (!razorpay_order_id || typeof razorpay_order_id !== "string" || !/^order_[A-Za-z0-9]+$/.test(razorpay_order_id)) {
    return res.status(400).json({ error: "Invalid Razorpay order ID" });
  }

  // Validate Razorpay payment ID format (starts with "pay_")
  if (!razorpay_payment_id || typeof razorpay_payment_id !== "string" || !/^pay_[A-Za-z0-9]+$/.test(razorpay_payment_id)) {
    return res.status(400).json({ error: "Invalid Razorpay payment ID" });
  }

  // Validate signature format (64-character hex string)
  if (!razorpay_signature || typeof razorpay_signature !== "string" || !/^[a-f0-9]{64}$/.test(razorpay_signature)) {
    return res.status(400).json({ error: "Invalid signature format" });
  }

  next();
};

const validateMarkFailed = (req, res, next) => {
  const { internalOrderId, razorpayOrderId, errorCode, errorDescription } = req.body;

  if (!internalOrderId || !mongoose.Types.ObjectId.isValid(internalOrderId)) {
    return res.status(400).json({ error: "Invalid order ID" });
  }

  if (!razorpayOrderId || typeof razorpayOrderId !== "string" || !/^order_[A-Za-z0-9]+$/.test(razorpayOrderId)) {
    return res.status(400).json({ error: "Invalid Razorpay order ID" });
  }

  // Optional fields validation
  if (errorCode && (typeof errorCode !== "string" || errorCode.length > 50)) {
    return res.status(400).json({ error: "Invalid error code format" });
  }

  if (errorDescription && (typeof errorDescription !== "string" || errorDescription.length > 500)) {
    return res.status(400).json({ error: "Error description too long" });
  }

  next();
};

module.exports = { validateCreateOrder, validateVerifyPayment, validateMarkFailed };
