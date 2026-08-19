const express = require("express");
const router = express.Router();
const { paymentLimiter } = require("../middleware/rateLimiters");
const { validateCreateOrder, validateVerifyPayment, validateMarkFailed } = require("../middleware/validatePayment");

const { createPaymentOrder, verifyPayment, markPaymentFailed } = require("../controllers/paymentController");

// PUBLIC — customer checkout flow
// 🔥 FIX #8: Using strict paymentLimiter (5 attempts per 15 minutes)
// 🔥 FIX #9: Added validation middleware to prevent injection attacks
router.post("/create-order", paymentLimiter, validateCreateOrder, createPaymentOrder);
router.post("/verify", paymentLimiter, validateVerifyPayment, verifyPayment);
router.post("/mark-failed", paymentLimiter, validateMarkFailed, markPaymentFailed); // 🔥 FIX #5

// NOTE: the Razorpay webhook (POST /api/payments/webhook) is registered
// directly in server.js, BEFORE express.json(), because its signature
// verification needs the raw request body.

module.exports = router;
