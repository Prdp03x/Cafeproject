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
    const cafe = await Cafe.findById({_id: req.params.id }).select("-password");
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
