import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    permissions: [{ type: String }] // Example: ["View Employees", "Manage Policies"]
  },
  { timestamps: true }
);

RoleSchema.statics.initializeDefaultRoles = async function () {
    const defaultRoles = ["Employee"];
    for (const name of defaultRoles) {
        await this.findOneAndUpdate(
            { name },
            { name },
            { upsert: true, new: true }
        );
    }
};

export const Role = mongoose.model("Role", RoleSchema);

// Initialize default roles when the model is loaded
Role.initializeDefaultRoles();
