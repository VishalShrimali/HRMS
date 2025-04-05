const express = require("express");
const EmailTemplate = require("../models/template.models"); // Assuming you have a model for email templates
const EmailTeamplateRoutes = express.Router();

// ✅ Save Email Template
EmailTeamplateRoutes.post("/save", async (req, res) => {
    try {
        const { title, description, html } = req.body;
        if (!title || !html) {
            return res.status(400).json({ message: "❌ Title and HTML content are required" });
        }

        const newTemplate = new EmailTemplate({ title, description, html });
        await newTemplate.save();
        res.status(201).json({ message: "✅ Template saved successfully!" });
    } catch (error) {
        console.error("❌ Error saving template:", error);
        res.status(500).json({ message: "❌ Error saving template", error });
    }
});

// ✅ Get all templates (with pagination)
EmailTeamplateRoutes.get("/", async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const templates = await EmailTemplate.find()
            .sort({ createdOn: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));
        res.json(templates);
    } catch (error) {
        console.error("❌ Error fetching templates:", error);
        res.status(500).json({ message: "❌ Error fetching templates", error });
    }
});

// ✅ Get template by ID
EmailTeamplateRoutes.get("/:id", async (req, res) => {
    try {
        const template = await EmailTemplate.findById(req.params.id);
        if (!template) return res.status(404).json({ message: "❌ Template not found" });
        res.json(template);
    } catch (error) {
        console.error("❌ Error fetching template:", error);
        res.status(500).json({ message: "❌ Error fetching template", error });
    }
});

// ✅ Delete template
EmailTeamplateRoutes.delete("/:id", async (req, res) => {
    try {
        await EmailTemplate.findByIdAndDelete(req.params.id);
        res.json({ message: "✅ Template deleted successfully!" });
    } catch (error) {
        console.error("❌ Error deleting template:", error);
        res.status(500).json({ message: "❌ Error deleting template", error });
    }
});

module.exports = EmailTeamplateRoutes;
