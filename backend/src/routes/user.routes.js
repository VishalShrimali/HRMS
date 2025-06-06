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
    resetPassword,
    getAllUsersWithFirstNameLastNameId,
    setPassword
} from "../controllers/user.controllers.js";
import { protect } from "../middleware/auth.middlware.js";

const userRouter = express.Router();

// Home Route
userRouter.get('', (req, res) => {
    res.json({
        "fuckoyu": "jeje"
    })
});

// Public Routes
userRouter.post('/login', loginUser);
userRouter.post('/register', registerUser); // Now handles both public and protected registration

// Protected Routes
userRouter.get('/profile', protect, getUserProfile);
userRouter.put('/profile', protect, updateUserProfile);
userRouter.delete('/:id', protect, deleteUser);
userRouter.get('/paginated', protect, getUsersWithPagination);
userRouter.post('/role', protect, addRoleToUser);
userRouter.get('/all-names', protect, getAllUsersWithFirstNameLastNameId);

// Password Management Routes
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/reset-password', resetPassword);
userRouter.post('/set-password', setPassword);

export default userRouter;
