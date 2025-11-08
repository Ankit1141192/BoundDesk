const express = require('express');
const router = express.Router();
const { createLead, listLeads, getLead, updateLead, deleteLead } = require('../controllers/leadController');
const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');

router.post('/', auth, role(['ADMIN','MANAGER','SALES_EXECUTIVE']), createLead);
router.get('/', auth, listLeads);
router.get('/:id', auth, getLead);
router.patch('/:id', auth, updateLead);
router.delete('/:id', auth, role(['ADMIN','MANAGER']), deleteLead);

module.exports = router;
