const express = require("express");
const router = express.Router();
const Menu = require("../models/Menu");
const auth = require("../middleware/auth");

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

const items = await Menu.find(filter);

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

// 🔥 UPDATE MENU ITEM (THIS IS NEW)
router.put("/:id", auth, async (req, res) => {
  try {
    const updatedItem = await Menu.findOneAndUpdate(
      {
        _id: req.params.id,
        cafeId: req.cafeId, // 🔐 only allow own cafe
      },
      req.body,
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// DELETE ITEMS FROM MENU
router.delete("/:id", auth, async (req, res) => {
  try {
    const deletedItem = await Menu.findOneAndDelete({
      _id: req.params.id,
      cafeId: req.cafeId,
    });

    if (!deletedItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    res.json({ message: "Item deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;