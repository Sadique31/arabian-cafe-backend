const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

  items: [
    {
      name: String,
      price: Number,
      quantity: Number,
      distance: Number,
      deliveryCharge: Number
    }
  ],

  totalAmount: {
    type: Number,
    required: true
  },

  customerName: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    required: true
  },

  address: {
    type: String,
    required: true
  },
status: {
  type: String,
  enum: ["Pending", "Preparing", "Out for Delivery", "Delivered"],
  default: "Pending"
},
customerLocation: {
  lat: Number,
  lng: Number,
},


  // 🔐 User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  paymentId: {
  type: String,
},

razorpayOrderId: {
  type: String,
},

paymentStatus: {
  type: String,
  default: "Pending"
},



});

module.exports = mongoose.model("Order", orderSchema);
