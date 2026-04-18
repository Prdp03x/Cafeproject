const express = require("express");
const router = express.Router();
const Cafe = require("../models/Cafe");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");


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

    res.json({ message: "Cafe created" });

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

    const token = jwt.sign(
      { cafeId: cafe._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      cafe: {
        id: cafe._id,
        name: cafe.name,
        email: cafe.email,
      },
    });

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

      const token = jwt.sign(
        { cafeId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // 🔥 Redirect with token
      res.redirect(`http://localhost:5173/google-success?token=${token}`);

    } catch (err) {
      res.redirect("http://localhost:5173/login");
    }
  }
);

module.exports = router;