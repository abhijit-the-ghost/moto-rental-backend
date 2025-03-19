const express = require("express");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");
const User = require("../models/User");
const router = express.Router();

// ✅ Admin Dashboard Route (Protected)
router.get("/dashboard", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    res.json({ message: "Welcome Admin", totalUsers });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
