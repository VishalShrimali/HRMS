
import express from "express";
import { deleteAdmin, GetAdminProfile, LoginAdmin, RegisterAdmin, updateAdmin } from "../controllers/admin.controllers.js";
import { isSuperAdmin, protect } from "../middleware/auth.middlware.js";
const adminRouter  = express.Router();

adminRouter.post('/register', RegisterAdmin)
adminRouter.post('/login', LoginAdmin)
adminRouter.get('/profile', protect, GetAdminProfile)
adminRouter.put('/update/:id',protect, isSuperAdmin, updateAdmin)
adminRouter.delete('/delete/:id', deleteAdmin )
// adminRouter.get('/admin/logs', )


export { adminRouter }

