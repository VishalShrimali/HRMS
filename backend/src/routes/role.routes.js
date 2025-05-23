import express from "express";
import { addRole, addPermissionsToRole, getPermissionsByRole, removePermissionsFromRole, getRoles, getUserRoleAndPermissions, getAvailableRoles } from "../controllers/role.controllers.js";

const router = express.Router();

router.get('', getRoles);

// Route to add a new role
router.post("/add", addRole);

// Route to add permissions to an existing role
router.put("/permissions/add/:name", addPermissionsToRole);

// Route to get permissions based on role
router.get("/permissions/:name", getPermissionsByRole);

// Route to remove permissions from a role
router.delete("/permissions/remove/:name/:permissions", removePermissionsFromRole);

// Route to get the role and permissions of the current user
router.get("/user/permissions", getUserRoleAndPermissions);

router.get('/available', getAvailableRoles);

export default router;
