const express = require('express');
const router = express.Router();

router.use('/stock', require('./stock'));
router.use('/user', require('./user'))

module.exports = router;