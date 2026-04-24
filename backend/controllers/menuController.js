const Menu = require("../models/Menu");
const mongoose = require("mongoose");

exports.updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid item ID" });
    }

    const updatedItem = await Menu.findOneAndUpdate(
      {
        _id: id,
        cafeId: req.cafeId, // 🔐 security
      },
      req.body,
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(updatedItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};