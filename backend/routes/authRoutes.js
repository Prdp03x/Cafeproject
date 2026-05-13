const express = require("express");
const router = express.Router();
const Cafe = require("../models/Cafe");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const auth = require("../middleware/auth");
const { loginLimiter, passwordChangeLimiter } = require("../middleware/rateLimiters");


const buildAuthResponse = (cafe) => {
  const cafeId = cafe._id.toString();

  const token = jwt.sign(
    { 
      cafeId,
      role: "admin"
     },
    process.env.JWT_SECRET,
    { 
      expiresIn: "7d",
      issuer: "cafe-saas"
    }
  );

  return {
    token,
    cafe: {
      id: cafeId,
      name: cafe.name,
      email: cafe.email,
      logo: cafe.logo,
    },
  };
};


// ================== SIGNUP ==================
router.post("/signup", loginLimiter, async (req, res) => {
  try {
    const { name, ownerName, email, password } = req.body;

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
      ownerName,
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
      logo: cafe.logo,
      description: cafe.description,
      address: cafe.address,
      category: cafe.category
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ================== LOGIN ==================
router.post("/login", loginLimiter, async (req, res) => {
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



//==================== Setting =====================
router.get("/settings", auth, async (req, res) => {
  try {
    const cafe = await Cafe.findById(req.cafeId).select("-password");

    if (!cafe) {
      return res.status(404).json({
        error: "Cafe not found",
      });
    }

    res.json(cafe);

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});


router.put("/settings", auth, async (req, res) => {
  try {
    const {
      name,
      ownerName,
      phone,
      description,
      category,
      logo,
      themeColor,
      totalTables,
    } = req.body;

    const updatedCafe = await Cafe.findByIdAndUpdate(
      req.cafeId,
      {
        name,
        ownerName,
        phone,
        description,
        category,
        logo,
        themeColor,
        totalTables,
      },
      {
        new: true,
      }
    ).select("-password");

    res.json({
      message: "Settings updated",
      cafe: updatedCafe,
    });

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});


// ================== Change Password Router ==================
router.put(
  "/password",
  auth,
  passwordChangeLimiter,
  async (req, res) => {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;

      // Validation
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          error: "All fields are required",
        });
      }

      // Confirm password check
      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          error: "Passwords do not match",
        });
      }

      // Password length
      if (newPassword.length < 6) {
        return res.status(400).json({
          error: "Password must be at least 6 characters",
        });
      }

      // Find logged-in cafe
      const cafe = await Cafe.findById(req.cafeId);

      if (!cafe) {
        return res.status(404).json({
          error: "Cafe not found",
        });
      }

      // Verify current password
      const isMatch = await bcrypt.compare(
        currentPassword,
        cafe.password
      );

      if (!isMatch) {
        return res.status(400).json({
          error: "Current password is incorrect",
        });
      }

      // Prevent same password reuse
      const samePassword = await bcrypt.compare(
        newPassword,
        cafe.password
      );

      if (samePassword) {
        return res.status(400).json({
          error: "New password must be different",
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Save
      cafe.password = hashedPassword;

      await cafe.save();

      res.json({
        message: "Password changed successfully",
      });

    } catch (err) {
      res.status(500).json({
        error: err.message,
      });
    }
  }
);

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
      res.redirect(`${process.env.CLIENT_URL2}/google-success?token=${token}`);

    } catch (err) {
      res.redirect("http://localhost:5173/login");
    }
  }
);

module.exports = router;
