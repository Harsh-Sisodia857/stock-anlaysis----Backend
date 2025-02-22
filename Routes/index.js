const express = require('express');
const router = express.Router();

router.use('/getStockDetail', require('./stock'));

module.exports = router;