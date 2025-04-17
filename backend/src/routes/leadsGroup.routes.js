import express from "express";
import {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  addMembersToGroup,
  addLeadToGroup,
} from "../controllers/leadsGroup.controllers.js";
import { protect } from "../middleware/auth.middlware.js";

const groupRouter = express.Router();

// Read
groupRouter.get("/", protect, getGroups);
groupRouter.get("/:id", protect, getGroupById);

// Create
groupRouter.post("/create", protect, createGroup);

// Update
groupRouter.put("/:id/members", protect, addMembersToGroup);
groupRouter.put("/:id/:leadId", protect, addLeadToGroup);
groupRouter.put("/:id", protect, updateGroup);

// Delete
groupRouter.delete("/:id", protect, deleteGroup);

export default groupRouter;
