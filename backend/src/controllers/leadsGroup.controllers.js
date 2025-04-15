// groupsController.js
import express from "express";
import { Group } from "../models/group.models.js";
import { decodeJWTGetUser } from "../middleware/auth.middlware.js";
import User from "../models/user.model.js";

// groupsController.js


const handleError = (res, error, statusCode = 500) => {
  console.error(error.message || error);
  if (!res.headersSent) {
    res
      .status(statusCode)
      .json({ message: error.message || "Internal Server Error" });
  }
};

export const getGroups = async (req, res) => {
  try {
<<<<<<< HEAD
    const groups = await Group.find().populate("members", "firstName lastName email");
    const transformedGroups = groups.map((group) => ({
      id: group._id.toString(),
      name: group.name,
      description: group.description || "-",
      contacts: group.members.length,
      createdOn: group.createdDate.toISOString().split("T")[0],
    }));
    res.status(200).json({ message: "Groups fetched successfully", groups: transformedGroups });
=======
    const groups = await Group.find().populate(
      "leads",
      "firstName lastName email"
    ); // Populate lead details

    console.log(groups);
    res.status(200).json({ message: "Groups fetched successfully", groups });
>>>>>>> 242b43d564d65e279c16418da246f70fa3f4e42a
  } catch (error) {
    handleError(res, error);
  }
};

// ... other functions unchanged

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

<<<<<<< HEAD
    const newMembers = [...new Set([...group.members, ...memberIds])]; // Avoid duplicates
    group.members = newMembers;
=======
    // Verify that memberIds are valid Lead IDs (optional, depending on your needs)
    // This could be enhanced with a check against the Lead model
    const newLeads = [...new Set([...group.leads, ...leadIds])]; // Avoid duplicates
    group.leads = newLeads;

>>>>>>> 242b43d564d65e279c16418da246f70fa3f4e42a
    const updatedGroup = await group.save();

    res
      .status(200)
      .json({ message: "Leads added successfully", group: updatedGroup });
  } catch (error) {
    handleError(res, error);
  }
};


// Add a lead to a group using :id (group ID) and :uid (user ID)
export const addLeadToGroup = async (req, res) => {
  try {
    const { id, uid } = req.params; // Extract group ID and user ID from params

    console.log("LEad : ", id, uid);

    // Find the group by ID
    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if the user (lead) exists by user ID (uid)
    const user = await User.findById(uid); // Assuming you have a User model
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is already a lead in the group
    if (group.leads.includes(uid)) {
      return res.status(400).json({ message: "User is already a lead in this group" });
    }

    // Add the user as a lead in the group
    group.leads.push(uid);

    const updatedGroup = await group.save();



    res
      .status(200)
      .json({ message: "Lead added successfully", group: updatedGroup });
  } catch (error) {
    handleError(res, error);
  }
};

