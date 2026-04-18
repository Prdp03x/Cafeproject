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
        // 🔥 THIS IS THE IMPORTANT PART
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
      type: Number,
      required: true,
    },
    status: String,
    sessionId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
