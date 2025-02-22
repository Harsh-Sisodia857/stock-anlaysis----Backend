const express = require("express");
const { stockDetail } = require("../Controller/stockController");
const router = express.Router();

router.get('/',stockDetail);

module.exports = router;