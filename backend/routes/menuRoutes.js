const express = require("express");
const router = express.Router();
const Menu = require("../models/Menu");

// 🔥 GET MENU BY CAFE + CATEGORY
router.get("/", async (req, res) => {
  try {
    const { cafeId, category } = req.query;

    // ❗ cafeId is REQUIRED now
    if (!cafeId) {
      return res.status(400).json({ error: "cafeId is required" });
    }
    
    let filter = { cafeId };

    if (category) {
      filter.category = category;
    }

    console.log("Incoming cafeId:", cafeId);
console.log("Filter:", filter);

const items = await Menu.find(filter);/////////////

console.log("Items found:", items.length);

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔥 GET CATEGORIES BY CAFE
router.get("/categories", async (req, res) => {
  try {
    const { cafeId } = req.query;

    if (!cafeId) {
      return res.status(400).json({ error: "cafeId is required" });
    }

    const categories = await Menu.distinct("category", { cafeId });

    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔥 CREATE MENU ITEM (Post Routes)
router.post("/", async (req, res) => {
  try {
    const item = new Menu(req.body);
    await item.save();

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE ITEMS FROM MENU
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedItem = await Menu.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    res.json({ message: "Item deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;