const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const path = require("path");
const motorcycleRoutes = require(path.resolve(
  __dirname,
  "./routes/motorcycleRoutes"
));

// Connect to Database
connectDB();
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
];

// ✅ CORS Middleware

const createAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ email: "admin@example.com" });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("Admin@123", 10);
      const adminUser = new User({
        firstName: "Admin",
        lastName: "User",
        email: "admin@example.com",
        password: hashedPassword,
        dob: "2000-01-01",
        isForeigner: false,
        role: "admin",
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

// Run the function on startup
createAdminUser();

const app = express();
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies, authentication headers
  })
);
app.use(express.json());
app.use("/api/motorcycles", motorcycleRoutes);
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
