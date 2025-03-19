const express = require("express");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");
const User = require("../models/User");
const Motorcycle = require("../models/Motorcycle");

const router = express.Router();

// ✅ Fetch Dashboard Stats
router.get("/stats", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMotorcycles = await Motorcycle.countDocuments();
    const rentedMotorcycles = await Motorcycle.countDocuments({
      status: "Rented",
    });

    const rentedPercentage =
      totalMotorcycles > 0
        ? ((rentedMotorcycles / totalMotorcycles) * 100).toFixed(2)
        : 0;

    res.json({
      totalUsers,
      totalMotorcycles,
      rentedPercentage,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
