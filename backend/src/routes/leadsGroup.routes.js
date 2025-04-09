// groupsRoutes.js
import express from "express";
import {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  addMembersToGroup,
} from "../controllers/leadsGroup.controllers.js";
import { authorizeRole } from '../middleware/auth.middlware.js';
//import authMiddleware from "../middleware/auth.middlware.js"; // Assuming authentication middleware

const groupRouter = express.Router();

// Protected routes (require authentication)
//groupRouter.use(authMiddleware);

// CRUD Routes
groupRouter.get("" ,getGroups);
groupRouter.get("/:id", getGroupById);
groupRouter.post("/", createGroup);
groupRouter.put("/:id", updateGroup);
groupRouter.delete("/:id", deleteGroup);

// Member management route
groupRouter.post("/members/:id", addMembersToGroup);

export default groupRouter;