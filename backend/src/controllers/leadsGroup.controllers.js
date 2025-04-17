import express from "express";
import { Group } from "../models/group.models.js";
import { Lead } from "../models/leads.models.js";
import { decodeJWTGetUser } from "../middleware/auth.middlware.js";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose"; // Add this import

// Handle errors consistently
const handleError = (res, error, statusCode = 500) => {
  console.error(error.message || error);
  if (!res.headersSent) {
    res
      .status(statusCode)
      .json({ message: error.message || "Internal Server Error" });
  }
};

// Add multiple leads to a group
export const addMembersToGroup = asyncHandler(async (req, res) => {
  const { leadIds } = req.body;
  const { id } = req.params;
  console.log("addMembersToGroup called with:", { id, leadIds, user: req.user });

  // Validate inputs
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid group ID");
  }
  if (!Array.isArray(leadIds) || leadIds.length === 0) {
    res.status(400);
    throw new Error("leadIds must be a non-empty array");
  }

  // Filter valid ObjectId strings
  const validLeadIds = leadIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (validLeadIds.length === 0) {
    res.status(400);
    throw new Error("No valid lead IDs provided");
  }
  if (validLeadIds.length !== leadIds.length) {
    console.warn("Invalid lead IDs filtered out:", leadIds.filter((id) => !validLeadIds.includes(id)));
  }

  // Find group
  const group = await Group.findById(id);
  if (!group) {
    res.status(404);
    throw new Error("Group not found");
  }

  // Find leads
  const leads = await Lead.find({ _id: { $in: validLeadIds } });
  if (leads.length !== validLeadIds.length) {
    res.status(400);
    throw new Error("One or more lead IDs are invalid or not found");
  }

  // Update group and leads
  group.leads = [...new Set([...group.leads, ...validLeadIds.map((id) => new mongoose.Types.ObjectId(id))])];
  await group.save();

  await Lead.updateMany(
    { _id: { $in: validLeadIds } },
    { groupId: group._id }
  );

  // Populate updated group
  const updatedGroup = await Group.findById(id).populate({
    path: "leads",
    select: "firstName lastName email phone country addresses userPreferences",
  });

  console.log("addMembersToGroup success:", { groupId: id, leadCount: validLeadIds.length });
  res.status(200).json({
    message: "Leads added successfully",
    group: updatedGroup,
  });
});

// Get all groups
export const getGroups = asyncHandler(async (req, res) => {
  const groups = await Group.find().populate({
    path: "leads",
    select: "firstName lastName email phone country addresses userPreferences",
  });
  res.status(200).json({
    message: "Groups fetched successfully",
    groups,
  });
});

// Fetch group by ID
export const getGroupById = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id).populate({
    path: "leads",
    select: "firstName lastName email phone country addresses userPreferences",
  });
  if (!group) {
    res.status(404);
    throw new Error("Group not found");
  }
  res.status(200).json(group);
});

// Create a new group
export const createGroup = asyncHandler(async (req, res) => {
  const { name, description, leads } = req.body;
  console.log("createGroup called with:", { name, description, leads, user: req.user });

  if (!name) {
    res.status(400);
    throw new Error("Group name is required");
  }

  const validLeadIds = leads?.filter((id) => mongoose.Types.ObjectId.isValid(id)) || [];
  if (validLeadIds.length !== (leads?.length || 0)) {
    console.warn("Invalid lead IDs filtered out:", leads?.filter((id) => !validLeadIds.includes(id)) || []);
  }

  const group = new Group({
    name,
    description,
    createdBy: req.user._id,
    leads: validLeadIds.map((id) => new mongoose.Types.ObjectId(id)),
  });

  await group.save();

  if (validLeadIds.length > 0) {
    await Lead.updateMany(
      { _id: { $in: validLeadIds } },
      { groupId: group._id }
    );
  }

  const populatedGroup = await Group.findById(group._id).populate({
    path: "leads",
    select: "firstName lastName email phone country addresses userPreferences",
  });

  res.status(201).json({
    message: "Group created successfully",
    group: populatedGroup,
  });
});

// Update a group
export const updateGroup = asyncHandler(async (req, res) => {
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
    res.status(404);
    throw new Error("Group not found");
  }

  res.status(200).json({
    message: "Group updated successfully",
    group: updatedGroup,
  });
});

// Delete a group
export const deleteGroup = asyncHandler(async (req, res) => {
  const deletedGroup = await Group.findByIdAndDelete(req.params.id);
  if (!deletedGroup) {
    res.status(404);
    throw new Error("Group not found");
  }
  await Lead.updateMany(
    { groupId: req.params.id },
    { $unset: { groupId: "" } }
  );
  res.status(200).json({
    message: "Group deleted successfully",
    deletedGroup,
  });
});

// Add a single lead to a group
export const addLeadToGroup = asyncHandler(async (req, res) => {
  const { id, leadId } = req.params;

  const group = await Group.findById(id);
  if (!group) {
    res.status(404);
    throw new Error("Group not found");
  }

  const lead = await Lead.findById(leadId);
  if (!lead) {
    res.status(404);
    throw new Error("Lead not found");
  }

  if (group.leads.includes(leadId)) {
    res.status(400);
    throw new Error("Lead is already in this group");
  }

  group.leads.push(leadId);
  await group.save();

  lead.groupId = group._id;
  await lead.save();

  const updatedGroup = await Group.findById(id).populate({
    path: "leads",
    select: "firstName lastName email phone country addresses userPreferences",
  });

  res.status(200).json({
    message: "Lead added successfully",
    group: updatedGroup,
  });
});