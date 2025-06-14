import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user.model.js";
dotenv.config();

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token

    console.log("Header : ", req.headers.authorization); // Log when token is missing

    if (!token)
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (err) {
      console.error("Token verification failed:", err.message); // Log the error for debugging
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    req.user = await User.findById(decoded.id)
      .populate("role")
      .select("-password"); // Attach user to req
    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }
    console.log("Authenticated user:", req.user);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const isSuperAdmin = (req, res, next) => {
  if (req.user.role?.name !== "Admin") {
    return res
      .status(403)
      .json({ message: "Access denied. Super Admins only." });
  }
  next();
};

const decodeJWTGetUser = async (headers) => {
  let decoded;
  try {
    const token = headers.authorization?.split(" ")[1]; // Extract token
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  return await User.findById(decoded.id).populate("role").select("-password"); // User is Returned in the End.
};

// New function to authorize specific roles or an array of roles
const authorizeRole = async (roles, req, res, next) => {
  try {
    console.log("Authorization headers: ", req.headers); // Log headers for debugging

    const token = req.headers.authorization?.split(" ")[1]; // Extract token
    console.log("Extracted token: ", token); // Log the extracted token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (err) {
      console.error("Token verification failed:", err.message); // Log the error for debugging
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = await User.findById(decoded.id)
      .populate("role")
      .select("-password"); // Fetch user and populate role
    if (!user) {
      console.log("Victim Card : Token is missing or undefined"); // Log when token is missing
      return res.status(401).json({ message: "Unauthorized Main", token });
    }

    if (!user) {
      console.log("Victim Card : User not found"); // Log when user is invalid
      return res.status(401).json({ message: "Invalid user" });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    if (!allowedRoles.includes(user.role.name)) {
      // Assuming role has a 'name' field
      console.log(`Victim Card : User role (${user.role.name}) not authorized`); // Log unauthorized role
      return res
        .status(403)
        .json({
          message: `Access denied. Only ${allowedRoles.join(
            ", "
          )} users are allowed.`,
        });
    }

    req.user = user; // Attach user to req
    next(); // Ensure next() is called only once
  } catch (error) {
    console.log("Victim Card : Error occurred", error); // Log any errors
    if (!res.headersSent) {
      // Prevent multiple responses
      return res.status(401).json({ message: "Invalid token" });
    }
  }
};

export { protect, isSuperAdmin, authorizeRole, decodeJWTGetUser };
