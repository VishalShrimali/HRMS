import express from "express";
import Template from "../models/template.models.js"; // don't forget `.js` at the end
import nodemailer from "nodemailer";
import mongoose from "mongoose"; // Import mongoose for ObjectId validation
const router = express.Router();

// ✅ Save new template
router.post("/", async (req, res) => {
  const { title, html, emailId, design  } = req.body;

  if (!title || !html || !emailId || !design) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const newTemplate = new Template({ title, html, emailId, design });
    await newTemplate.save();
    res.status(201).json({ message: "✅ Template saved", template: newTemplate });
  } catch (error) {
    console.error("❌ Error saving template:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET template by emailId

  router.get("/email/:emailId", async (req, res) => { // Fixed typo: ":email purchasingId" -> ":emailId"
    const { emailId } = req.params;
  
    // Optional: Validate emailId if it’s an ObjectId
    if (!mongoose.Types.ObjectId.isValid(emailId)) {
      return res.status(400).json({ message: "Invalid emailId" });
    }
  
    try {
      const template = await Template.findOne({ emailId });
  
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
  
      // Shape response to match frontend expectations
      const response = {
        title: template.title,
        design: template.design,
      };
  
      res.json(response);
    } catch (err) {
      console.error("❌ Error fetching template:", err.message, err.stack);
      res.status(500).json({ message: "Server error" });
    }
  });

router.post("/send", async (req, res) => {
  console.log( req.body);

    const { to, emailId } = req.body;
  
    if (!to || !emailId) {
      return res.status(400).json({ message: "Missing recipient or email ID" });
    }
  
    try {
      console.log("📩 Looking for template with emailId:", emailId);

      // Get the template by emailId
      const template = await Template.findOne({ emailId });
  
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
  
      // Configure the SMTP transporter
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST, // change this for other providers
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
          user: process.env.SMTP_USER, // e.g. "your-email@gmail.com"
          pass: process.env.SMTP_PASS  // app password or real password
        }
      });
  
      // Email options
      const mailOptions = {
        from: process.env.SMTP_USER,
        to,
        subject: template.title,
        html: template.html
      };
  
      // Send the email
      await transporter.sendMail(mailOptions);
  
      res.status(200).json({ message: "✅ Email sent successfully!" });
  
    } catch (error) {
      console.error("❌ Error sending email:", error);
      res.status(500).json({ message: "Failed to send email", error });
    }
  });

// ✅ UPDATE template by emailId
  router.put("/email/:emailId", async (req, res) => {
    const { emailId } = req.params;
    const { title, html, design } = req.body;
  
    if (!title || !html || !design) {
      return res.status(400).json({ message: "Missing fields" });
    }
  
    // Optional: Validate ObjectId if needed
    if (!mongoose.Types.ObjectId.isValid(emailId)) {
      return res.status(400).json({ message: "Invalid emailId" });
    }
  
    try {
      const updatedTemplate = await Template.findOneAndUpdate(
        { emailId },
        { title, html, design },
        { new: true, upsert: true } // upsert will create if not found
      );
  
      res.status(200).json({ message: "✅ Template updated", template: updatedTemplate });
    } catch (error) {
      console.error("❌ Error updating template:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  console.log("🚀 Template routes loaded");
export default router;
