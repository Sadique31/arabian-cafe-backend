const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const authMiddleware = require("../middleware/authMiddleware");
const crypto = require("crypto");
const Order = require("../models/Order");
const Shop = require("../models/ShopSettings");

// 🔐 Razorpay instance (Test Keys use karo)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 🔥 Create Razorpay Order
router.post("/create-order", authMiddleware, async (req, res) => {
  try {
    const { items, deliveryCharge } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Invalid items" });
    }

    // ✅ Backend pe price calculate karo
    const Product = require("../models/Product");
    let calculatedAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item._id);
      if (!product) return res.status(400).json({ message: "Invalid product: " + item.name });
      if (!product.inStock) return res.status(400).json({ message: product.name + " is out of stock" });
      calculatedAmount += product.price * item.quantity;
    }

    // Delivery charge validate karo (max ₹20)
    const validDelivery = Math.min(Number(deliveryCharge) || 0, 20);
    calculatedAmount += validDelivery;

    const options = {
      amount: Math.round(calculatedAmount * 100),
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json(order);

  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500).json({ message: "Payment creation failed" });
  }
});

// Key safely frontend ko do
router.get("/config", authMiddleware, (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
});

// 🔐 Verify Payment Signature (SECURITY UPGRADE)
router.post("/verify-payment", authMiddleware, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDetails,
    } = req.body;

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }


    // 🔒 ADDED SECURITY: SHOP STATUS CHECK
    const shop = await Shop.findOne();

    if (!shop || shop.isOpen === false) {
      return res.status(403).json({ message: "Shop is currently closed" });
    }

    const newOrder = new Order(orderDetails);
    const savedOrder = await newOrder.save();

    // 🔥 REAL-TIME EMIT (ADD THIS)
    const io = req.app.get("io");
    io.emit("newOrder", savedOrder);

    res.status(200).json({ message: "Payment verified & order saved" });
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ message: "Verification failed" });
  }
});

module.exports = router;
