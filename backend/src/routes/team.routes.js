import express from "express";
import { protect } from "../middleware/auth.middlware.js";
import {
    createTeamMember,
    getTeamMembers,
    updateTeamMember,
    removeTeamMember,
    getTeamHierarchy
} from "../controllers/team.controllers.js";

const teamRouter = express.Router();

// All routes are protected
teamRouter.use(protect);

// Create a new team member
teamRouter.post("/members", createTeamMember);

// Get all team members under the current user
teamRouter.get("/members", getTeamMembers);

// Get the complete team hierarchy
teamRouter.get("/hierarchy", getTeamHierarchy);

// Update a team member
teamRouter.put("/members/:userId", updateTeamMember);

// Remove a team member
teamRouter.delete("/members/:userId", removeTeamMember);

export { teamRouter }; 