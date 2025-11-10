const express = require('express');
const router = express.Router();

// ensure these files exist in the same folder (routes/)
router.use('/auth', require('./authRoutes'));
router.use('/users', require('./usersRoutes'));
router.use('/teams', require('./teams.Routes'));
router.use('/leads', require('./leadRoutes'));
router.use('/activities', require('./activitiesRoutes'));

module.exports = router;
