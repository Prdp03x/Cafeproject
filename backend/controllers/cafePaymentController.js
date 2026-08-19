const { encrypt, decrypt } = require("../config/razorpay");
const Razorpay = require("razorpay");
const Cafe     = require("../models/Cafe");

// GET /api/cafes/payments/status
exports.getPaymentStatus = async (req, res) => {
  try {
    const cafe = await Cafe.findById(req.cafeId).select("razorpay");
    if (!cafe) return res.status(404).json({ error: "Cafe not found" });
    res.json({ keysConfigured: cafe.razorpay?.keysConfigured || false });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/cafes/payments/keys  { keyId, keySecret }
exports.saveRazorpayKeys = async (req, res) => {
  try {
    const { keyId, keySecret } = req.body;

    if (!keyId || !keySecret) {
      return res.status(400).json({ error: "Both key_id and key_secret are required" });
    }
    if (!/^rzp_(test|live)_[A-Za-z0-9]+$/.test(keyId)) {
      return res.status(400).json({ error: "Invalid Razorpay key_id format" });
    }

    // Smoke-test the credentials before saving — this way you catch typos immediately
    try {
      const rz = new Razorpay({ key_id: keyId, key_secret: keySecret });
      // fetch orders with limit 1 — only succeeds with valid creds
      await rz.orders.all({ count: 1 });
    } catch {
      return res.status(400).json({ error: "Razorpay rejected these credentials — double-check your key_id and key_secret" });
    }

    const cafe = await Cafe.findById(req.cafeId);
    if (!cafe) return res.status(404).json({ error: "Cafe not found" });

    cafe.razorpay.keyId     = encrypt(keyId);
    cafe.razorpay.keySecret = encrypt(keySecret);
    cafe.razorpay.keysConfigured = true;
    await cafe.save();

    res.json({ message: "Razorpay keys saved successfully", keysConfigured: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save keys" });
  }
};

// DELETE /api/cafes/payments/keys — lets a café clear/replace keys
exports.deleteRazorpayKeys = async (req, res) => {
  try {
    const cafe = await Cafe.findById(req.cafeId);
    if (!cafe) return res.status(404).json({ error: "Cafe not found" });
    cafe.razorpay.keyId        = null;
    cafe.razorpay.keySecret    = null;
    cafe.razorpay.keysConfigured = false;
    await cafe.save();
    res.json({ message: "Keys removed" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};