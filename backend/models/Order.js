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
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
