const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { orderLimiter } = require("../middleware/rateLimiters");
const adminOnly = require("../middleware/adminOnly");

const {
  getAdminOrders,
  getCustomerOrders,
  getBillingOrders,
  updateOrder,
  deleteOrder,
  getOrderById,
} = require("../controllers/orderController");

// PUBLIC
// NOTE: orders are now created only after a verified Razorpay payment —
// see POST /api/payments/create-order and /api/payments/verify.
router.get("/customer", getCustomerOrders);

// ADMIN (specific paths BEFORE /:id wildcard)
router.get("/admin", auth, adminOnly, getAdminOrders);
router.get("/billing", auth, adminOnly, getBillingOrders);

// WILDCARD - single order lookup
router.get("/:id", getOrderById);

// ADMIN mutations
router.put("/:id", auth, adminOnly, updateOrder);
router.delete("/:id", auth, adminOnly, deleteOrder);

module.exports = router;
