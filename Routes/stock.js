const express = require("express");
const { stockDetails, getStockDetail } = require("../Controller/stockController");
const router = express.Router();

router.get('/all',stockDetails);
router.get('/', getStockDetail)

module.exports = router;