import { Role } from "../models/role.models.js";

export const addRole = async (req, res) => {
  try {
    const { name, permissions } = req.body;
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
