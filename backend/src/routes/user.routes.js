import express from "express";
import {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    deleteUser,
    getUsersWithPagination,
    addRoleToUser,
    forgotPassword,
    resetPassword, // Import the new controller
} from "../controllers/user.controllers.js";
import { authorizeRole, protect}  from "../middleware/auth.middlware.js";

const userRouter = express.Router();

// Home Route
userRouter.get('', (req, res) => {
    res.json({
        "fuckoyu": "jeje"
    })
});

// Public Routes
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
// userRouter.post('/role', (req, res) => {
//     res.json("Hello");
// })

userRouter.post('/role', (req, res, next) => {
    authorizeRole(["ADMIN", "Super Admin"], req, res, next);
}, (req, res) => {
    addRoleToUser(req, res);
});

// Protected Routes
// userRouter.get('/leads',  (req, res, next) => {
//     console.log("AuthorizeRole middleware triggered");
//      authorizeRole(["ADMIN"], req, res, next);
// }, (req, res) => {
//     console.log("addRoleToUser controller triggered");
//     GetEmployeeProfileFromAdmin(req, res)} ); // Fetching leads for admin

userRouter.get('/profile', protect, getUserProfile);
userRouter.put('/profile', protect, updateUserProfile);
userRouter.delete('/delete', protect, deleteUser);
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/reset-password', resetPassword);
userRouter.get('/list', (req, res, next) => {
    authorizeRole(["ADMIN", "Super Admin"], req, res, next);
}, (req, res) => {
    getUsersWithPagination(req, res);
});

// // Admin and HR Admin Routes
// userRouter.get('/', protect, (req, res, next) => authorizeRole(["HR Admin", "Super Admin"], req, res, next), getAllUsers);
// userRouter.get('/:id', protect, (req, res, next) => authorizeRole(["HR Admin", "Super Admin"], req, res, next), getUserById);
// userRouter.put('/role/:id', protect, (req, res, next) => authorizeRole(["Super Admin"], req, res, next), updateUserRole);

export { userRouter };
