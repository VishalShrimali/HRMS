import { Employee } from "../models/employee.models.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { Log } from "../models/logs.models.js";

dotenv.config();

// ✅ Employee Registration
const RegisterEmployee = async (req, res) => {
  try {
    const { fullName, email, phone, password, joiningDate, birthday, workAnniversary, address } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !password || !joiningDate || !birthday) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    // Check if employee already exists
    const existingUser = await Employee.findOne({ email });
 if (existingUser) {
      return res.status(400).json({ message: "Employee already exists" });
    }

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new employee
    const employee = await Employee.create({
      fullName,
      email,
      phone,
      password: hashedPassword,
      joiningDate,
      birthday,
      workAnniversary,
      address,
      role: "Employee",
      status: "Active",
      notifications: {
        birthdayWishSent: false,
        anniversaryWishSent: false,
        policyRenewalReminderSent: false,
      }
    });

    // Store log entry
    await Log.create({
      action: "EMPLOYEE_REGISTERED",
      performedBy: employee._id,
      details: `Employee ${employee.fullName} registered with email ${employee.email}.`,
    });

    return res.status(201).json({
      message: "Employee registered successfully",
      name: employee.fullName,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Employee Login
const LoginEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(404).json({ message: "Invalid user credentials" });
    }

    // Use comparePassword method from model
    const isMatch = await employee.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: employee._id, role: employee.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: employee._id,
        fullName: employee.fullName,
        email: employee.email,
        role: employee.role,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Get Employee Profile
const GetEmployeeProfile = async (req, res) => {
  try {
    const employee = await Employee.findById(req.user._id).select("-password");

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.status(200).json({
      message: "Employee profile fetched successfully",
      employee,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Update Employee Profile
const UpdateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, role } = req.body;

    let employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    if (fullName) employee.fullName = fullName;
    if (email) employee.email = email;
    if (phone) employee.phone = phone;
    if (role) employee.role = role;

    await employee.save();

    return res.status(200).json({
      message: "Employee updated successfully",
      employee,
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Delete Employee
const DeleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    let employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    await Employee.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Employee deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Get Employee Logs
const GetEmployeeLogs = async (req, res) => {
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

// ✅ Get All Leads (for HR Admin)
const GetAllLeads = async (req, res) => {
  try {
    const leads = await Employee.find().select("-password");
    if (!leads || leads.length === 0) {
      return res.status(404).json({ message: "No leads found" });
    }
    return res.status(200).json({
      message: "Leads fetched successfully",
      leads,
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Add New Lead (for HR Admin)
const AddLead = async (req, res) => {
  try {
    const { fullName, email, phone, phoneNumber, birthday, country, joiningDate, tags } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !joiningDate || !birthday) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    // Check if employee already exists
    const existingUser = await Employee.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Employee already exists" });
    }

    // Create new lead (no password required for leads added by HR Admin)
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

    // Store log entry
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

// ✅ Delete Lead (for HR Admin)
const DeleteLead = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Lead not found" });
    }

    await Employee.findByIdAndDelete(id);

    // Store log entry
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

export {
  RegisterEmployee,
  LoginEmployee,
  GetEmployeeProfile,
  UpdateEmployee,
  DeleteEmployee,
  GetEmployeeLogs,
  GetAllLeads,
  AddLead,
  DeleteLead,
};