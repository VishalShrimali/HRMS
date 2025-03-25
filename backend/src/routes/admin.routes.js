<<<<<<< HEAD

import express from "express";
import { deleteAdmin, GetAdminLogs, GetAdminProfile, LoginAdmin, RegisterAdmin, updateAdmin } from "../controllers/admin.controllers.js";
import { isSuperAdmin, protect } from "../middleware/auth.middlware.js";

const adminRouter  = express.Router();

adminRouter.post('/register', RegisterAdmin)
adminRouter.post('/login', LoginAdmin)
adminRouter.get('/profile', protect, GetAdminProfile)
adminRouter.put('/update/:id',protect, isSuperAdmin, updateAdmin)
adminRouter.delete('/delete/:id', deleteAdmin )
adminRouter.get('/logs', GetAdminLogs )


export { adminRouter }

=======
import express from "express";
import {
  deleteAdmin,
  GetAdminLogs,
  GetAdminProfile,
  GetEmployeeProfileFromAdmin,
  LoginAdmin,
  RegisterAdmin,
  updateAdmin,
  AddLead,
  DeleteLead,
  leadGroup, // Already imported
  GetAllGroups, // New import
} from "../controllers/admin.controllers.js";
import { isSuperAdmin, protect } from "../middleware/auth.middlware.js";

const adminRouter = express.Router();

// Existing Routes
adminRouter.post('/register', RegisterAdmin);
adminRouter.post('/login', LoginAdmin);
adminRouter.post('/groups', protect, isSuperAdmin, leadGroup);
adminRouter.get('/leads', protect, isSuperAdmin, GetEmployeeProfileFromAdmin);
adminRouter.post('/addlead', protect, isSuperAdmin, AddLead);
adminRouter.delete('/leads/:id', protect, isSuperAdmin, DeleteLead);
adminRouter.get('/profile', protect, GetAdminProfile);
adminRouter.put('/update/:id', protect, isSuperAdmin, updateAdmin);
adminRouter.delete('/delete/:id', protect, isSuperAdmin, deleteAdmin);
adminRouter.get('/logs', protect, GetAdminLogs);

// New Route for Fetching Groups
adminRouter.get('/group', protect, GetAllGroups);

export { adminRouter };
>>>>>>> 4b3fab8e72f43f3d569066d42ac00a0ecf096cff
