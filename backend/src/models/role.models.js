import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    permissions: [{ type: String }], // Example: ["View Employees", "Manage Policies"]
    level: { 
      type: Number, 
      required: true,
      default: 2 // 0: Super Admin, 1: Team Leader, 2: Team Member
    },
    inheritsFrom: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Role",
      default: null 
    },
    isSystem: { 
      type: Boolean, 
      default: false 
    }, // System roles cannot be deleted or modified
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true 
    }
  },
  { timestamps: true }
);

// Method to get all permissions including inherited ones
RoleSchema.methods.getAllPermissions = async function() {
  const permissions = new Set(this.permissions);
  
  if (this.inheritsFrom) {
    const parentRole = await this.model('Role').findById(this.inheritsFrom);
    if (parentRole) {
      const parentPermissions = await parentRole.getAllPermissions();
      parentPermissions.forEach(p => permissions.add(p));
    }
  }
  
  return Array.from(permissions);
};

// Method to check if role can be assigned by another role
RoleSchema.methods.canBeAssignedBy = function(assignerRole) {
  // ADMIN (level 0) can assign any role
  if (assignerRole.level === 0) return true;
  // System roles can only be assigned by Super Admin
  if (this.isSystem && assignerRole.level !== 0) return false;
  // Can only assign roles of lower level
  return assignerRole.level < this.level;
};

RoleSchema.statics.initializeDefaultRoles = async function() {
  const defaultRoles = [
    {
      name: "Super Admin",
      description: "Has full access to all features",
      permissions: ["*"], // Wildcard permission
      level: 0,
      isSystem: true,
      createdBy: null // Will be set to first user
    },
    {
      name: "Team Leader",
      description: "Can manage their team and assign limited permissions",
      permissions: [
        "manage_team",
        "view_team_leads",
        "edit_team_leads",
        "create_team_member",
        "assign_team_roles"
      ],
      level: 1,
      isSystem: true,
      createdBy: null
    },
    {
      name: "Team Member",
      description: "Basic access with team-specific permissions",
      permissions: [
        "view_own_leads",
        "edit_own_leads",
        "create_lead",
        "view_team_leads"
      ],
      level: 2,
      isSystem: true,
      createdBy: null
    }
  ];

  for (const role of defaultRoles) {
    await this.findOneAndUpdate(
      { name: role.name },
      role,
      { upsert: true, new: true }
    );
  }
};

export const Role = mongoose.model("Role", RoleSchema);

// Initialize default roles after model is created
Role.initializeDefaultRoles();
