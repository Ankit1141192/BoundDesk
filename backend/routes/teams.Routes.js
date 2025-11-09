const express = require('express');
const router = express.Router();
const { createTeam, listTeams, getTeam, updateTeam, deleteTeam } = require('../controllers/teamController');
const { authMiddleware, authorizeRoles } = require('../middlewares/auth'); // fixed import

// Routes
router.post('/', authMiddleware, authorizeRoles(['ADMIN', 'MANAGER']), createTeam);
router.get('/', authMiddleware, listTeams); // any logged-in user can list teams
router.get('/:id', authMiddleware, getTeam); // any logged-in user can get a team
router.patch('/:id', authMiddleware, authorizeRoles(['ADMIN', 'MANAGER']), updateTeam);
router.delete('/:id', authMiddleware, authorizeRoles(['ADMIN']), deleteTeam);

module.exports = router;
