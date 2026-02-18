const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// 🔥 CREATE ORDER (Login Required)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { items, totalAmount, customerName, phone, address } = req.body;

    const newOrder = new Order({
      items,
      totalAmount,
      customerName,
      phone,
      address,
      userId: req.user.id,
    });

    const savedOrder = await newOrder.save();

    // 🔥 REAL-TIME EMIT
    const io = req.app.get("io");
    io.emit("newOrder", savedOrder);

    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: "Error saving order", error });
  }
});

// 🔥 GET USER'S OWN ORDERS
router.get("/myorders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user orders" });
  }
});

// 🔥 GET ALL ORDERS (Admin Only)
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders" });
  }
});

/*
========================================
GET ORDER HISTORY (Admin Only)
========================================
*/
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const { date, search } = req.query;

    let filter = {};

    // 📅 Filter by date
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: start, $lte: end };
    }

    // 🔎 Search by customer name or order id
    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { _id: search.length === 24 ? search : null },
      ];
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error("History fetch error:", error);
    res.status(500).json({ message: "Error fetching history" });
  }
});

// 🔥 UPDATE ORDER STATUS (Admin Only)
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true },
    );

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Error updating status" });
  }
});

module.exports = router;
