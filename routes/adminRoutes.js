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
    // Count total users and motorcycles
    const totalUsers = await User.countDocuments();
    const totalMotorcycles = await Motorcycle.countDocuments();

    // Log to check if count is correct
    console.log("Total Motorcycles: ", totalMotorcycles);
    console.log("Total Users: ", totalUsers);

    // Count rented motorcycles
    const rentedMotorcycles = await Motorcycle.countDocuments({
      status: "Rented", // Make sure the status is correctly set
    });

    console.log("Rented Motorcycles: ", rentedMotorcycles);

    // Calculate rented percentage
    const rentedPercentage =
      totalMotorcycles > 0
        ? ((rentedMotorcycles / totalMotorcycles) * 100).toFixed(2)
        : 0;

    // Log rented percentage for debugging
    console.log("Rented Percentage: ", rentedPercentage);

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
