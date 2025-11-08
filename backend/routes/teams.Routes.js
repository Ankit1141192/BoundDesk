const express = require('express');
const router = express.Router();
const { createTeam, listTeams, getTeam, updateTeam, deleteTeam } = require('../controllers/teamController');
const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');

router.post('/', auth, role(['ADMIN','MANAGER']), createTeam);
router.get('/', auth, listTeams);
router.get('/:id', auth, getTeam);
router.patch('/:id', auth, role(['ADMIN','MANAGER']), updateTeam);
router.delete('/:id', auth, role(['ADMIN']), deleteTeam);

module.exports = router;
