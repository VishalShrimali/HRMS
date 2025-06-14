import User from "../models/user.model.js";  
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sendResetLink } from "../utils/email.utils.js";
import { encrypt } from "../../helper/helper.js";
import mongoose from "mongoose";

dotenv.config(); // Load environment variables

// Register a new user
export const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password, country } = req.body;

        console.log("Received registration data:", req.body);

        // Validate required fields
        if (!firstName || !lastName || !email || !phone || !password || !country) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        // Check if this is the first user
        const userCount = await User.countDocuments();
        const isFirstUser = userCount === 0;

        let fullName = `${firstName} ${lastName}`;
        const joinDate = Date.now();
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Create user data (do not assign role for non-first users)
        const userData = {
            firstName,
            lastName,
            fullName,
            email,
            phone,
            password: hashedPassword,
            country,
            dates: { joinDate }
        };

        if (isFirstUser) {
            // For first user, assign ADMIN role.
            const Role = mongoose.model("Role");
            let adminRole = await Role.findOne({ name: "ADMIN" });
            if (!adminRole) {
                // Create ADMIN role if it doesn't exist and supply createdBy
                adminRole = await Role.create({
                    name: "ADMIN",
                    description: "System Administrator with full access",
                    permissions: ["*****"],
                    level: 0,
                    isSystem: true,
                    createdBy: new mongoose.Types.ObjectId() // temporary ObjectId
                });
            }
            userData.role = adminRole._id;
            userData.level = 0; // Super Admin
            // Supply a temporary valid ObjectId for createdBy
            userData.createdBy = new mongoose.Types.ObjectId();
        } else {
            // For subsequent registrations, assign a default "PENDING" role.
            const Role = mongoose.model("Role");
            let pendingRole = await Role.findOne({ name: "PENDING" });
            if (!pendingRole) {
                pendingRole = await Role.create({
                    name: "PENDING",
                    description: "Pending approval by admin",
                    permissions: [],
                    level: 99,
                    isSystem: false,
                    createdBy: new mongoose.Types.ObjectId() // temporary ObjectId
                });
            }
            userData.role = pendingRole._id;
            userData.level = 99; // Adjust level as needed
            userData.createdBy = req.user ? req.user._id : new mongoose.Types.ObjectId();
        }

        const user = await User.create(userData);

        // For self-registrations, update the createdBy to user's own _id after creation
        if (!req.user) {
            user.createdBy = user._id;
            await user.save();
        }

        // Generate token for immediate login (if role has been assigned)
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "1d" }
        );

        console.log("User registered successfully:", user);
        res.status(201).json({
            message: "User registered successfully. An admin will assign you a role shortly.",
            token,
            user: {
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                level: user.level
            },
            isAdmin: isFirstUser
        });
    } catch (error) {
        console.error("Error during registration:", error.message);
        res.status(400).json({ message: error.message });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        console.log("Received forgot password request for email:", email);

        // Check if the email exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Email not found" });
        }

        // Generate a reset token
        const resetToken = jwt.sign(
            { id: user._id, type: 'passwordReset' }, 
            process.env.JWT_SECRET_KEY, 
            { expiresIn: "1h" }
        );

        console.log("Reset token generated:", resetToken);

        // Debug: Check FRONTEND_URL
        console.log("FRONTEND_URL from env:", process.env.FRONTEND_URL);

        // Generate the reset link
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        // Send the reset link via email
        await sendResetLink(email, resetLink);

        res.status(200).json({ message: "Password reset link sent to your email" });
    } catch (error) {
        console.error("Error during password reset:", error.message);
        res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
};

