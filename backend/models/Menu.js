const mongoose = require("mongoose");

const choiceSchema = new mongoose.Schema({
  name: String,
  price: Number,
});

const optionSchema = new mongoose.Schema({
  title: String,
  type: String, // "single" or "multiple"
  choices: [choiceSchema],
});

const menuSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  category: String,
  options: [optionSchema],
  cafeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cafe",
    required: true,
  },
});

module.exports = mongoose.model("Menu", menuSchema);