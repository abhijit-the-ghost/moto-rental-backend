const express = require("express");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();

// ✅ Fetch All Users with Pagination & Search
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "" } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const query = {
      $or: [
        { firstName: new RegExp(search, "i") },
        { lastName: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
      ],
    };

    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("rentedMotorcycles.motorcycle", "name company");

    const formattedUsers = users.map((user) => ({
      _id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      verified: user.verified,
      isForeigner: user.isForeigner,
      drivingLicense: user.drivingLicense
        ? `http://localhost:5000${user.drivingLicense}`
        : null, // ✅ Full path for frontend
      passport: user.passport ? `http://localhost:5000${user.passport}` : null, // ✅ Full path for frontend
    }));

    res.json({
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
      users: formattedUsers,
    });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Verify User (Admin Only)
router.patch(
  "/verify/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ message: "User not found!" });
      }

      // ✅ Ensure foreign users have a passport before verification
      if (user.isForeigner && !user.passport) {
        return res
          .status(400)
          .json({ message: "Foreigner users must upload a passport!" });
      }

      // ✅ Ensure all users have a driving license before verification
      if (!user.drivingLicense) {
        return res
          .status(400)
          .json({ message: "User must upload a driving license!" });
      }

      user.verified = true; // ✅ Set user as verified
      await user.save();

      res.json({ message: "User verified successfully!", user });
    } catch (error) {
      console.error("Error verifying user:", error.message);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

module.exports = router;
