const express = require("express");
const router = express.Router();
const Cafe = require("../models/Cafe");

router.get("/:id", async (req, res) => {
  try {
    const cafe = await Cafe.findById(req.params.id).select("-password");
    if (!cafe) {
      return res.status(404).json({ error: "Cafe not found" });
    }

    res.json(cafe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
