const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes"); // ✅ Keep only this import
const User = require("./models/User");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const motorcycleRoutes = require(path.resolve(
  __dirname,
  "./routes/motorcycleRoutes"
));

// ✅ Connect to Database
connectDB();

const app = express();

// ✅ Middleware for JSON & Large Payloads (For Image Uploads)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ✅ Serve Uploaded Images Statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ CORS Middleware to Allow Requests from Frontend
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ✅ Function to Create Default Admin (Runs on Server Start)
const createAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ email: "admin@example.com" });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("Admin@123", 10);
      const adminUser = new User({
        firstName: "Admin",
        lastName: "User",
        email: "admin@example.com",
        phoneNumber: "1234567890",
        password: hashedPassword,
        dob: "2000-01-01",
        isForeigner: false,
        role: "admin",
        drivingLicense: "", // ✅ Default empty path
        passport: "", // ✅ Default empty path
      });

      await adminUser.save();
      console.log("✅ Default admin user created!");
    } else {
      console.log("✅ Admin user already exists.");
    }
  } catch (error) {
    console.error("❌ Error creating admin:", error);
  }
};

// ✅ Run the function on startup
createAdminUser();

// ✅ Register Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes); // ✅ User routes for managing users
app.use("/api/motorcycles", motorcycleRoutes);
app.use("/api/admin", require("./routes/adminRoutes"));

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
