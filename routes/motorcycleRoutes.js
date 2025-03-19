const express = require("express");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");
const Motorcycle = require("../models/Motorcycle");
const router = express.Router();

// ✅ Add a Motorcycle (Admin Only)
router.post("/add", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description, company, price } = req.body;

    if (!name || !description || !company || !price) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const newMotorcycle = new Motorcycle({
      name,
      description,
      company,
      price,
      addedBy: req.user.id, // ✅ Admin ID
    });

    await newMotorcycle.save();
    res
      .status(201)
      .json({
        message: "Motorcycle added successfully!",
        motorcycle: newMotorcycle,
      });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Get All Motorcycles
router.get("/", async (req, res) => {
  try {
    const motorcycles = await Motorcycle.find().populate(
      "addedBy",
      "firstName lastName email"
    );
    res.json(motorcycles);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Rent a Motorcycle (User)
router.patch("/rent/:id", authMiddleware, async (req, res) => {
  try {
    const motorcycle = await Motorcycle.findById(req.params.id);
    if (!motorcycle) {
      return res.status(404).json({ message: "Motorcycle not found!" });
    }

    if (motorcycle.status === "Rented") {
      return res.status(400).json({ message: "Motorcycle is already rented!" });
    }

    motorcycle.status = "Rented";
    await motorcycle.save();
    res.json({ message: "Motorcycle rented successfully!", motorcycle });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Return a Motorcycle (User)
router.patch("/return/:id", authMiddleware, async (req, res) => {
  try {
    const motorcycle = await Motorcycle.findById(req.params.id);
    if (!motorcycle) {
      return res.status(404).json({ message: "Motorcycle not found!" });
    }

    if (motorcycle.status === "Available") {
      return res
        .status(400)
        .json({ message: "Motorcycle is already available!" });
    }

    motorcycle.status = "Available";
    await motorcycle.save();
    res.json({ message: "Motorcycle returned successfully!", motorcycle });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
