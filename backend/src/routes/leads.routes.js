import express from 'express';
import upload from '../middleware/upload.middleware.js';

import {
    getLeads,
    getLeadById,
    createLead,
    updateLead,
    deleteLead,
     exportLeads,
    importLeads,
    
} from '../controllers/leads.controllers.js';
import { authorizeRole } from '../middleware/auth.middlware.js';

const leadsRouter = express.Router();

// Middleware for role-based access control
// const checkAdminRole = (req, res, next) => {
//     const token = req.headers.authorization?.split(" ")[1];
//     if (!token) {
//         return res.status(403).json({ message: "Access denied. No token provided." });
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
//         if (decoded.role !== "admin") {
//             return res.status(403).json({ message: "Access denied. Admins only." });
//         }
//         next();
//     } catch (error) {
//         return res.status(403).json({ message: "Invalid token." });
//     }
// };

// Routes
leadsRouter.get('/', (req, res, next) => {
    authorizeRole(["ADMIN"], req, res, next);
}, getLeads); // Get all 

leadsRouter.get('/:id', (req, res, next) => {
    authorizeRole(["ADMIN"], req, res, next);
}, getLeadById); // Get a single lead by ID

leadsRouter.post('/addlead', createLead); // Create a new lead
leadsRouter.post('/importleads', upload.single('file'), importLeads); // Create a new lead
leadsRouter.get('/export', exportLeads)
leadsRouter.put('/:id', updateLead); // Update a lead by ID

leadsRouter.delete('/:id', (req, res, next) => {
    authorizeRole(["ADMIN"], req, res, next);
}, deleteLead); // Delete a lead by ID

// leadsRouter.get('//pagination', LeadsPagination); // Get leads with pagination

export default leadsRouter;