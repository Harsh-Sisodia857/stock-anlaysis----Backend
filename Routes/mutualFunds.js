const express = require("express");
const { mutualFundDetails } = require("../Controller/mutualFundController");
const router = express.Router();

router.get('/', mutualFundDetails);

module.exports = router;