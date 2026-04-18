const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const {
  createOrder,
  getAdminOrders,
  getCustomerOrders,
  updateOrder,
  deleteOrder,
  getOrderById,
} = require("../controllers/orderController");

// CREATE
router.post("/", createOrder);

// ADMIN
router.get("/admin", auth, getAdminOrders);

// CUSTOMER
router.get("/customer", getCustomerOrders);

// UPDATE
router.put("/:id", auth, updateOrder);

// DELETE
router.delete("/:id", auth, deleteOrder);

// GET SINGLE
router.get("/:id", getOrderById);

module.exports = router;