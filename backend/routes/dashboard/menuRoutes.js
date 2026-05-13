const express = require("express");

const router = express.Router();

const auth = require("../../middleware/auth");

const adminOnly = require("../../middleware/adminOnly");

const {
  getMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require("../../controllers/dashboard/menuController");

router.get(
  "/",
  auth,
  getMenu
);

router.post(
  "/",
  auth,
  adminOnly,
  createMenuItem
);

router.put(
  "/:id",
  auth,
  adminOnly,
  updateMenuItem
);

router.delete(
  "/:id",
  auth,
  adminOnly,
  deleteMenuItem
);

module.exports = router;