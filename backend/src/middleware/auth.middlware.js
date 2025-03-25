import jwt from "jsonwebtoken";
import { Admin } from "../models/admin.models.js";
import dotenv from "dotenv";
dotenv.config();
const protect = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]; // Extract token
        if (!token) return res.status(401).json({ message: "Unauthorized" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = await Admin.findById(decoded.id).select("-password"); // Attach user to req
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

const isSuperAdmin = (req, res, next) => {
    if (req.user.role !== "HR Admin") {
        return res.status(403).json({ message: "Access denied. Super Admins only." });
    }
    next();
};

export { protect, isSuperAdmin };
