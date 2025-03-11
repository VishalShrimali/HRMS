import { Admin } from "../models/admin.models.js";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()
const RegisterAdmin = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    if (!email || !password || !fullName || !phone) {
      return res.status(404).json({
        message: "All fields are required",
      });
    }
    const existinguser = await Admin.findOne({ email });
    if (existinguser) {
      return res.status(404).json({
        message: "User already exists",
      });
    }

    const user = await Admin.create({ fullName, email, phone, password });
    return res.status(201).json({
      message: "User created succesfully",
      name: user.fullName,
    });
  } catch (error) {
    console.log("Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};



const LoginAdmin = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(404).json({
          message: "All fields are required",
        });
      }
      const existinguser = await Admin.findOne({ email });
      if (!existinguser) {
        return res.status(404).json({
          message: "Invalid user credential exists",
        });
      }
  
      //🔹 Use comparePassword method from model
      const isMatch = await existinguser.comparePassword(password);
      if (!isMatch) {
          return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT Token
      const token = jwt.sign(
          { id: existinguser._id, role: existinguser.role },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "7d" }
      );

      return res.status(200).json({
          message: "Login successful",
          token,
          user: {
              id: existinguser._id,
              fullName: existinguser.fullName,
              email: existinguser.email,
              role: existinguser.role
          }
      });
    } catch (error) {
      console.log("Error:", error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
};

const GetAdminProfile = async (req, res) => {
    try {
        // 🔹 req.user is set by the authentication middleware
        console.log(req.user._id);
        
        const admin = await Admin.findById(req.user._id).select("-password"); // Exclude password

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        return res.status(200).json({
            message: "Admin profile fetched successfully",
            admin
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const updateAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, email, phone, role } = req.body; // Fields to update

        // Find the admin by ID
        let admin = await Admin.findById(id);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        // Update the fields if provided
        if (fullName) admin.fullName = fullName;
        if (email) admin.email = email;
        if (phone) admin.phone = phone;
        if (role) admin.role = role; // Allow updating role if necessary

        // Save the updated admin
        await admin.save();

        return res.status(200).json({
            message: "Admin updated successfully",
            admin,
        });
    } catch (error) {
        console.error("Error updating admin:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
const deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, email, phone, role } = req.body; // Fields to update

        // Find the admin by ID
        let admin = await Admin.findById(id);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        const deleteadmin = await Admin.findByIdAndDelete(id)


        return res.status(200).json({
            message: "Admin deleted successfully",
            admin,
        });
    } catch (error) {
        console.error("Error updating admin:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export { RegisterAdmin, LoginAdmin, GetAdminProfile, updateAdmin, deleteAdmin};
