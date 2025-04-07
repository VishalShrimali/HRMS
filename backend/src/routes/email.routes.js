import express from "express";
import {
  getEmails,
  getEmailById,
  createEmail,
  updateEmail,
  deleteEmail,
} from "../services/emailService.js";

const emailRoutes = express.Router();

emailRoutes.get("/", async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  try {
    const emails = await getEmails(page, limit, search);
    res.json(emails);
  } catch (error) {
    res.status(500).json({ message: "Error fetching emails", error });
  }
});

emailRoutes.get("/:id", async (req, res) => {
  try {
    const email = await getEmailById(req.params.id);
    res.json(email);
  } catch (error) {
    res.status(500).json({ message: "Error fetching email", error });
  }
});

emailRoutes.post("/", async (req, res) => {
  try {
    const email = await createEmail(req.body);
    res.status(201).json(email);
  } catch (error) {
    res.status(500).json({ message: "Error creating email", error });
  }
});

emailRoutes.put("/:id", async (req, res) => {
  try {
    const email = await updateEmail(req.params.id, req.body);
    res.json(email);
  } catch (error) {
    res.status(500).json({ message: "Error updating email", error });
  }
});

emailRoutes.delete("/:id", async (req, res) => {
  try {
    await deleteEmail(req.params.id);
    res.json({ message: "Email design deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting email", error });
  }
});
emailRoutes.post('/templates', async (req, res) => {
    try {
        const { title, html, design } = req.body;
        const newTemplate = new EmailTemplate({ title, html, design });
        await newTemplate.save();
        res.status(201).json(newTemplate);
    } catch (error) {
        res.status(500).json({ message: "Error saving template", error });
    }
})



export default emailRoutes;
