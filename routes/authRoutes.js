const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const upload = require("../middleware/upload"); // ✅ Import multer upload middleware
const router = express.Router();
require("dotenv").config();

// ✅ SIGNUP (With Image Uploads)
router.post(
  "/signup",
  upload.fields([
    { name: "drivingLicense", maxCount: 1 }, // ✅ Upload Driving License
    { name: "passport", maxCount: 1 }, // ✅ Upload Passport (If Foreigner)
  ]),
  async (req, res) => {
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

      if (!req.files["drivingLicense"]) {
        return res
          .status(400)
          .json({ message: "Driving License is required!" });
      }

      if (isForeigner === "true" && !req.files["passport"]) {
        return res
          .status(400)
          .json({ message: "Passport is required for foreigners!" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const newUser = new User({
        firstName,
        lastName,
        email,
        phoneNumber,
        password: hashedPassword,
        dob,
        isForeigner: isForeigner === "true",
        drivingLicense: `/uploads/users/${req.files["drivingLicense"][0].filename}`,
        passport:
          isForeigner === "true"
            ? `/uploads/users/${req.files["passport"][0].filename}`
            : null,
      });

      await newUser.save();
      res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// ✅ LOGIN
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
