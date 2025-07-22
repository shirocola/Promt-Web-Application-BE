const express = require('express');
const router = express.Router();
const { generateCapcode } = require('../controllers/capcodeController');

// GET route to generate capcode
router.get('/generate', generateCapcode);

module.exports = router;