// reset password
export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ message: "Token and password are required." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token." });
        }

        // Hash the password with salt rounds = 10
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log("New hashed password:", hashedPassword); // 🔍 Check if hashing works properly

        user.password = hashedPassword;
        await user.save();

        console.log("Password successfully saved to DB."); 
        res.status(200).json({ message: "Password reset successful." });
    } catch (error) {
        console.error("Error resetting password:", error.message);
        res.status(500).json({ message: "Error resetting password. Please try again." });
    }
};
//  Login user
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log("Login attempt with email:", email); // Debugging log

        // Check if email exists
        const user = await User.findOne({ email }).populate('role');
        if (!user) {
            console.log("Email not found:", email); // Debugging log
            return res.status(401).json({ message: "Email not found. Please register first." });
        }

        console.log("User found:", user); // Debugging log
       
        // Validate password
        const isPasswordValid = encrypt.comparePassword(user.password, password); // Use the helper function to compare passwords
        console.log(password)
        console.log(user.password);

        if (!isPasswordValid) {
            console.log("Password mismatch detected."); // Debugging log
            return res.status(401).json({ message: "Incorrect password. Please try again." });
        }

        // Check if user has a role assigned
        if (!user.role) {
            return res.status(403).json({ 
                message: "Your account is pending approval. Please wait for an administrator to assign your role.", 
                needsRole: true 
            });
        }

        // Generate token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
        res.status(200).json({ 
            message: "Login successful", 
            token, 
            user: { 
                fullName: user.fullName, 
                role: user.role,
                roleName: user.role.name,
                permissions: user.role.permissions
            } 
        });
    } catch (error) {
        console.error("Error during login:", error.message); // Debugging log
        res.status(500).json({ message: "An error occurred during login. Please try again later." });
    }
};

// Get user profile
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
    try {
        const updates = req.body;
        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }
        const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "Profile updated successfully", user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// // Get all users (Admin/HR Admin only)
// export const getAllUsers = async (req, res) => {
//     try {
//         const users = await User.find().select("-password");
//         res.status(200).json(users);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// Get user by ID (Admin/HR Admin only)
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update user role (Super Admin only)
export const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User role updated successfully", user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add role to user
export const addRoleToUser = async (req, res) => {
    try {
        console.log("Heere BUddy! ");
        const { userId, roleId } = req.body;

        const user = await User.findByIdAndUpdate({ _id: userId }, { role: roleId }, { new: true }).populate("role");

        if (!user) {
            return res.status(404).json({ message: "User not found" }); // Ensure response is sent only once
        }
        return res.status(200).json({ message: "Role assigned successfully", user }); // Ensure response is sent only once
    } catch (error) {
        console.error("Error in addRoleToUser:", error.message); // Log the error for debugging
        if (!res.headersSent) { // Check if headers have already been sent
            return res.status(500).json({ message: error.message });
        }
    }
};

export const getAllUsersWithFirstNameLastNameId = async (req, res) => {
    try {
        const users = await User.find({}, "firstName lastName _id email");
        res.status(200).json({ users });
    } catch (error) {
        console.error("Error in getAllUsersWithFirstNameLastNameId:", error.message);
        res.status(500).json({ message: error.message });
    }
};


export const getUsersWithPagination = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;

        // Extract token and decode user ID
        const token = req.headers.authorization?.split(" ")[1]; // Extract token
        console.log("Extracted token: ", token); // Log the extracted token

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userId = decoded.id; // Get user ID from token

        const query = {
            ...search ? { fullName: { $regex: search, $options: "i" } } : {},
            _id: { $ne: userId }, // Exclude the user who initiated the request
        };

        const users = await User.find(query)
            .populate("role")
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .select("-password");

        const totalUsers = await User.countDocuments(query);

        res.status(200).json({
            users,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: parseInt(page),
        });
    } catch (error) {
        console.error("Error in getUsersWithPagination:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// Set password for invited user
export const setPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        console.log("Set password request received. Token length:", token?.length, "Password length:", password?.length);

        if (!token || !password) {
            console.log("Missing token or password.");
            return res.status(400).json({ message: "Token and password are required." });
        }
        const user = await User.findOne({ passwordSetupToken: token });
        console.log("User found with token:", !!user);

        if (!user || !user.passwordSetupExpires || user.passwordSetupExpires < new Date()) {
            console.log("Invalid or expired token detected.");
            console.log("User exists:", !!user, "passwordSetupExpires exists:", !!user?.passwordSetupExpires, "Expired:", user?.passwordSetupExpires < new Date());
            return res.status(400).json({ message: "Invalid or expired token." });
        }
        // Hash the password
        const bcrypt = await import('bcrypt');
        const hashedPassword = await bcrypt.default.hash(password, 10);
        user.password = hashedPassword;
        user.passwordSetupToken = undefined;
        user.passwordSetupExpires = undefined;
        await user.save();
        res.status(200).json({ message: "Password set successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error setting password. Please try again." });
    }
};
