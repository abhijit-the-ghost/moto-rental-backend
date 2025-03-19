const express = require("express");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const Motorcycle = require("../models/Motorcycle");
const router = express.Router();

// ✅ Get All Motorcycles (Public)
router.get("/", async (req, res) => {
  try {
    let { page = 1, limit = 5, search = "" } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    // Search Query
    const query = {
      $or: [
        { name: new RegExp(search, "i") },
        { company: new RegExp(search, "i") },
        { status: new RegExp(search, "i") },
      ],
    };

    // Get total count of motorcycles matching search criteria
    const totalMotorcycles = await Motorcycle.countDocuments(query);

    // Fetch paginated results
    const motorcycles = await Motorcycle.find(query)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      totalMotorcycles,
      totalPages: Math.ceil(totalMotorcycles / limit),
      currentPage: page,
      motorcycles,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Add a Motorcycle (Admin Only)
router.post(
  "/add",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      console.log("Received Form Data:", req.body); // ✅ Log request body
      console.log("Received File:", req.file); // ✅ Log file upload

      const { name, company, description, price, status } = req.body;

      if (!name || !company || !description || !price || !status || !req.file) {
        return res.status(400).json({ message: "All fields are required!" });
      }

      const newMotorcycle = new Motorcycle({
        name,
        company,
        description, // ✅ Ensure description is included
        price: parseFloat(price), // ✅ Ensure price is converted to a number
        status,
        image: `/uploads/motorcycles/${req.file.filename}`,
        addedBy: req.user.id,
      });

      await newMotorcycle.save();
      res.status(201).json({
        message: "Motorcycle added successfully!",
        motorcycle: newMotorcycle,
      });
    } catch (error) {
      console.error("Server Error:", error.message);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// ✅ Update Motorcycle (Admin Only)
router.patch(
  "/update/:id",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const { name, company, description, price, status } = req.body;
      const motorcycle = await Motorcycle.findById(req.params.id);

      if (!motorcycle) {
        return res.status(404).json({ message: "Motorcycle not found!" });
      }

      motorcycle.name = name || motorcycle.name;
      motorcycle.company = company || motorcycle.company;
      motorcycle.description = description || motorcycle.description;
      motorcycle.price = price ? parseFloat(price) : motorcycle.price;
      motorcycle.status = status || motorcycle.status;

      if (req.file) {
        motorcycle.image = `/uploads/motorcycles/${req.file.filename}`;
      }

      await motorcycle.save();
      res.json({ message: "Motorcycle updated successfully!", motorcycle });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// ✅ Delete Motorcycle (Admin Only)
router.delete(
  "/delete/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const motorcycle = await Motorcycle.findByIdAndDelete(req.params.id);
      if (!motorcycle) {
        return res.status(404).json({ message: "Motorcycle not found!" });
      }
      res.json({ message: "Motorcycle deleted successfully!" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

module.exports = router;
