import { Role } from "../models/role.models.js";
import jwt from "jsonwebtoken";
import User  from '../models/user.model.js'

export const addRole = async (req, res) => {
  try {
    const { name, permissions } = req.body;

    for (const permission of permissions) {
      if (permission === "*****") {
        return res.status(401).json({ message: "You Can't Assign All Permission Identifier to this Role" });
      }
    }

    const role = new Role({ name, permissions });
    await role.save();
    res.status(201).json({ message: "Role added successfully", role });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const addPermissionsToRole = async (req, res) => {
  try {
    const { name } = req.params;
    const { permissions } = req.body;

    const role = await Role.findOneAndUpdate(
      { name },
      { $addToSet: { permissions: { $each: permissions } } },
      { new: true }
    );

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.status(200).json({ message: "Permissions added successfully", role });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getPermissionsByRole = async (req, res) => {
  try {
    const { name } = req.params;

    const role = await Role.findOne({ name });
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.status(200).json({ permissions: role.permissions });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const removePermissionsFromRole = async (req, res) => {
  try {
    const { name, permissions } = req.params;
    const permissionsArray = permissions.split(";");

    const role = await Role.findOneAndUpdate(
      { name },
      { $pull: { permissions: { $in: permissionsArray } } },
      { new: true }
    );
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    res.status(200).json({ message: "Permissions removed successfully", role });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getRoles = async (req, res) => {
  try {
    const roles = await Role.find({});
    res.status(200).json( roles );
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getUserRoleAndPermissions = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Authorization token is required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token", error: err.message });
    }
    const user = await User.findById(decoded.id).populate("role"); // Assuming User model has a 'role' field

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has a role assigned
    if (!user.role) {
      return res.status(200).json({ 
        role: "NO_ROLE", 
        permissions: [],
        message: "User has no role assigned"
      });
    }

    const role = user.role.name;
    const permissions = user.role.permissions;

    res.status(200).json({ role, permissions });
  } catch (error) {
    res.status(400).json({ message: "Error fetching user role and permissions", error: error.message });
  }
};

// Get available roles for assignment
export const getAvailableRoles = async (req, res) => {
  try {
    const roles = await Role.find({}, '_id name level').sort({ level: 1 });
    if (!roles || roles.length === 0) {
      return res.status(200).json({ 
        roles: [],
        message: 'No roles found'
      });
    }
    res.status(200).json({ roles });
  } catch (error) {
    console.error('Error in getAvailableRoles:', error);
    res.status(500).json({ 
      error: 'Failed to fetch available roles',
      details: error.message 
    });
  }
};
