import { Admin } from "../models/admin.models.js";
import jwt from "jsonwebtoken";
import { Employee } from "../models/employee.models.js";
import dotenv from "dotenv";
import { Log } from "../models/logs.models.js";
import { Group } from "../models/group.models.js"; // Ensure the Group model is imported

dotenv.config();

// Existing Controllers (unchanged)
const RegisterAdmin = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    if (!email || !password || !fullName || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await Admin.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const admin = await Admin.create({ fullName, email, phone, password });

    await Log.create({
      action: "ADMIN_REGISTERED",
      performedBy: admin._id,
      details: `Admin ${admin.fullName} registered with email ${admin.email}.`,
    });

    return res.status(201).json({
      message: "Admin created successfully",
      name: admin.fullName,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const LoginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }
    const existingUser = await Admin.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({
        message: "Invalid user credential exists",
      });
    }

    const isMatch = await existingUser.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: existingUser._id, role: existingUser.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: existingUser._id,
        fullName: existingUser.fullName,
        email: existingUser.email,
        role: existingUser.role,
      },
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
    const admin = await Admin.findById(req.user._id).select("-password");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res.status(200).json({
      message: "Admin profile fetched successfully",
      admin,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const GetEmployeeProfileFromAdmin = async (req, res) => {
  try {
    console.log("Fetching leads...");

    const leads = await Employee.find()
      .select("-password")
      .populate("groups"); // Populate groups for each lead
    if (!leads || leads.length === 0) {
      return res.status(404).json({ message: "No leads found" });
    }

    console.log("Leads Fetched:", leads);
    res.status(200).json({ leads });
  } catch (error) {
    console.error("Error Fetching Leads:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const AddLead = async (req, res) => {
  try {
    const { fullName, email, phone, phoneNumber, birthday, country, joiningDate, tags } = req.body;

    if (!fullName || !email || !phone || !joiningDate || !birthday) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    const existingUser = await Employee.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Employee already exists" });
    }

    const employee = await Employee.create({
      fullName,
      email,
      phone,
      phoneNumber,
      birthday,
      country: country || "United States",
      joiningDate,
      tags,
      role: "Employee",
      status: "Active",
      notifications: {
        birthdayWishSent: false,
        anniversaryWishSent: false,
        policyRenewalReminderSent: false,
      },
    });

    await Log.create({
      action: "LEAD_ADDED",
      performedBy: req.user._id,
      details: `Lead ${employee.fullName} added with email ${employee.email} by HR Admin.`,
    });

    return res.status(201).json({
      message: "Lead added successfully",
      lead: employee,
    });
  } catch (error) {
    console.error("Error adding lead:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const DeleteLead = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Lead not found" });
    }

    await Employee.findByIdAndDelete(id);

    await Log.create({
      action: "LEAD_DELETED",
      performedBy: req.user._id,
      details: `Lead ${employee.fullName} deleted by HR Admin.`,
    });

    return res.status(200).json({
      message: "Lead deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, role } = req.body;

    let admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (fullName) admin.fullName = fullName;
    if (email) admin.email = email;
    if (phone) admin.phone = phone;
    if (role) admin.role = role;

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

    let admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    await Admin.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Admin deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting admin:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const GetAdminLogs = async (req, res) => {
  try {
    const logs = await Log.find().sort({ timestamp: -1 });

    if (!logs.length) {
      return res.status(404).json({ message: "No logs found" });
    }

    return res.status(200).json({ message: "Logs retrieved successfully", logs });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// New Controllers for Group Functionality
const leadGroup = async (req, res) => {
  try {
    const { name, leadIds } = req.body;
    const adminId = req.user._id; // From authentication middleware

    // Validate input
    if (!name || !leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ message: "Group name and at least one lead ID are required" });
    }

    // Verify that all lead IDs exist
    const leads = await Employee.find({ _id: { $in: leadIds } });
    if (leads.length !== leadIds.length) {
      return res.status(400).json({ message: "Some leads are invalid" });
    }

    // Create the new group
    const group = new Group({
      name,
      leads: leadIds,
      createdBy: adminId,
    });
    await group.save();

    // Update the leads to reference the new group
    await Employee.updateMany(
      { _id: { $in: leadIds } },
      { $addToSet: { groups: group._id } } // $addToSet prevents duplicates
    );

    // Update the admin's createdGroups
    await Admin.findByIdAndUpdate(
      adminId,
      { $addToSet: { createdGroups: group._id } },
      { new: true }
    );

    // Store log entry
    await Log.create({
      action: "GROUP_CREATED",
      performedBy: adminId,
      details: `Group ${name} created with ${leadIds.length} leads by HR Admin.`,
    });

    res.status(201).json({ message: "Group created successfully", group });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const GetAllGroups = async (req, res) => {
  try {
    const groups = await Group.find({ createdBy: req.user._id }).populate("leads");
    if (!groups || groups.length === 0) {
      return res.status(404).json({ message: "No groups found" });
    }
    
    res.status(200).json({ message: "Groups fetched successfully", groups });
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export {
  RegisterAdmin,
  LoginAdmin,
  GetAdminProfile,
  GetEmployeeProfileFromAdmin,
  AddLead,
  DeleteLead,
  updateAdmin,
  deleteAdmin,
  GetAdminLogs,
  leadGroup, // New export
  GetAllGroups, // New export
};
