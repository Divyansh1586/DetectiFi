const express = require('express');
const router = express.Router();
const { register, login, googleAuth } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);

module.exports = router;