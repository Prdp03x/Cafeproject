const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { orderLimiter } = require("../middleware/rateLimiters");
const adminOnly = require("../middleware/adminOnly");

const {
  createOrder,
  getAdminOrders,
  getCustomerOrders,
  getBillingOrders,
  updateOrder,
  deleteOrder,
  getOrderById,
} = require("../controllers/orderController");

// PUBLIC
router.post("/", orderLimiter, createOrder);
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
