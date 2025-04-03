import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    permissions: [{ type: String }], // Example: ["View Employees", "Manage Policies"]
  },
  { timestamps: true }
);

RoleSchema.statics.initializeDefaultRoles = async function () {
  const defaultRoles = [
    {
      name: process.env.DEFAULT_SUPER_USER,
      permissions: [process.env.DEFAULT_ALL_PERMISSION],
    },
  ];
  for (const role of defaultRoles) {
    await this.findOneAndUpdate(
      { name: role.name },
      { name: role.name, permissions: role.permissions },
      { upsert: true, new: true }
    );
  }
};

export const Role = mongoose.model("Role", RoleSchema);

// Initialize default roles when the model is loaded
Role.initializeDefaultRoles();
