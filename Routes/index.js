const express = require('express');
const router = express.Router();

router.use('/stock', require('./stock'));
router.use('/user', require('./user'));
router.use('/mutual_funds', require('./mutualFunds'))

module.exports = router;