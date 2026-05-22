const express = require("express");
const router = express.Router();
const MenuItem = require("../models/MenuItem");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");
const menuController = require("../controllers/menuController");

// Public routes (customer-facing)
// GET /api/menu?cafeId=xxx&category=yyy
router.get("/", async (req, res) => {
  try {
    const { cafeId, category } = req.query;

    if (!cafeId) {
      return res.status(400).json({ error: "cafeId is required" });
    }

    const filter = { cafeId };
    if (category) filter.category = category;

    const items = await MenuItem.find(filter);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/menu/categories?cafeId=xxx
router.get("/categories", async (req, res) => {
  try {
    const { cafeId } = req.query;

    if (!cafeId) {
      return res.status(400).json({ error: "cafeId is required" });
    }

    const categories = await MenuItem.distinct("category", { cafeId });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected routes (dashboard / admin only)
// GET /api/menu/manage — owner views their full menu
router.get("/manage", auth, menuController.getMenu);

// POST /api/menu — create item
router.post("/", auth, adminOnly, menuController.createMenuItem);

// PUT /api/menu/:id — update item
router.put("/:id", auth, adminOnly, menuController.updateMenuItem);

// DELETE /api/menu/:id — delete item
router.delete("/:id", auth, adminOnly, menuController.deleteMenuItem);

module.exports = router;
