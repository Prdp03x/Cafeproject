const express = require("express");
const router = express.Router();
const { orderLimiter } = require("../middleware/rateLimiters");

const { createPaymentOrder, verifyPayment } = require("../controllers/paymentController");

// PUBLIC — customer checkout flow
router.post("/create-order", orderLimiter, createPaymentOrder);
router.post("/verify", orderLimiter, verifyPayment);

// NOTE: the Razorpay webhook (POST /api/payments/webhook) is registered
// directly in server.js, BEFORE express.json(), because its signature
// verification needs the raw request body.

module.exports = router;
