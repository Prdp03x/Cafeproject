const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
const Cafe = require("../models/Cafe");
const bcrypt = require("bcryptjs");

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 🔥 Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // 🔥 Duplicate check
    const existing = await Cafe.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const cafe = new Cafe({
      name,
      email,
      password: hashed,
    });

    await cafe.save();

    res.json({ message: "Cafe created" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
    try{
  const { email, password } = req.body;

  if (!email || !password) {
  return res.status(400).json({ error: "All fields required" });
}

  const cafe = await Cafe.findOne({ email });

  if (!cafe) return res.status(400).json({ error: "User not found" });

  const isMatch = await bcrypt.compare(password, cafe.password);

  if (!isMatch) return res.status(400).json({ error: "Wrong password" });

  const token = jwt.sign({ cafeId: cafe._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({
  token,
  cafe: {
    id: cafe._id,
    name: cafe.name,
    email: cafe.email
  }
});
} catch(err){
     res.status(500).json({ error: err.message });
}
});

module.exports = router;