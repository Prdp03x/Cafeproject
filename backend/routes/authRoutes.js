const express = require("express");
const router = express.Router();
const Cafe = require("../models/Cafe");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const auth = require("../middleware/auth");
const { loginLimiter, passwordChangeLimiter } = require("../middleware/rateLimiters");

const GST_NUMBER_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-() ]{7,20}$/;
const HEX_COLOR_REGEX = /^#(?:[0-9A-Fa-f]{3}){1,2}$/;
const DEFAULT_TOTAL_TABLES = 10;
const BRANDING_FIELDS = ["name", "description", "logo", "themeColor"];
const BUSINESS_FIELDS = [
  "ownerName",
  "phone",
  "category",
  "totalTables",
  "legalBusinessName",
  "billingEmail",
  "gstNumber",
  "address",
  "city",
  "state",
  "postalCode",
  "country",
];
const ALLOWED_SETTINGS_FIELDS = new Set([...BRANDING_FIELDS, ...BUSINESS_FIELDS]);
const REQUIRED_BUSINESS_FIELDS = {
  ownerName: "Owner name",
  phone: "Phone number",
  legalBusinessName: "Legal business name",
  billingEmail: "Billing email",
  gstNumber: "GST number",
  address: "Address",
  city: "City",
  state: "State",
  postalCode: "Postal code",
  country: "Country",
};

const trimString = (value) => (typeof value === "string" ? value.trim() : "");

const sanitizeSettingsValue = (key, value) => {
  switch (key) {
    case "billingEmail":
      return trimString(value).toLowerCase();
    case "gstNumber":
      return trimString(value).toUpperCase();
    case "totalTables":
      return Number(value);
    default:
      return trimString(value);
  }
};

const pickSettingsUpdates = (body) =>
  Object.keys(body).reduce((updates, key) => {
    if (!ALLOWED_SETTINGS_FIELDS.has(key)) {
      return updates;
    }

    updates[key] = sanitizeSettingsValue(key, body[key]);
    return updates;
  }, {});

const getLegacySettingsRepairs = (cafe, updates) => {
  const repairs = {};

  if (
    !("totalTables" in updates) &&
    (!Number.isInteger(Number(cafe.totalTables)) || Number(cafe.totalTables) < 1)
  ) {
    repairs.totalTables = DEFAULT_TOTAL_TABLES;
  }

  return repairs;
};

const validateBusinessProfile = (profile) => {
  const missingFields = Object.entries(REQUIRED_BUSINESS_FIELDS)
    .filter(([key]) => !trimString(profile[key]))
    .map(([, label]) => label);

  if (missingFields.length) {
    return `Missing required business fields: ${missingFields.join(", ")}`;
  }

  if (!PHONE_REGEX.test(profile.phone)) {
    return "Phone number is invalid";
  }

  if (!EMAIL_REGEX.test(profile.billingEmail)) {
    return "Billing email is invalid";
  }

  if (!GST_NUMBER_REGEX.test(profile.gstNumber)) {
    return "GST number is invalid";
  }

  if (!Number.isInteger(Number(profile.totalTables)) || Number(profile.totalTables) < 1) {
    return "Total tables must be at least 1";
  }

  return null;
};

const validateSettingsPayload = (updates, mergedCafe, validateBusiness) => {
  if ("name" in updates && !updates.name) {
    return "Cafe name is required";
  }

  if ("themeColor" in updates && updates.themeColor && !HEX_COLOR_REGEX.test(updates.themeColor)) {
    return "Theme color must be a valid hex color";
  }

  if (!validateBusiness) {
    if (
      "totalTables" in updates &&
      (!Number.isInteger(updates.totalTables) || updates.totalTables < 1)
    ) {
      return "Total tables must be at least 1";
    }

    return null;
  }

  return validateBusinessProfile(mergedCafe);
};


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
      themeColor: cafe.themeColor,
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
      ownerName: cafe.ownerName,
      phone: cafe.phone,
      description: cafe.description,
      address: cafe.address,
      category: cafe.category,
      themeColor: cafe.themeColor,
      totalTables: cafe.totalTables,
      legalBusinessName: cafe.legalBusinessName,
      billingEmail: cafe.billingEmail,
      gstNumber: cafe.gstNumber,
      city: cafe.city,
      state: cafe.state,
      postalCode: cafe.postalCode,
      country: cafe.country,
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
    const updates = pickSettingsUpdates(req.body);

    if (!Object.keys(updates).length) {
      return res.status(400).json({
        error: "No valid settings fields provided",
      });
    }

    const cafe = await Cafe.findById(req.cafeId);

    if (!cafe) {
      return res.status(404).json({
        error: "Cafe not found",
      });
    }

    const shouldValidateBusiness = Object.keys(updates).some((key) =>
      BUSINESS_FIELDS.includes(key)
    );
    const repairs = getLegacySettingsRepairs(cafe, updates);
    const mergedCafe = {
      ...cafe.toObject(),
      ...repairs,
      ...updates,
    };
    const validationError = validateSettingsPayload(
      updates,
      mergedCafe,
      shouldValidateBusiness
    );

    if (validationError) {
      return res.status(400).json({
        error: validationError,
      });
    }

    const updatedCafe = await Cafe.findByIdAndUpdate(
      req.cafeId,
      {
        $set: {
          ...repairs,
          ...updates,
        },
      },
      {
        new: true,
        runValidators: true,
        context: "query",
      }
    ).select("-password");

    if (!updatedCafe) {
      return res.status(404).json({
        error: "Cafe not found",
      });
    }

    res.json({
      message: "Settings updated",
      cafe: {
        ...updatedCafe.toObject(),
        id: updatedCafe._id.toString(),
      },
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
