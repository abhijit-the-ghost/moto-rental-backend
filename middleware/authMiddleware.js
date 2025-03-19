const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");

  // ✅ Log the received Authorization header
  console.log("Auth Header Received:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized, no token provided" });
  }

  const token = authHeader.split(" ")[1]; // ✅ Extract token correctly

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("Decoded Token:", decoded); // ✅ Log decoded token for debugging
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message); // ✅ Log exact JWT error
    res.status(401).json({ message: "Invalid token" });
  }
};

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only!" });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };
