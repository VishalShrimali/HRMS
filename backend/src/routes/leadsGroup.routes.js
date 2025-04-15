// groupsRoutes.js
import express from "express";
import {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  addMembersToGroup,
  addLeadToGroup 
} from "../controllers/leadsGroup.controllers.js"; 

const groupRouter = express.Router();

// Protected routes (require authentication)
//groupRouter.use(authMiddleware);

// CRUD Routes
groupRouter.get("" ,getGroups);
groupRouter.get("/:id", getGroupById);
groupRouter.post("/create", createGroup);
groupRouter.put("/:id", updateGroup);
groupRouter.delete("/:id", deleteGroup);
groupRouter.put('/:id/:uid' , addLeadToGroup );

// Member management route
groupRouter.post("/members/:id", addMembersToGroup);

export default groupRouter;