const mongoose = require("mongoose");

const gstNumberPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const cafeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    ownerName: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      // Not required for Google OAuth users — they have no password
      required: function () {
        return !this.googleId;
      },
      default: null,
    },

    googleId: {
      type: String,
      default: null,
    },

    logo: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    category: {
      type: String,
      trim: true,
      default: "Cafe",
    },

    legalBusinessName: {
      type: String,
      trim: true,
      default: "",
    },

    billingEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      validate: {
        validator: (value) => !value || emailPattern.test(value),
        message: "Billing email must be valid",
      },
    },

    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
      validate: {
        validator: (value) => !value || gstNumberPattern.test(value),
        message: "GST number must be valid",
      },
    },

    fssaiNumber: {
      type: String,
      trim: true,
      default: "",
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    city: {
      type: String,
      trim: true,
      default: "",
    },

    state: {
      type: String,
      trim: true,
      default: "",
    },

    postalCode: {
      type: String,
      trim: true,
      default: "",
    },

    country: {
      type: String,
      trim: true,
      default: "India",
    },

    themeColor: {
      type: String,
      default: "#14532d",
    },

    totalTables: {
      type: Number,
      default: 10,
      min: 1,
    },

    role: {
      type: String,
      default: "admin",
    },

    resetToken: {
      type: String,
      default: null,
    },

    resetTokenExpiry: {
      type: Date,
      default: null,
    },

    secretQuestion: {
      type: String,
      default: "",
    },

    secretAnswer: {
      type: String,
      default: "",
    },

    // ── Payments (Razorpay Route linked account) ───────────────────────────
    razorpay: {
      accountId: {
        type: String,
        default: null,
      },
      accountStatus: {
        type: String,
        enum: ["not_connected", "pending", "activated", "rejected"],
        default: "not_connected",
      },
      // Never store the full bank account number — only enough to display it.
      bankAccountLast4: {
        type: String,
        default: "",
      },
      commissionPercent: {
        type: Number,
        default: 5, // platform's cut of each order, adjust per your commercial terms
      },
      businessType: {
        type: String,
        default: "",
      },
      submittedAt: {
        type: Date,
        default: null,
      },
    },

  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Cafe", cafeSchema);
