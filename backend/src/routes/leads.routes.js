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

// Routes
leadsRouter.get('/export', exportLeads); // Export leads (static route)
leadsRouter.post('/importleads', importLeads); // Import leads (static route)

leadsRouter.get('/', (req, res, next) => {
    authorizeRole(["ADMIN"], req, res, next);
}, getLeads); // Get all leads

leadsRouter.get('/:id', (req, res, next) => {
    authorizeRole(["ADMIN"], req, res, next);
}, getLeadById); // Get a single lead by ID



leadsRouter.post('/addlead', createLead); // Create a new lead
leadsRouter.put('/:id', updateLead); // Update a lead by ID

leadsRouter.delete('/:id', (req, res, next) => {
    authorizeRole(["ADMIN"], req, res, next);
}, deleteLead); // Delete a lead by ID

export default leadsRouter;