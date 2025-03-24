const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1]; // ✅ Extract token

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied!" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // ✅ Decode token
    req.user = decoded; // ✅ Attach user data (ID & role) to request

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token!" });
  }
};

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only!" });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };
