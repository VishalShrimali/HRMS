import Email from "../models/email.models.js";
import Template from "../models/template.models.js";
import mongoose from "mongoose";

// Get all emails with role-based access
export const getEmails = async (req, res) => {
  try {
    let query = {};
    console.log('Request query:', req.query);
    console.log('Requested userId:', req.query.userId);
    console.log('Logged-in user _id:', req.user._id);
    console.log('Logged-in user role:', req.user.role?.name);

    // If userId is provided in the query, always filter by that user
    if (req.query.userId) {
      try {
        const userId = new mongoose.Types.ObjectId(req.query.userId);
        query.createdBy = userId;
        console.log('Query before execution:', {
          query: JSON.stringify(query),
          userId: userId.toString(),
          userIdType: typeof userId
        });
      } catch (error) {
        console.error('Error converting userId to ObjectId:', error);
        return res.status(400).json({ message: "Invalid userId format" });
      }
    } else {
      // If not admin, only show their own emails
      if (req.user.role?.name !== "ADMIN") {
        query.createdBy = req.user._id;
      }
      // If admin and no userId, show all emails (query remains {})
    }

    // First, let's check what emails exist in the database
    const allEmails = await Email.find({}).select('createdBy title').lean();
    console.log('All emails in database:', allEmails.map(email => ({
      id: email._id.toString(),
      title: email.title,
      createdBy: email.createdBy.toString()
    })));

    // Now execute the filtered query
    const emails = await Email.find(query).sort({ createdOn: -1 });
    console.log('Filtered emails:', emails.map(email => ({
      id: email._id.toString(),
      title: email.title,
      createdBy: email.createdBy.toString()
    })));
    
    res.status(200).json(emails);
  } catch (error) {
    console.error("Error fetching emails:", error);
    res.status(500).json({ message: "Error fetching emails" });
  }
};

// Get single email with role-based access
export const getEmailById = async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);
    
    if (!email) {
      return res.status(404).json({ message: "Email not found" });
    }

    // Check if user is admin or the creator of the email
    const isAdmin = req.user.role?.name === "ADMIN";
    const isCreator = email.createdBy.toString() === req.user._id.toString();
    
    if (!isAdmin && !isCreator) {
      return res.status(403).json({ message: "You don't have permission to access this email" });
    }

    res.status(200).json(email);
  } catch (error) {
    console.error("Error fetching email:", error);
    res.status(500).json({ message: "Error fetching email" });
  }
};

// Create new email
export const createEmail = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    const email = new Email({
      title,
      description,
      createdBy: req.user._id
    });

    await email.save();
    res.status(201).json(email);
  } catch (error) {
    console.error("Error creating email:", error);
    res.status(500).json({ message: "Error creating email" });
  }
};

// Update email with role-based access
export const updateEmail = async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);
    
    if (!email) {
      return res.status(404).json({ message: "Email not found" });
    }

    // Check if user is admin or the creator of the email
    const isAdmin = req.user.role?.name === "ADMIN";
    const isCreator = email.createdBy.toString() === req.user._id.toString();
    
    if (!isAdmin && !isCreator) {
      return res.status(403).json({ message: "You don't have permission to update this email" });
    }

    const updatedEmail = await Email.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedEmail);
  } catch (error) {
    console.error("Error updating email:", error);
    res.status(500).json({ message: "Error updating email" });
  }
};

// Delete email with role-based access
export const deleteEmail = async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);
    
    if (!email) {
      return res.status(404).json({ message: "Email not found" });
    }

    // Check if user is admin or the creator of the email
    const isAdmin = req.user.role?.name === "ADMIN";
    const isCreator = email.createdBy.toString() === req.user._id.toString();
    
    if (!isAdmin && !isCreator) {
      return res.status(403).json({ message: "You don't have permission to delete this email" });
    }

    // Delete associated template if exists
    await Template.findOneAndDelete({ emailId: req.params.id });
    
    // Delete the email
    await Email.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Email and associated template deleted successfully" });
  } catch (error) {
    console.error("Error deleting email:", error);
    res.status(500).json({ message: "Error deleting email" });
  }
};