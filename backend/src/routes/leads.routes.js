import express from 'express';
import {
    getLeads,
    getLeadById,
    createLead,
    updateLead,
    deleteLead,
    
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
leadsRouter.get('/',authorizeRole, getLeads); // Get all 
leadsRouter.get('/:id',authorizeRole,getLeadById); // Get a single lead by ID
leadsRouter.post('/addlead', createLead); // Create a new lead
leadsRouter.put('/:id', updateLead); // Update a lead by ID
leadsRouter.delete('/:id', authorizeRole, deleteLead); // Delete a lead by ID
// leadsRouter.get('//pagination', LeadsPagination); // Get leads with pagination

export default leadsRouter;