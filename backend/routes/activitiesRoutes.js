const express = require('express');
const router = express.Router();
const { createActivity, listActivitiesForLead } = require('../controllers/activityController');
const auth = require('../middlewares/authMiddleware');

router.post('/', auth, createActivity);
router.get('/lead/:leadId', auth, listActivitiesForLead);

module.exports = router;
