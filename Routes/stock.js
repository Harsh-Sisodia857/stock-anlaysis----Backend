const express = require("express");
const { stockDetails } = require("../Controller/stockController");
const router = express.Router();

router.get('/all',stockDetails);

module.exports = router;