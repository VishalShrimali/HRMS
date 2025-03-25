import jwt from "jsonwebtoken";
import { Admin } from "../models/admin.models.js";
import dotenv from "dotenv";

dotenv.config();

const protect = async (req, res, next) => {
  try {
    // Check for the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Authorization header missing or malformed:", authHeader);
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // Extract token
    const token = authHeader.split(" ")[1];
    if (!token) {
      console.log("Token missing after splitting Authorization header");
      return res.status(401).json({ message: "Unauthorized: Token missing" });
    }

    console.log("Token received:", token); // Debug

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log("Decoded token:", decoded); // Debug

    // Find user in the database
    const user = await Admin.findById(decoded.id).select("-password");
    if (!user) {
      console.log("User not found for ID:", decoded.id);
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    // Attach user to request
    req.user = user;
    console.log("User attached to request:", req.user); // Debug
    next();
  } catch (error) {
    console.error("Token verification error:", error.message); // Debug
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Unauthorized: Token expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
    return res.status(401).json({ message: "Unauthorized: Token verification failed" });
  }
};

const isSuperAdmin = (req, res, next) => {
  console.log("Checking user role:", req.user.role); // Debug
  if (!req.user || req.user.role !== "HR Admin") {
    console.log("Access denied. User role:", req.user ? req.user.role : "No user");
    return res.status(403).json({ message: "Access denied. HR Admins only." });
  }
  next();
};

export { protect, isSuperAdmin };