const express = require('express');
const router = express.Router();

router.get('/me', (req, res) => res.send('User Profile'));

module.exports = router;
