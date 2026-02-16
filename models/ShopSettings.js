const mongoose = require("mongoose");

const shopSettingsSchema = new mongoose.Schema({
  isOpen: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model("ShopSettings", shopSettingsSchema);
