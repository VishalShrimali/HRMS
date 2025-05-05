import express from "express";
import { protect } from "../middleware/auth.middlware.js";
import {
  getEmails,
  getEmailById,
  createEmail,
  updateEmail,
  deleteEmail
} from "../controllers/email.controllers.js";

const emailRoutes = express.Router();

// Apply authentication middleware to all routes
emailRoutes.use(protect);

// Get all emails
emailRoutes.get("/", getEmails);

// Get single email
emailRoutes.get("/:id", getEmailById);

// Create new email
emailRoutes.post("/", createEmail);

// Update email
emailRoutes.put("/:id", updateEmail);

// Delete email
emailRoutes.delete("/:id", deleteEmail);

export default emailRoutes;
