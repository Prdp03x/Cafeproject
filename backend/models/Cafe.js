const mongoose = require("mongoose");

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
      required: true,
    },

    logo: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      default: "Cafe",
    },

    themeColor: {
      type: String,
      default: "#14532d",
    },

    totalTables: {
      type: Number,
      default: 10,
    },

    role: {
      type: String,
      default: "admin",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Cafe", cafeSchema);