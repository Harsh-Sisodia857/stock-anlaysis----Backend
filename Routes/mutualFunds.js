const express = require("express");
const { mutualFundDetails, getMutualFund } = require("../Controller/mutualFundController");
const router = express.Router();

router.get('/', mutualFundDetails);
router.get('/:name',getMutualFund)

module.exports = router;