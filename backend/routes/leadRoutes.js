const express = require('express');
const router = express.Router();
const { createLead, listLeads, getLead, updateLead, deleteLead } = require('../controllers/leadController');
const { authMiddleware, authorizeRoles } = require('../middlewares/auth'); // fixed import

// Create lead: Admin, Manager, Sales can create
router.post('/', authMiddleware, authorizeRoles(['ADMIN','MANAGER','SALES_EXECUTIVE']), createLead);

// List leads: any logged-in user can list (role filtering happens in controller)
router.get('/', authMiddleware, listLeads);

// Get single lead: any logged-in user (controller handles role access)
router.get('/:id', authMiddleware, getLead);

// Update lead: Admin, Manager, Sales (controller checks ownership)
router.patch('/:id', authMiddleware, updateLead);

// Delete lead: only Admin and Manager can delete
router.delete('/:id', authMiddleware, authorizeRoles(['ADMIN','MANAGER']), deleteLead);

module.exports = router;
