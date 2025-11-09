const express = require('express');
const router = express.Router();
const { createActivity, listActivitiesForLead } = require('../controllers/activityController');
const { authMiddleware, authorizeRoles } = require('../middlewares/auth'); // fixed import

// Create activity: any logged-in user (controller checks if user can access the lead)
router.post('/', authMiddleware, createActivity);

// List activities for a lead: any logged-in user (controller checks if user can access the lead)
router.get('/lead/:leadId', authMiddleware, listActivitiesForLead);

module.exports = router;
