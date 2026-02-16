const mongoose = require("mongoose");

const itemStockSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // same item duplicate na bane
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("ItemStock", itemStockSchema);
