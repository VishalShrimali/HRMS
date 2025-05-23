import mongoose from "mongoose";


// const userPreferencesSchema = new mongoose.Schema({
//     policy: {
//         type: String,
//         enum: ["active", "nonactive"],
//         default: "active",
//     },
//     whatsappMessageReceive: { type: Boolean, default: false },
//     browserNotifications: { type: Boolean, default: false },
//     emailReceive: { type: Boolean, default: false },
// });



const userSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        fullName: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: true,
            unique: true,
            match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        },
        // phone: {
        //     type: String,
        //     required: true,
        //     match: /^[0-9]{10,15}$/,
        // },
        
        password: { type: String, required: true, minlength: 6 },
        // addresses: [addressSchema],
        // userPreferences: userPreferencesSchema,
        // dates: dateSchema, // Embed the date schema here
        role: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Role", 
            required: true 
        },
        // New fields for hierarchical structure
        parent: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User",
            default: null 
        },
        team: [{ 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User" 
        }],
        level: { 
            type: Number, 
            default: 0 // 0 for Super Admin, 1 for Team Leaders, 2 for Team Members
        },
        isActive: {
            type: Boolean,
            default: true
        },
        lastLogin: { type: Date },
        createdBy: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User",
            required: true 
        },
        // Add fields for password setup invite
        passwordSetupToken: { type: String },
        passwordSetupExpires: { type: Date },
    },
    { timestamps: true }
);

// Hash password before saving
// userSchema.pre("save", async function (next) {
//     if (isModified("password")) {
//         try {
//             const salt = await bcrypt.genSalt(10);
//             this.password =  bcrypt.hashSync(password, salt);
//         } catch (err) {
//             return next(err);
//         }
//     }
//     next();
// });

userSchema.statics.initializeFirstUserAsAdmin = async function () {
    const userCount = await this.countDocuments();
    if (userCount === 1) {
        const firstUser = await this.findOne();
        if (firstUser) {
            const Role = mongoose.model("Role"); // Access Role model
            let adminRole = await Role.findOne({ name: "ADMIN" });

            if (!adminRole) {
                adminRole = await Role.create({
                    name: "ADMIN",
                    permissions: ["*****"], // Default permissions added
                });
            }

            firstUser.role = adminRole._id;
            await firstUser.save();
        }
    }
};

// Add method to check if user can manage another user
userSchema.methods.canManageUser = async function(targetUser) {
    // Super Admin can manage everyone
    if (this.level === 0) return true;
    
    // Team Leaders can only manage their team members
    if (this.level === 1) {
        return this.team.includes(targetUser._id);
    }
    
    // Team Members can't manage anyone
    return false;
};

// Add method to get all users under this user in the hierarchy
userSchema.methods.getSubordinates = async function() {
    const subordinates = [];
    const teamMembers = await this.model('User').find({ _id: { $in: this.team } });
    
    for (const member of teamMembers) {
        subordinates.push(member);
        if (member.level === 1) { // If team leader, get their team members too
            const subTeam = await member.getSubordinates();
            subordinates.push(...subTeam);
        }
    }
    
    return subordinates;
};

// Add method to get all permissions including inherited ones
userSchema.methods.getAllPermissions = async function() {
    const user = await this.populate('role');
    const permissions = new Set(user.role.permissions);
    
    // If not Super Admin, get parent's permissions
    if (this.level > 0 && this.parent) {
        const parent = await this.model('User').findById(this.parent).populate('role');
        if (parent) {
            parent.role.permissions.forEach(p => permissions.add(p));
        }
    }
    
    return Array.from(permissions);
};

const User = mongoose.model("User", userSchema);

// Initialize first user as ADMIN when the model is loaded
User.initializeFirstUserAsAdmin();

export default User;