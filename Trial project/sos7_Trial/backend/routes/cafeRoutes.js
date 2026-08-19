const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const Cafe = require("../models/Cafe");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");
const { getPaymentStatus, saveRazorpayKeys, deleteRazorpayKeys } = require("../controllers/cafePaymentController");

router.get   ("/payments/status", auth, adminOnly, getPaymentStatus);
router.post  ("/payments/keys",   auth, adminOnly, saveRazorpayKeys);
router.delete("/payments/keys",   auth, adminOnly, deleteRazorpayKeys);

router.get("/:id", async (req, res) => {
  try {
    // Validate the id before hitting MongoDB — avoids a Mongoose CastError 500
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid cafe ID" });
    }

    const cafe = await Cafe.findById(req.params.id).select(
      "name logo themeColor totalTables description category"
    );

    if (!cafe) {
      return res.status(404).json({ error: "Cafe not found" });
    }

    res.json(cafe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
module.exports = router;
