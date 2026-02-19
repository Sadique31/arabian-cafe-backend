const express = require("express");
const router = express.Router();
const ShopSettings = require("../models/ShopSettings");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware"); // ✅ Ye add karo

// 🔹 GET Shop Status (Public)
router.get("/status", async (req, res) => {
  try {
    let settings = await ShopSettings.findOne();

    if (!settings) {
      // First time create default
      settings = new ShopSettings({ isOpen: true });
      await settings.save();
    }

    res.status(200).json({ isOpen: settings.isOpen });

  } catch (error) {
    res.status(500).json({ message: "Error fetching shop status" });
  }
});


// 🔹 UPDATE Shop Status (Admin Only)
router.put("/status", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { isOpen } = req.body;

    let settings = await ShopSettings.findOne();

    if (!settings) {
      settings = new ShopSettings({ isOpen });
    } else {
      settings.isOpen = isOpen;
    }

    await settings.save();

    res.status(200).json({ message: "Shop status updated", isOpen });

  } catch (error) {
    res.status(500).json({ message: "Error updating shop status" });
  }
});

module.exports = router;
