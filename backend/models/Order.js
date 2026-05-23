const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    cafeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cafe",
      required: true,
    },
    items: [
      {
        name: String,
        price: Number,
        qty: Number,
        selectedOptions: [
          {
            name: String,
            price: Number,
          },
        ],
      },
    ],
    total: Number,
    tableNumber: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "preparing", "completed", "cancelled"],
      default: "pending",
    },
    archivedFromQueue: {
      type: Boolean,
      default: false,
    },
    sessionId: {
      type: String,
      required: true,
    },
    // ── Cancel reason (Feature: Cancel & Reorder) ──────────────────────────
    cancelReason: {
      type: String,
      enum: ["entry_error", "customer_changed_mind", "item_unavailable", "other"],
      default: null,
    },
    cancelNote: {
      type: String,
      default: null,
      maxlength: 200,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelledBy: {
      type: String,   // "staff" — reserved for future role-based tracking
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
