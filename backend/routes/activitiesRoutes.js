// src/routes/activityRoutes.js
const express = require('express');
const router = express.Router();
const { createActivity, listActivitiesForLead } = require('../controllers/activityController');
const { authMiddleware } = require('../middlewares/auth'); // ensure this file exists (see below)

// Create activity: any logged-in user (controller checks if user can access the lead)
router.post('/', authMiddleware, createActivity);

// List activities for a lead: GET /lead/:leadId
router.get('/lead/:leadId', authMiddleware, listActivitiesForLead);

module.exports = router;
