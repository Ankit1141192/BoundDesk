const express = require('express');
const router = express.Router();
const { me, listUsers, updateUser } = require('../controllers/userController');
const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');

router.get('/me', auth, me);
router.get('/', auth, role(['ADMIN']), listUsers);
router.patch('/:id', auth, updateUser);

module.exports = router;
