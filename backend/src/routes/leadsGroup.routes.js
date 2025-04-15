import {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  addMembersToGroup
} from "../controllers/leadsGroup.controllers.js"; // <-- Corrected file name
import express from "express";
import { authorizeRole } from "../middleware/auth.middlware.js"; // Correct typo

const groupRouter = express.Router();

// CRUD Routes
groupRouter.get("/", authorizeRole, getGroups); // Explicit "/"
groupRouter.get("/:id", authorizeRole, getGroupById);
groupRouter.post("/creategroup", createGroup);
groupRouter.put("/:id", updateGroup);
groupRouter.delete("/:id", deleteGroup);

// Member management route (match controller)
// groupRouter.put("/:id/members", addMembersToGroup);

export default groupRouter;