// groupsController.js
import { Group } from "../models/group.models.js";
import { decodeJWTGetUser } from "../middleware/auth.middlware.js";

// Centralized error handler
const handleError = (res, error, statusCode = 500) => {
  console.error(error.message || error);
  if (!res.headersSent) {
    res
      .status(statusCode)
      .json({ message: error.message || "Internal Server Error" });
  }
};

// Fetch all groups
export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find().populate(
      "leads",
      "firstName lastName email"
    ); // Populate lead details
    res.status(200).json({ message: "Groups fetched successfully", groups });
  } catch (error) {
    handleError(res, error);
  }
};

// Fetch group by ID
export const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate(
      "leads",
      "firstName lastName email"
    );
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    res.status(200).json(group);
  } catch (error) {
    handleError(res, error);
  }
};

// Create a new group
export const createGroup = async (req, res) => {
  try {
    let authUser = await decodeJWTGetUser(req.headers);

    console.log(authUser);

    const { name, description } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    // Check if group name already exists
    const existingGroup = await Group.findOne({ name });
    if (existingGroup) {
      return res.status(400).json({ message: "Group name already exists" });
    }

    const newGroup = new Group({
      name,
      description: description || "",
      createdBy: authUser._id,
      members: [],
    });

    const savedGroup = await newGroup.save();
    res
      .status(201)
      .json({ message: "Group created successfully", group: savedGroup });
  } catch (error) {
    handleError(res, error);
  }
};

// Update a group
export const updateGroup = async (req, res) => {
  try {
    const { name, description } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    const updatedGroup = await Group.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedGroup) {
      return res.status(404).json({ message: "Group not found" });
    }

    res
      .status(200)
      .json({ message: "Group updated successfully", group: updatedGroup });
  } catch (error) {
    handleError(res, error);
  }
};

// Delete a group
export const deleteGroup = async (req, res) => {
  try {
    const deletedGroup = await Group.findByIdAndDelete(req.params.id);
    if (!deletedGroup) {
      return res.status(404).json({ message: "Group not found" });
    }
    res
      .status(200)
      .json({ message: "Group deleted successfully", deletedGroup });
  } catch (error) {
    handleError(res, error);
  }
};

// Add members to a group
export const addMembersToGroup = async (req, res) => {
  try {
    const { leadIds } = req.body; // Array of lead IDs
    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one lead ID is required" });
    }

    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Verify that memberIds are valid Lead IDs (optional, depending on your needs)
    // This could be enhanced with a check against the Lead model
    const newLeads = [...new Set([...group.leads, ...leadIds])]; // Avoid duplicates
    group.leads = newLeads;

    const updatedGroup = await group.save();

    res
      .status(200)
      .json({ message: "Leads added successfully", group: updatedGroup });
  } catch (error) {
    handleError(res, error);
  }
};
