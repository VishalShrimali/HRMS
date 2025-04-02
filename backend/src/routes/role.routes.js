import express from "express";
import { addRole, addPermissionsToRole, getPermissionsByRole, removePermissionsFromRole } from "../controllers/role.controllers.js";

const router = express.Router();

// Route to add a new role
router.post("/add", addRole);

// Route to add permissions to an existing role
router.put("/permissions/add/:roleName", addPermissionsToRole);

// Route to get permissions based on role
router.get("/permissions/:roleName", getPermissionsByRole);

// Route to remove permissions from a role
router.delete("/permissions/remove/:roleName/:permissions", removePermissionsFromRole);

export default router;
