const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { orderLimiter } = require("../middleware/rateLimiters");
const adminOnly = require("../middleware/adminOnly");

const {
  createOrder,
  getAdminOrders,
  getCustomerOrders,
  updateOrder,
  deleteOrder,
  getOrderById,
} = require("../controllers/orderController");

// CREATE
router.post("/", orderLimiter,createOrder);

// ADMIN
router.get("/admin", auth, adminOnly, getAdminOrders);

// CUSTOMER
router.get("/customer", getCustomerOrders);

// UPDATE
router.put("/:id", auth, adminOnly, updateOrder);

// DELETE
router.delete("/:id", auth, adminOnly, deleteOrder);

// GET SINGLE
router.get("/:id", getOrderById);

module.exports = router;