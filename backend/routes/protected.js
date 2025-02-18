const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

router.get('/protected', auth, (req, res) => {
    res.json({ msg: 'This is a protected route', user: req.user });
});

module.exports = router;

