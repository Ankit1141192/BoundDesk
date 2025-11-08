const express = require('express');
const router = express.Router();
router.use('/auth', require('./authRoutes'));
router.use('/users', require('./usersRoutes'));
router.use('/teams', require('./teams.Routes'));
router.use('/leads', require('./leadRoutes'));
router.use('/activities', require('./activitiesRoutes'));
module.exports = router;
