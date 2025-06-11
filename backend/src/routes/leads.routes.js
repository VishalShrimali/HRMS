import express from 'express';
import upload from '../middleware/upload.middleware.js';
import meetingsRouter from './meetings.routes.js';
import policiesRouter from './policies.routes.js';

import {
    getLeads,
    getLeadById,
    createLead,
    updateLead,
    deleteLead,
    exportLeads,
    importLeads,
    generateAnnualReviewPdf,
} from '../controllers/leads.controllers.js';
import { protect } from '../middleware/auth.middlware.js';

const leadsRouter = express.Router();

// Forward subresource routes
leadsRouter.use('/:leadId/meetings', meetingsRouter);
leadsRouter.use('/:id/policies', policiesRouter);

// Routes
leadsRouter.get('/export', protect, exportLeads); // Export leads (static route)
leadsRouter.post('/importleads', importLeads); // Import leads (static route)

leadsRouter.get('/', protect, getLeads); // Get all leads

leadsRouter.get('/:id', protect, getLeadById); // Get a single lead by ID
leadsRouter.get('/:id/annual-review', protect, generateAnnualReviewPdf); // New route for annual review PDF

leadsRouter.post('/', protect, createLead); // Create a new lead
leadsRouter.put('/:id', protect, updateLead); // Update a lead by ID

leadsRouter.delete('/:id', protect, deleteLead); // Delete a lead by ID

export default leadsRouter;