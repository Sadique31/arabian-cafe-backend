const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const crypto = require("crypto");
// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Signup error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: "15m" }
);

const refreshToken = crypto.randomBytes(40).toString("hex");
await RefreshToken.create({ token: refreshToken, userId: user._id });

res.json({ token, refreshToken });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Refresh Token Route
router.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: "No refresh token" });

    const stored = await RefreshToken.findOne({ token: refreshToken });
    if (!stored) return res.status(403).json({ message: "Invalid refresh token" });

    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - stored.createdAt > thirtyDays) {
      await RefreshToken.deleteOne({ token: refreshToken });
      return res.status(403).json({ message: "Refresh token expired" });
    }

    const user = await User.findById(stored.userId);
    const newToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ token: newToken });
  } catch (error) {
    res.status(500).json({ message: "Error refreshing token" });
  }
});

// Logout Route
router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    await RefreshToken.deleteOne({ token: refreshToken });
    res.json({ message: "Logged out" });
  } catch (error) {
    res.status(500).json({ message: "Logout error" });
  }
});

module.exports = router;
