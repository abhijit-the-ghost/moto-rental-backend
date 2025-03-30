const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
// Removed: const upload = require("../middleware/upload"); // No longer needed
const router = express.Router();
require("dotenv").config();

// SIGNUP (No Image Uploads)
router.post("/signup", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      repeatPassword,
      dob,
      isForeigner,
      phoneNumber,
    } = req.body;

    // Validation
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !repeatPassword ||
      !dob ||
      !phoneNumber
    ) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    if (password !== repeatPassword) {
      return res.status(400).json({ message: "Passwords do not match!" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists!" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user (no drivingLicense or passport images)
    const newUser = new User({
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
      dob,
      isForeigner: isForeigner === "true",
      drivingLicense: "", // Default empty string
      passport: "", // Default empty string
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// LOGIN (unchanged)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password!" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful!",
      token,
      user: { _id: user._id, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
