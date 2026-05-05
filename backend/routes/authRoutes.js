const express = require("express");
const router = express.Router();
const Cafe = require("../models/Cafe");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const auth = require("../middleware/auth");

const buildAuthResponse = (cafe) => {
  const cafeId = cafe._id.toString();

  const token = jwt.sign(
    { cafeId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    token,
    cafe: {
      id: cafeId,
      name: cafe.name,
      email: cafe.email,
    },
  };
};


// ================== SIGNUP ==================
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    const existing = await Cafe.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const cafe = new Cafe({
      name,
      email,
      password: hashed,
      isVerified: false, // 🔥 for future email verification
    });

    await cafe.save();

    res.json(buildAuthResponse(cafe));

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ================== CURRENT CAFE ==================
router.get("/me", auth, async (req, res) => {
  try {
    const cafe = await Cafe.findById(req.cafeId).select("-password");

    if (!cafe) {
      return res.status(404).json({ error: "Cafe not found" });
    }

    res.json({
      id: cafe._id.toString(),
      name: cafe.name,
      email: cafe.email,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ================== LOGIN ==================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const cafe = await Cafe.findOne({ email });
    if (!cafe) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, cafe.password);
    if (!isMatch) return res.status(400).json({ error: "Wrong password" });

    res.json(buildAuthResponse(cafe));

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ================== GOOGLE LOGIN ==================

// Step 1: Redirect
router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Step 2: Callback → RETURN JWT (🔥 IMPORTANT CHANGE)
router.get("/google/callback",
  passport.authenticate("google", { session: false }), // ❌ no session
  async (req, res) => {
    try {
      const user = req.user;

      const { token } = buildAuthResponse(user);

      // 🔥 Redirect with token
      res.redirect(`http://localhost:5173/google-success?token=${token}`);

    } catch (err) {
      res.redirect("http://localhost:5173/login");
    }
  }
);

module.exports = router;
