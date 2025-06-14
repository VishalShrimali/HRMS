import User from "../models/user.model.js";
import { Role } from "../models/role.models.js";
import { ApiError } from "../utils/ApiError.js";
import { sendEmail } from "../utils/email.utils.js";
import crypto from "crypto";

// Create a new team member
export const createTeamMember = async (req, res) => {
    try {
        console.log("createTeamMember called");
        console.log("Request body:", req.body);
        console.log("Authenticated user:", req.user);

        const { firstName, lastName, email, roleId } = req.body;
        const creator = req.user;

        console.log("Creator's role in createTeamMember:", creator.role);
        // Validate creator's permissions
        const creatorPermissions = await creator.getAllPermissions();
        console.log("Creator's permissions in createTeamMember:", creatorPermissions);

        if (!creatorPermissions.includes("create_team_member")) {
            throw new ApiError(403, "You don't have permission to create team members");
        }

        // Get the role to be assigned
        const role = await Role.findById(roleId);
        if (!role) {
            throw new ApiError(404, "Role not found");
        }

        // Check if creator can assign this role
        if (!role.canBeAssignedBy(creator.role)) {
            throw new ApiError(403, "You don't have permission to assign this role");
        }

        // Generate password setup token
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Create the new user (no password)
        const newUser = await User.create({
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`,
            email,
            password: 'TEMP_PASSWORD_123', // Changed from 'TEMP' to meet minimum length requirement
            role: roleId,
            parent: creator._id,
            level: role.level,
            createdBy: creator._id,
            passwordSetupToken: token,
            passwordSetupExpires: expires
        });

        // Add to creator's team
        creator.team.push(newUser._id);
        await creator.save();

        // Send invite email
        const setPasswordUrl = `${process.env.FRONTEND_URL}/set-password?token=${token}`;
        await sendEmail(
            email,
            'Set up your account',
            `You have been invited to join the team. Set your password here: ${setPasswordUrl}`,
            `<p>You have been invited to join the team. <a href="${setPasswordUrl}">Click here to set your password</a>.</p>`
        );

        // Remove password from response
        const userResponse = newUser.toObject();
        delete userResponse.password;
        delete userResponse.passwordSetupToken;
        delete userResponse.passwordSetupExpires;

        res.status(201).json({
            success: true,
            message: "Team member invited successfully",
            user: userResponse
        });
    } catch (error) {
        console.error("Error in createTeamMember:", error);
        return res.status(500).json({ message: error.message });
    }
};

// Get team members
export const getTeamMembers = async (req, res) => {
    try {
        const user = req.user;
        
        // Get all subordinates
        const subordinates = await user.getSubordinates();
        
        // Add the team leader to the list
        const teamMembers = [
            {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                roleName: user.roleName
            },
            ...subordinates.map(member => {
                const memberObj = member.toObject();
                delete memberObj.password;
                return memberObj;
            })
        ];

        res.status(200).json({
            success: true,
            teamMembers
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

// Update team member
export const updateTeamMember = async (req, res) => {
    try {
        const { userId } = req.params;
        const updates = req.body;
        const updater = req.user;

        // Get the user to be updated
        const userToUpdate = await User.findById(userId);
        if (!userToUpdate) {
            throw new ApiError(404, "User not found");
        }

        // Check if updater has permission to manage this user
        if (!await updater.canManageUser(userToUpdate)) {
            throw new ApiError(403, "You don't have permission to update this user");
        }

        // If role is being updated, validate the new role
        if (updates.role) {
            const newRole = await Role.findById(updates.role);
            if (!newRole) {
                throw new ApiError(404, "Role not found");
            }
            if (!newRole.canBeAssignedBy(await Role.findById(updater.role))) {
                throw new ApiError(403, "You don't have permission to assign this role");
            }
            updates.level = newRole.level;
        }

        // Update the user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: "Team member updated successfully",
            user: updatedUser
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

// Remove team member
export const removeTeamMember = async (req, res) => {
    try {
        const { userId } = req.params;
        const remover = req.user;

        // Get the user to be removed
        const userToRemove = await User.findById(userId);
        if (!userToRemove) {
            throw new ApiError(404, "User not found");
        }

        // Check if remover has permission to manage this user
        if (!await remover.canManageUser(userToRemove)) {
            throw new ApiError(403, "You don't have permission to remove this user");
        }

        // Remove from parent's team
        const parent = await User.findById(userToRemove.parent);
        if (parent) {
            parent.team = parent.team.filter(id => id.toString() !== userId);
            await parent.save();
        }

        // Update all team members under this user to have the remover as parent
        if (userToRemove.team.length > 0) {
            await User.updateMany(
                { _id: { $in: userToRemove.team } },
                { 
                    $set: { 
                        parent: remover._id,
                        level: remover.level + 1
                    }
                }
            );
            
            // Add these users to remover's team
            remover.team.push(...userToRemove.team);
            await remover.save();
        }

        // Delete the user
        await User.findByIdAndDelete(userId);

        res.status(200).json({
            success: true,
            message: "Team member removed successfully"
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

// Get team hierarchy
export const getTeamHierarchy = async (req, res) => {
    try {
        const user = req.user;
        
        // Get all users in the hierarchy
        const buildHierarchy = async (userId) => {
            const user = await User.findById(userId)
                .select('-password')
                .populate('role', 'name level');
            
            if (!user) return null;
            
            const teamMembers = await User.find({ parent: userId })
                .select('-password')
                .populate('role', 'name level');
            
            const children = await Promise.all(
                teamMembers.map(member => buildHierarchy(member._id))
            );
            
            return {
                ...user.toObject(),
                team: children.filter(Boolean)
            };
        };
        
        const hierarchy = await buildHierarchy(user._id);
        
        res.status(200).json({
            success: true,
            hierarchy
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};