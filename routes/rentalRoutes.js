const express = require("express");
const Rental = require("../models/Rental");
const User = require("../models/User");
const Motorcycle = require("../models/Motorcycle");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Rent a Motorcycle
// In your Express backend (e.g., rentals router)
// In rentals router (rentals.js)
router.post("/rent/:motorcycleId", authMiddleware, async (req, res) => {
  const { rentStartDate, rentEndDate } = req.body;
  const motorcycleId = req.params.motorcycleId;
  const userId = req.user.id;

  try {
    // Parse and validate dates
    const start = new Date(rentStartDate);
    const end = new Date(rentEndDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    if (end <= start) {
      return res
        .status(400)
        .json({ message: "End date must be after start date" });
    }

    // Check if motorcycle exists and is available
    const motorcycle = await Motorcycle.findById(motorcycleId);
    if (!motorcycle) {
      return res.status(404).json({ message: "Motorcycle not found" });
    }
    if (motorcycle.status !== "Available") {
      return res
        .status(400)
        .json({ message: "Motorcycle is not available for rent" });
    }

    // Calculate total cost
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalCost = days * motorcycle.price;

    // Create a new rental record
    const rental = new Rental({
      user: userId,
      motorcycle: motorcycleId,
      rentStartDate: start,
      rentEndDate: end,
      totalPrice: totalCost,
      status: "Ongoing",
    });
    await rental.save();

    // Update motorcycle status to "Rented"
    motorcycle.status = "Rented";
    await motorcycle.save();

    // Add rental details to user's rentedMotorcycles array
    await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          rentedMotorcycles: {
            motorcycle: motorcycleId,
            rentStartDate: start,
            rentEndDate: end,
            status: "Rented",
            totalCost,
            image: motorcycle.image, // Copy the image from Motorcycle
          },
        },
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Motorcycle rented successfully",
      rental,
    });
  } catch (error) {
    console.error("Error renting motorcycle:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Return a Motorcycle
router.post("/return/:rentalId", authMiddleware, async (req, res) => {
  try {
    const rentalId = req.params.rentalId;
    const userId = req.user.id;

    // Find the user and populate the motorcycle reference
    const user = await User.findById(userId).populate(
      "rentedMotorcycles.motorcycle"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the rental subdocument by its _id
    const rental = user.rentedMotorcycles.id(rentalId);
    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    // Check if the rental is still active
    if (rental.status !== "Rented") {
      return res
        .status(400)
        .json({ message: "Motorcycle is not currently rented" });
    }

    // Update rental status to "Completed" (or remove it)
    rental.status = "Completed"; // Or use "Returned" if preferred

    // Update motorcycle status to "Available"
    const motorcycle = await Motorcycle.findById(rental.motorcycle._id);
    if (!motorcycle) {
      return res.status(404).json({ message: "Motorcycle not found" });
    }
    motorcycle.status = "Available";
    await motorcycle.save();

    // Save the updated user document
    await user.save();

    // Optionally remove the rental from rentedMotorcycles instead of marking it "Completed"
    // await User.findByIdAndUpdate(
    //   userId,
    //   { $pull: { rentedMotorcycles: { _id: rentalId } } },
    //   { new: true }
    // );

    res.json({ message: "Motorcycle returned successfully!", rental });
  } catch (error) {
    console.error("Error returning motorcycle:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Get All Rentals (Admin Only)
// ✅ Get All Rentals (Admin Only)
router.get("/all", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Fetch all users with rentedMotorcycles, populate motorcycle details
    const users = await User.find({ "rentedMotorcycles.0": { $exists: true } })
      .populate("rentedMotorcycles.motorcycle", "name company")
      .lean();

    // Flatten the rentedMotorcycles arrays into a single list
    const allRents = users.flatMap((user) =>
      user.rentedMotorcycles.map((rent) => ({
        _id: rent._id,
        userEmail: user.email,
        motorcycleName: rent.motorcycle?.name || "Unknown",
        motorcycleCompany: rent.motorcycle?.company || "Unknown",
        rentStartDate: rent.rentStartDate,
        rentEndDate: rent.rentEndDate,
        status: rent.status,
        totalPrice: rent.totalPrice, // Correct field name
      }))
    );

    res.json(allRents);
  } catch (error) {
    console.error("Error fetching all rents:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
