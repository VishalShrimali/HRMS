// groupsRoutes.js
import express from "express";
import {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  addMembersToGroup,
} from "../controllers/groupsController.js";
import authMiddleware from "../middleware/authMiddleware.js"; // Assuming authentication middleware

const groupRouter = express.groupRouter();

// Protected routes (require authentication)
groupRouter.use(authMiddleware);

// CRUD Routes
groupRouter.get("/", getGroups);
groupRouter.get("/:id", getGroupById);
groupRouter.post("/", createGroup);
groupRouter.put("/:id", updateGroup);
groupRouter.delete("/:id", deleteGroup);

// Member management route
groupRouter.post("/:id/members", addMembersToGroup);

export default groupRouter;