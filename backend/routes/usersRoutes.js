const express = require('express');
const router = express.Router();
const { me, listUsers, updateUser } = require('../controllers/userController');
const { authMiddleware, authorizeRoles } = require('../middlewares/auth'); // fixed import

// Routes
router.get('/me', authMiddleware, me); // any logged-in user
router.get('/', authMiddleware, authorizeRoles(['ADMIN']), listUsers); // only admin
router.patch('/:id', authMiddleware, updateUser); // admin or self

module.exports = router;
